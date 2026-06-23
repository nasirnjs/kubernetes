package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/nasirnjs/ecommerce/user-service/internal/model"
	"github.com/nasirnjs/ecommerce/user-service/internal/repository"
)

var (
	ErrInvalidInput   = errors.New("invalid input")
	ErrInvalidCreds   = errors.New("invalid credentials")
	ErrEmailExists    = errors.New("email already registered")
	ErrUserNotFound   = errors.New("user not found")
)

type UserService struct {
	repo      *repository.UserRepository
	jwtSecret string
	jwtTTL    time.Duration
}

func NewUserService(repo *repository.UserRepository, jwtSecret string, jwtTTL time.Duration) *UserService {
	return &UserService{repo: repo, jwtSecret: jwtSecret, jwtTTL: jwtTTL}
}

type RegisterInput struct {
	Email    string
	Password string
	FullName string
	Phone    string
}

func (s *UserService) Register(ctx context.Context, in RegisterInput) (*model.User, error) {
	email := strings.ToLower(strings.TrimSpace(in.Email))
	if email == "" || !strings.Contains(email, "@") {
		return nil, ErrInvalidInput
	}
	if len(in.Password) < 8 {
		return nil, ErrInvalidInput
	}
	if strings.TrimSpace(in.FullName) == "" {
		return nil, ErrInvalidInput
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	u := &model.User{
		Email:        email,
		PasswordHash: string(hash),
		FullName:     strings.TrimSpace(in.FullName),
		Phone:        strings.TrimSpace(in.Phone),
	}
	if err := s.repo.Create(ctx, u); err != nil {
		if errors.Is(err, repository.ErrDuplicate) {
			return nil, ErrEmailExists
		}
		return nil, err
	}
	return u, nil
}

func (s *UserService) Login(ctx context.Context, email, password string) (string, *model.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	u, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return "", nil, ErrInvalidCreds
		}
		return "", nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return "", nil, ErrInvalidCreds
	}
	token, err := s.issueToken(u.ID, u.Email)
	if err != nil {
		return "", nil, err
	}
	return token, u, nil
}

func (s *UserService) GetProfile(ctx context.Context, id int64) (*model.User, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return u, nil
}

type UpdateProfileInput struct {
	FullName string
	Phone    string
}

func (s *UserService) UpdateProfile(ctx context.Context, id int64, in UpdateProfileInput) (*model.User, error) {
	fullName := strings.TrimSpace(in.FullName)
	if fullName == "" {
		return nil, ErrInvalidInput
	}
	u, err := s.repo.UpdateProfile(ctx, id, fullName, strings.TrimSpace(in.Phone))
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return u, nil
}

func (s *UserService) issueToken(userID int64, email string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"iat":   now.Unix(),
		"exp":   now.Add(s.jwtTTL).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
