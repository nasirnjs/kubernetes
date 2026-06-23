package service

import (
	"context"
	"errors"
	"log"
	"strings"

	"github.com/nasirnjs/ecommerce/notification-service/internal/model"
	"github.com/nasirnjs/ecommerce/notification-service/internal/repository"
)

var (
	ErrInvalidInput        = errors.New("invalid input")
	ErrNotificationNotFound = errors.New("notification not found")
	ErrForbidden           = errors.New("forbidden")
)

type NotificationService struct {
	repo *repository.NotificationRepository
}

func NewNotificationService(repo *repository.NotificationRepository) *NotificationService {
	return &NotificationService{repo: repo}
}

type SendInput struct {
	Channel model.Channel
	Subject string
	Body    string
}

// Send is a MOCK delivery. Per spec, Phase 1 just logs and stores.
// Phase 2 will replace this with real SMTP/SMS providers, fed by Kafka events.
func (s *NotificationService) Send(ctx context.Context, userID int64, in SendInput) (*model.Notification, error) {
	if !model.IsValidChannel(in.Channel) {
		return nil, ErrInvalidInput
	}
	subject := strings.TrimSpace(in.Subject)
	body := strings.TrimSpace(in.Body)
	if subject == "" || body == "" {
		return nil, ErrInvalidInput
	}

	n := &model.Notification{
		UserID:  userID,
		Channel: in.Channel,
		Subject: subject,
		Body:    body,
		Status:  model.StatusSent,
	}
	if err := s.repo.Create(ctx, n); err != nil {
		return nil, err
	}

	log.Printf("NOTIFY user_id=%d channel=%s subject=%q", userID, in.Channel, subject)
	return n, nil
}

func (s *NotificationService) GetByID(ctx context.Context, userID, id int64) (*model.Notification, error) {
	n, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrNotificationNotFound
		}
		return nil, err
	}
	if n.UserID != userID {
		return nil, ErrForbidden
	}
	return n, nil
}

func (s *NotificationService) ListByUser(ctx context.Context, userID int64, limit, offset int) ([]*model.Notification, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.repo.ListByUser(ctx, userID, limit, offset)
}
