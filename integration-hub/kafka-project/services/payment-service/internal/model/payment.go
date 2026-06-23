package model

import "time"

type PaymentStatus string

const (
	StatusPending   PaymentStatus = "pending"
	StatusSucceeded PaymentStatus = "succeeded"
	StatusFailed    PaymentStatus = "failed"
	StatusRefunded  PaymentStatus = "refunded"
)

type Payment struct {
	ID          int64         `json:"id"`
	OrderID     int64         `json:"order_id"`
	UserID      int64         `json:"user_id"`
	AmountCents int64         `json:"amount_cents"`
	Status      PaymentStatus `json:"status"`
	ProviderRef string        `json:"provider_ref"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}
