package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nasirnjs/ecommerce/product-service/internal/model"
)

var (
	ErrNotFound         = errors.New("product not found")
	ErrDuplicateSKU     = errors.New("sku already exists")
	ErrInsufficientStock = errors.New("insufficient stock")
)

type ProductRepository struct {
	pool *pgxpool.Pool
}

func NewProductRepository(pool *pgxpool.Pool) *ProductRepository {
	return &ProductRepository{pool: pool}
}

func (r *ProductRepository) Create(ctx context.Context, p *model.Product) error {
	const q = `
		INSERT INTO products (sku, name, description, price_cents, stock)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`
	err := r.pool.QueryRow(ctx, q, p.SKU, p.Name, p.Description, p.PriceCents, p.Stock).
		Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrDuplicateSKU
		}
		return err
	}
	return nil
}

func (r *ProductRepository) GetByID(ctx context.Context, id int64) (*model.Product, error) {
	const q = `
		SELECT id, sku, name, description, price_cents, stock, created_at, updated_at
		FROM products WHERE id = $1`
	p := &model.Product{}
	err := r.pool.QueryRow(ctx, q, id).
		Scan(&p.ID, &p.SKU, &p.Name, &p.Description, &p.PriceCents, &p.Stock, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return p, nil
}

func (r *ProductRepository) List(ctx context.Context, limit, offset int) ([]*model.Product, error) {
	const q = `
		SELECT id, sku, name, description, price_cents, stock, created_at, updated_at
		FROM products
		ORDER BY id DESC
		LIMIT $1 OFFSET $2`
	rows, err := r.pool.Query(ctx, q, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.Product, 0, limit)
	for rows.Next() {
		p := &model.Product{}
		if err := rows.Scan(&p.ID, &p.SKU, &p.Name, &p.Description, &p.PriceCents,
			&p.Stock, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

// AdjustStock applies delta atomically. Negative delta = decrement.
// Returns ErrInsufficientStock if the resulting stock would be < 0.
// Returns ErrNotFound if the product does not exist.
func (r *ProductRepository) AdjustStock(ctx context.Context, id int64, delta int32) (*model.Product, error) {
	const q = `
		UPDATE products
		SET stock = stock + $2, updated_at = NOW()
		WHERE id = $1 AND stock + $2 >= 0
		RETURNING id, sku, name, description, price_cents, stock, created_at, updated_at`
	p := &model.Product{}
	err := r.pool.QueryRow(ctx, q, id, delta).
		Scan(&p.ID, &p.SKU, &p.Name, &p.Description, &p.PriceCents, &p.Stock, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return nil, err
		}
		// Disambiguate: was it missing, or insufficient stock?
		var exists bool
		if err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM products WHERE id = $1)`, id).Scan(&exists); err != nil {
			return nil, err
		}
		if !exists {
			return nil, ErrNotFound
		}
		return nil, ErrInsufficientStock
	}
	return p, nil
}
