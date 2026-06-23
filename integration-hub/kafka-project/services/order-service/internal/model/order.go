package model

import "time"

type OrderStatus string

const (
	StatusCreated   OrderStatus = "created"
	StatusConfirmed OrderStatus = "confirmed"
	StatusCompleted OrderStatus = "completed"
	StatusCancelled OrderStatus = "cancelled"
)

// CanTransition reports whether `to` is a legal next status from the receiver.
func (s OrderStatus) CanTransition(to OrderStatus) bool {
	switch s {
	case StatusCreated:
		return to == StatusConfirmed || to == StatusCancelled
	case StatusConfirmed:
		return to == StatusCompleted || to == StatusCancelled
	default:
		return false
	}
}

func IsValidStatus(s OrderStatus) bool {
	switch s {
	case StatusCreated, StatusConfirmed, StatusCompleted, StatusCancelled:
		return true
	}
	return false
}

type Order struct {
	ID         int64       `json:"id"`
	UserID     int64       `json:"user_id"`
	Status     OrderStatus `json:"status"`
	TotalCents int64       `json:"total_cents"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
	Items      []OrderItem `json:"items,omitempty"`
}

type OrderItem struct {
	ID             int64  `json:"id"`
	OrderID        int64  `json:"order_id"`
	ProductID      int64  `json:"product_id"`
	SKU            string `json:"sku"`
	Name           string `json:"name"`
	UnitPriceCents int64  `json:"unit_price_cents"`
	Quantity       int32  `json:"quantity"`
	LineTotalCents int64  `json:"line_total_cents"`
}
