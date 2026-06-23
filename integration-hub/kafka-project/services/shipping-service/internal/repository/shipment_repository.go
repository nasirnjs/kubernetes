package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nasirnjs/ecommerce/shipping-service/internal/model"
)

var (
	ErrNotFound          = errors.New("shipment not found")
	ErrInvalidTransition = errors.New("invalid status transition")
)

type ShipmentRepository struct {
	pool *pgxpool.Pool
}

func NewShipmentRepository(pool *pgxpool.Pool) *ShipmentRepository {
	return &ShipmentRepository{pool: pool}
}

func (r *ShipmentRepository) Create(ctx context.Context, s *model.Shipment) error {
	const q = `
		INSERT INTO shipments (order_id, user_id, address, status, tracking_number)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`
	return r.pool.QueryRow(ctx, q, s.OrderID, s.UserID, s.Address, s.Status, s.TrackingNumber).
		Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
}

func (r *ShipmentRepository) GetByID(ctx context.Context, id int64) (*model.Shipment, error) {
	const q = `
		SELECT id, order_id, user_id, address, status, tracking_number, created_at, updated_at
		FROM shipments WHERE id = $1`
	s := &model.Shipment{}
	err := r.pool.QueryRow(ctx, q, id).
		Scan(&s.ID, &s.OrderID, &s.UserID, &s.Address, &s.Status, &s.TrackingNumber, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return s, nil
}

func (r *ShipmentRepository) ListByUser(ctx context.Context, userID, orderID int64, limit, offset int) ([]*model.Shipment, error) {
	var rows pgx.Rows
	var err error
	if orderID > 0 {
		rows, err = r.pool.Query(ctx, `
			SELECT id, order_id, user_id, address, status, tracking_number, created_at, updated_at
			FROM shipments WHERE user_id = $1 AND order_id = $2
			ORDER BY id DESC LIMIT $3 OFFSET $4`, userID, orderID, limit, offset)
	} else {
		rows, err = r.pool.Query(ctx, `
			SELECT id, order_id, user_id, address, status, tracking_number, created_at, updated_at
			FROM shipments WHERE user_id = $1
			ORDER BY id DESC LIMIT $2 OFFSET $3`, userID, limit, offset)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.Shipment, 0, limit)
	for rows.Next() {
		s := &model.Shipment{}
		if err := rows.Scan(&s.ID, &s.OrderID, &s.UserID, &s.Address, &s.Status,
			&s.TrackingNumber, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func (r *ShipmentRepository) UpdateStatus(ctx context.Context, id int64, fromStatus, toStatus model.ShipmentStatus) (*model.Shipment, error) {
	const q = `
		UPDATE shipments
		SET status = $3, updated_at = NOW()
		WHERE id = $1 AND status = $2
		RETURNING id, order_id, user_id, address, status, tracking_number, created_at, updated_at`
	s := &model.Shipment{}
	err := r.pool.QueryRow(ctx, q, id, fromStatus, toStatus).
		Scan(&s.ID, &s.OrderID, &s.UserID, &s.Address, &s.Status, &s.TrackingNumber, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrInvalidTransition
		}
		return nil, err
	}
	return s, nil
}
