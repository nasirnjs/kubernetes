package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strings"

	"github.com/nasirnjs/ecommerce/shipping-service/internal/model"
	"github.com/nasirnjs/ecommerce/shipping-service/internal/repository"
)

var (
	ErrInvalidInput      = errors.New("invalid input")
	ErrShipmentNotFound  = errors.New("shipment not found")
	ErrForbidden         = errors.New("forbidden")
	ErrInvalidTransition = errors.New("invalid status transition")
)

type ShipmentService struct {
	repo *repository.ShipmentRepository
}

func NewShipmentService(repo *repository.ShipmentRepository) *ShipmentService {
	return &ShipmentService{repo: repo}
}

type CreateInput struct {
	OrderID int64
	Address string
}

func (s *ShipmentService) Create(ctx context.Context, userID int64, in CreateInput) (*model.Shipment, error) {
	addr := strings.TrimSpace(in.Address)
	if in.OrderID <= 0 || addr == "" {
		return nil, ErrInvalidInput
	}
	sh := &model.Shipment{
		OrderID:        in.OrderID,
		UserID:         userID,
		Address:        addr,
		Status:         model.StatusPending,
		TrackingNumber: "TRK-" + randomHex(10),
	}
	if err := s.repo.Create(ctx, sh); err != nil {
		return nil, err
	}
	return sh, nil
}

func (s *ShipmentService) GetByID(ctx context.Context, userID, id int64) (*model.Shipment, error) {
	sh, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrShipmentNotFound
		}
		return nil, err
	}
	if sh.UserID != userID {
		return nil, ErrForbidden
	}
	return sh, nil
}

func (s *ShipmentService) ListByUser(ctx context.Context, userID, orderID int64, limit, offset int) ([]*model.Shipment, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.repo.ListByUser(ctx, userID, orderID, limit, offset)
}

func (s *ShipmentService) UpdateStatus(ctx context.Context, userID, id int64, newStatus model.ShipmentStatus) (*model.Shipment, error) {
	if !model.IsValidStatus(newStatus) {
		return nil, ErrInvalidInput
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrShipmentNotFound
		}
		return nil, err
	}
	if current.UserID != userID {
		return nil, ErrForbidden
	}
	if !current.Status.CanTransition(newStatus) {
		return nil, ErrInvalidTransition
	}
	updated, err := s.repo.UpdateStatus(ctx, id, current.Status, newStatus)
	if err != nil {
		if errors.Is(err, repository.ErrInvalidTransition) {
			return nil, ErrInvalidTransition
		}
		return nil, err
	}
	return updated, nil
}

func randomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return strings.ToUpper(hex.EncodeToString(b))[:n]
}
