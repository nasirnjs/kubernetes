package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"

	"github.com/nasirnjs/ecommerce/payment-service/internal/model"
	"github.com/nasirnjs/ecommerce/payment-service/internal/repository"
)

var (
	ErrInvalidInput    = errors.New("invalid input")
	ErrPaymentNotFound = errors.New("payment not found")
	ErrForbidden       = errors.New("forbidden")
)

type PaymentService struct {
	repo *repository.PaymentRepository
}

func NewPaymentService(repo *repository.PaymentRepository) *PaymentService {
	return &PaymentService{repo: repo}
}

type ProcessInput struct {
	OrderID     int64
	AmountCents int64
}

// Process is a MOCK. Any positive amount succeeds. amount=0 is rejected.
// A deterministic failure mode is included for testing failure paths:
// amounts ending in 13 cents (e.g. 1013, 9913) return status="failed".
func (s *PaymentService) Process(ctx context.Context, userID int64, in ProcessInput) (*model.Payment, error) {
	if in.AmountCents <= 0 || in.OrderID <= 0 {
		return nil, ErrInvalidInput
	}

	status := model.StatusSucceeded
	if in.AmountCents%100 == 13 {
		status = model.StatusFailed
	}

	p := &model.Payment{
		OrderID:     in.OrderID,
		UserID:      userID,
		AmountCents: in.AmountCents,
		Status:      status,
		ProviderRef: "MOCK-" + randomHex(8),
	}
	if err := s.repo.Create(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *PaymentService) GetByID(ctx context.Context, userID, id int64) (*model.Payment, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrPaymentNotFound
		}
		return nil, err
	}
	if p.UserID != userID {
		return nil, ErrForbidden
	}
	return p, nil
}

func (s *PaymentService) ListByUser(ctx context.Context, userID, orderID int64, limit, offset int) ([]*model.Payment, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.repo.ListByUser(ctx, userID, orderID, limit, offset)
}

func randomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
