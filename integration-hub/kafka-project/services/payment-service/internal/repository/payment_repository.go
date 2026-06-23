package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nasirnjs/ecommerce/payment-service/internal/model"
)

var ErrNotFound = errors.New("payment not found")

type PaymentRepository struct {
	pool *pgxpool.Pool
}

func NewPaymentRepository(pool *pgxpool.Pool) *PaymentRepository {
	return &PaymentRepository{pool: pool}
}

func (r *PaymentRepository) Create(ctx context.Context, p *model.Payment) error {
	const q = `
		INSERT INTO payments (order_id, user_id, amount_cents, status, provider_ref)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`
	return r.pool.QueryRow(ctx, q, p.OrderID, p.UserID, p.AmountCents, p.Status, p.ProviderRef).
		Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
}

func (r *PaymentRepository) GetByID(ctx context.Context, id int64) (*model.Payment, error) {
	const q = `
		SELECT id, order_id, user_id, amount_cents, status, provider_ref, created_at, updated_at
		FROM payments WHERE id = $1`
	p := &model.Payment{}
	err := r.pool.QueryRow(ctx, q, id).
		Scan(&p.ID, &p.OrderID, &p.UserID, &p.AmountCents, &p.Status, &p.ProviderRef, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return p, nil
}

func (r *PaymentRepository) ListByUser(ctx context.Context, userID int64, orderID int64, limit, offset int) ([]*model.Payment, error) {
	var rows pgx.Rows
	var err error
	if orderID > 0 {
		rows, err = r.pool.Query(ctx, `
			SELECT id, order_id, user_id, amount_cents, status, provider_ref, created_at, updated_at
			FROM payments
			WHERE user_id = $1 AND order_id = $2
			ORDER BY id DESC LIMIT $3 OFFSET $4`, userID, orderID, limit, offset)
	} else {
		rows, err = r.pool.Query(ctx, `
			SELECT id, order_id, user_id, amount_cents, status, provider_ref, created_at, updated_at
			FROM payments
			WHERE user_id = $1
			ORDER BY id DESC LIMIT $2 OFFSET $3`, userID, limit, offset)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.Payment, 0, limit)
	for rows.Next() {
		p := &model.Payment{}
		if err := rows.Scan(&p.ID, &p.OrderID, &p.UserID, &p.AmountCents,
			&p.Status, &p.ProviderRef, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}
