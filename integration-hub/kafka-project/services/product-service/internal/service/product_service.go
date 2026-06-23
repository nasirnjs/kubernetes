package service

import (
	"context"
	"errors"
	"strings"

	"github.com/nasirnjs/ecommerce/product-service/internal/model"
	"github.com/nasirnjs/ecommerce/product-service/internal/repository"
)

var (
	ErrInvalidInput      = errors.New("invalid input")
	ErrProductNotFound   = errors.New("product not found")
	ErrSKUExists         = errors.New("sku already exists")
	ErrInsufficientStock = errors.New("insufficient stock")
)

type ProductService struct {
	repo *repository.ProductRepository
}

func NewProductService(repo *repository.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

type CreateInput struct {
	SKU         string
	Name        string
	Description string
	PriceCents  int64
	Stock       int32
}

func (s *ProductService) Create(ctx context.Context, in CreateInput) (*model.Product, error) {
	sku := strings.TrimSpace(in.SKU)
	name := strings.TrimSpace(in.Name)
	if sku == "" || name == "" {
		return nil, ErrInvalidInput
	}
	if in.PriceCents < 0 || in.Stock < 0 {
		return nil, ErrInvalidInput
	}

	p := &model.Product{
		SKU:         sku,
		Name:        name,
		Description: strings.TrimSpace(in.Description),
		PriceCents:  in.PriceCents,
		Stock:       in.Stock,
	}
	if err := s.repo.Create(ctx, p); err != nil {
		if errors.Is(err, repository.ErrDuplicateSKU) {
			return nil, ErrSKUExists
		}
		return nil, err
	}
	return p, nil
}

func (s *ProductService) GetByID(ctx context.Context, id int64) (*model.Product, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	return p, nil
}

func (s *ProductService) List(ctx context.Context, limit, offset int) ([]*model.Product, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.repo.List(ctx, limit, offset)
}

func (s *ProductService) AdjustStock(ctx context.Context, id int64, delta int32) (*model.Product, error) {
	if delta == 0 {
		return nil, ErrInvalidInput
	}
	p, err := s.repo.AdjustStock(ctx, id, delta)
	if err != nil {
		switch {
		case errors.Is(err, repository.ErrNotFound):
			return nil, ErrProductNotFound
		case errors.Is(err, repository.ErrInsufficientStock):
			return nil, ErrInsufficientStock
		default:
			return nil, err
		}
	}
	return p, nil
}
