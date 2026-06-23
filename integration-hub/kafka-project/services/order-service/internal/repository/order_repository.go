package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nasirnjs/ecommerce/order-service/internal/model"
)

var (
	ErrNotFound          = errors.New("order not found")
	ErrInvalidTransition = errors.New("invalid status transition")
)

type OrderRepository struct {
	pool *pgxpool.Pool
}

func NewOrderRepository(pool *pgxpool.Pool) *OrderRepository {
	return &OrderRepository{pool: pool}
}

// CreateWithItems inserts the order and all items in a single transaction.
func (r *OrderRepository) CreateWithItems(ctx context.Context, o *model.Order, items []model.OrderItem) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	const insertOrder = `
		INSERT INTO orders (user_id, status, total_cents)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at`
	if err := tx.QueryRow(ctx, insertOrder, o.UserID, o.Status, o.TotalCents).
		Scan(&o.ID, &o.CreatedAt, &o.UpdatedAt); err != nil {
		return err
	}

	const insertItem = `
		INSERT INTO order_items
			(order_id, product_id, sku, name, unit_price_cents, quantity, line_total_cents)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id`
	for i := range items {
		items[i].OrderID = o.ID
		if err := tx.QueryRow(ctx, insertItem,
			items[i].OrderID, items[i].ProductID, items[i].SKU, items[i].Name,
			items[i].UnitPriceCents, items[i].Quantity, items[i].LineTotalCents,
		).Scan(&items[i].ID); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *OrderRepository) GetByID(ctx context.Context, id int64) (*model.Order, error) {
	const orderQ = `
		SELECT id, user_id, status, total_cents, created_at, updated_at
		FROM orders WHERE id = $1`
	o := &model.Order{}
	err := r.pool.QueryRow(ctx, orderQ, id).
		Scan(&o.ID, &o.UserID, &o.Status, &o.TotalCents, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	const itemsQ = `
		SELECT id, order_id, product_id, sku, name, unit_price_cents, quantity, line_total_cents
		FROM order_items WHERE order_id = $1 ORDER BY id`
	rows, err := r.pool.Query(ctx, itemsQ, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var it model.OrderItem
		if err := rows.Scan(&it.ID, &it.OrderID, &it.ProductID, &it.SKU, &it.Name,
			&it.UnitPriceCents, &it.Quantity, &it.LineTotalCents); err != nil {
			return nil, err
		}
		o.Items = append(o.Items, it)
	}
	return o, rows.Err()
}

func (r *OrderRepository) ListByUser(ctx context.Context, userID int64, limit, offset int) ([]*model.Order, error) {
	const q = `
		SELECT id, user_id, status, total_cents, created_at, updated_at
		FROM orders
		WHERE user_id = $1
		ORDER BY id DESC
		LIMIT $2 OFFSET $3`
	rows, err := r.pool.Query(ctx, q, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.Order, 0, limit)
	for rows.Next() {
		o := &model.Order{}
		if err := rows.Scan(&o.ID, &o.UserID, &o.Status, &o.TotalCents, &o.CreatedAt, &o.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}

// UpdateStatus updates status only if current status matches `fromStatus`,
// preventing races where two callers transition in conflicting directions.
func (r *OrderRepository) UpdateStatus(ctx context.Context, id int64, fromStatus, toStatus model.OrderStatus) (*model.Order, error) {
	const q = `
		UPDATE orders
		SET status = $3, updated_at = NOW()
		WHERE id = $1 AND status = $2
		RETURNING id, user_id, status, total_cents, created_at, updated_at`
	o := &model.Order{}
	err := r.pool.QueryRow(ctx, q, id, fromStatus, toStatus).
		Scan(&o.ID, &o.UserID, &o.Status, &o.TotalCents, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Could be missing OR transition conflict — caller disambiguates.
			return nil, ErrInvalidTransition
		}
		return nil, err
	}
	return o, nil
}
