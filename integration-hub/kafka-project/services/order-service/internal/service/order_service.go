package service

import (
	"context"
	"errors"
	"log"

	"github.com/nasirnjs/ecommerce/order-service/internal/client"
	"github.com/nasirnjs/ecommerce/order-service/internal/model"
	"github.com/nasirnjs/ecommerce/order-service/internal/repository"
)

var (
	ErrInvalidInput      = errors.New("invalid input")
	ErrProductNotFound   = errors.New("product not found")
	ErrInsufficientStock = errors.New("insufficient stock")
	ErrOrderNotFound     = errors.New("order not found")
	ErrForbidden         = errors.New("forbidden")
	ErrInvalidTransition = errors.New("invalid status transition")
)

type OrderService struct {
	repo          *repository.OrderRepository
	productClient *client.ProductClient
}

func NewOrderService(repo *repository.OrderRepository, productClient *client.ProductClient) *OrderService {
	return &OrderService{repo: repo, productClient: productClient}
}

type CreateItem struct {
	ProductID int64 `json:"product_id"`
	Quantity  int32 `json:"quantity"`
}

type CreateInput struct {
	Items []CreateItem
}

// Create orchestrates: snapshot products → reserve stock → persist order.
// Phase 1 uses synchronous orchestration with compensating actions on failure.
// Phase 2 will move stock reservation to a Kafka saga.
func (s *OrderService) Create(ctx context.Context, userID int64, jwt string, in CreateInput) (*model.Order, error) {
	if len(in.Items) == 0 {
		return nil, ErrInvalidInput
	}

	// 1. Fetch product snapshot and compute totals.
	items := make([]model.OrderItem, 0, len(in.Items))
	var total int64
	for _, it := range in.Items {
		if it.Quantity <= 0 || it.ProductID <= 0 {
			return nil, ErrInvalidInput
		}
		p, err := s.productClient.Get(ctx, it.ProductID)
		if err != nil {
			if errors.Is(err, client.ErrProductNotFound) {
				return nil, ErrProductNotFound
			}
			return nil, err
		}
		lineTotal := p.PriceCents * int64(it.Quantity)
		items = append(items, model.OrderItem{
			ProductID:      p.ID,
			SKU:            p.SKU,
			Name:           p.Name,
			UnitPriceCents: p.PriceCents,
			Quantity:       it.Quantity,
			LineTotalCents: lineTotal,
		})
		total += lineTotal
	}

	// 2. Reserve stock (atomic decrement per product, with compensation on failure).
	reserved := make([]model.OrderItem, 0, len(items))
	for _, it := range items {
		if _, err := s.productClient.AdjustStock(ctx, it.ProductID, -it.Quantity, jwt); err != nil {
			s.compensateStock(reserved, jwt)
			switch {
			case errors.Is(err, client.ErrInsufficientStock):
				return nil, ErrInsufficientStock
			case errors.Is(err, client.ErrProductNotFound):
				return nil, ErrProductNotFound
			default:
				return nil, err
			}
		}
		reserved = append(reserved, it)
	}

	// 3. Persist order. If DB write fails, restore stock.
	order := &model.Order{
		UserID:     userID,
		Status:     model.StatusCreated,
		TotalCents: total,
	}
	if err := s.repo.CreateWithItems(ctx, order, items); err != nil {
		s.compensateStock(reserved, jwt)
		return nil, err
	}
	order.Items = items
	return order, nil
}

// compensateStock returns previously-reserved stock. Best-effort; logs but does
// not bubble errors, since the caller has already failed and the user needs
// a deterministic response. Stranded stock requires manual reconciliation —
// this is the Phase 1 limitation that Kafka sagas fix.
func (s *OrderService) compensateStock(reserved []model.OrderItem, jwt string) {
	for _, it := range reserved {
		if _, err := s.productClient.AdjustStock(context.Background(), it.ProductID, it.Quantity, jwt); err != nil {
			log.Printf("STOCK COMPENSATION FAILED product_id=%d qty=%d err=%v (manual fix required)",
				it.ProductID, it.Quantity, err)
		}
	}
}

func (s *OrderService) GetByID(ctx context.Context, userID, orderID int64) (*model.Order, error) {
	o, err := s.repo.GetByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	if o.UserID != userID {
		return nil, ErrForbidden
	}
	return o, nil
}

func (s *OrderService) ListByUser(ctx context.Context, userID int64, limit, offset int) ([]*model.Order, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.repo.ListByUser(ctx, userID, limit, offset)
}

func (s *OrderService) UpdateStatus(ctx context.Context, userID, orderID int64, newStatus model.OrderStatus) (*model.Order, error) {
	if !model.IsValidStatus(newStatus) {
		return nil, ErrInvalidInput
	}
	current, err := s.repo.GetByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	if current.UserID != userID {
		return nil, ErrForbidden
	}
	if !current.Status.CanTransition(newStatus) {
		return nil, ErrInvalidTransition
	}
	updated, err := s.repo.UpdateStatus(ctx, orderID, current.Status, newStatus)
	if err != nil {
		if errors.Is(err, repository.ErrInvalidTransition) {
			return nil, ErrInvalidTransition // raced with another update
		}
		return nil, err
	}
	return updated, nil
}
