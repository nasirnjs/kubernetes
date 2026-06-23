package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nasirnjs/ecommerce/notification-service/internal/model"
)

var ErrNotFound = errors.New("notification not found")

type NotificationRepository struct {
	pool *pgxpool.Pool
}

func NewNotificationRepository(pool *pgxpool.Pool) *NotificationRepository {
	return &NotificationRepository{pool: pool}
}

func (r *NotificationRepository) Create(ctx context.Context, n *model.Notification) error {
	const q = `
		INSERT INTO notifications (user_id, channel, subject, body, status)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at`
	return r.pool.QueryRow(ctx, q, n.UserID, n.Channel, n.Subject, n.Body, n.Status).
		Scan(&n.ID, &n.CreatedAt)
}

func (r *NotificationRepository) GetByID(ctx context.Context, id int64) (*model.Notification, error) {
	const q = `
		SELECT id, user_id, channel, subject, body, status, created_at
		FROM notifications WHERE id = $1`
	n := &model.Notification{}
	err := r.pool.QueryRow(ctx, q, id).
		Scan(&n.ID, &n.UserID, &n.Channel, &n.Subject, &n.Body, &n.Status, &n.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return n, nil
}

func (r *NotificationRepository) ListByUser(ctx context.Context, userID int64, limit, offset int) ([]*model.Notification, error) {
	const q = `
		SELECT id, user_id, channel, subject, body, status, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY id DESC LIMIT $2 OFFSET $3`
	rows, err := r.pool.Query(ctx, q, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.Notification, 0, limit)
	for rows.Next() {
		n := &model.Notification{}
		if err := rows.Scan(&n.ID, &n.UserID, &n.Channel, &n.Subject, &n.Body, &n.Status, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}
