package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nasirnjs/ecommerce/user-service/internal/model"
)

var (
	ErrNotFound  = errors.New("user not found")
	ErrDuplicate = errors.New("user already exists")
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) Create(ctx context.Context, u *model.User) error {
	const q = `
		INSERT INTO users (email, password_hash, full_name, phone)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`
	err := r.pool.QueryRow(ctx, q, u.Email, u.PasswordHash, u.FullName, u.Phone).
		Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrDuplicate
		}
		return err
	}
	return nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	const q = `
		SELECT id, email, password_hash, full_name, phone, created_at, updated_at
		FROM users WHERE email = $1`
	u := &model.User{}
	err := r.pool.QueryRow(ctx, q, email).
		Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Phone, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id int64) (*model.User, error) {
	const q = `
		SELECT id, email, password_hash, full_name, phone, created_at, updated_at
		FROM users WHERE id = $1`
	u := &model.User{}
	err := r.pool.QueryRow(ctx, q, id).
		Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Phone, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return u, nil
}

func (r *UserRepository) UpdateProfile(ctx context.Context, id int64, fullName, phone string) (*model.User, error) {
	const q = `
		UPDATE users
		SET full_name = $2, phone = $3, updated_at = NOW()
		WHERE id = $1
		RETURNING id, email, password_hash, full_name, phone, created_at, updated_at`
	u := &model.User{}
	err := r.pool.QueryRow(ctx, q, id, fullName, phone).
		Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Phone, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return u, nil
}
