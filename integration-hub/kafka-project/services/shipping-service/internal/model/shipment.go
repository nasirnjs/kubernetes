package model

import "time"

type ShipmentStatus string

const (
	StatusPending    ShipmentStatus = "pending"
	StatusDispatched ShipmentStatus = "dispatched"
	StatusInTransit  ShipmentStatus = "in_transit"
	StatusDelivered  ShipmentStatus = "delivered"
	StatusCancelled  ShipmentStatus = "cancelled"
)

func (s ShipmentStatus) CanTransition(to ShipmentStatus) bool {
	switch s {
	case StatusPending:
		return to == StatusDispatched || to == StatusCancelled
	case StatusDispatched:
		return to == StatusInTransit || to == StatusCancelled
	case StatusInTransit:
		return to == StatusDelivered || to == StatusCancelled
	default:
		return false
	}
}

func IsValidStatus(s ShipmentStatus) bool {
	switch s {
	case StatusPending, StatusDispatched, StatusInTransit, StatusDelivered, StatusCancelled:
		return true
	}
	return false
}

type Shipment struct {
	ID             int64          `json:"id"`
	OrderID        int64          `json:"order_id"`
	UserID         int64          `json:"user_id"`
	Address        string         `json:"address"`
	Status         ShipmentStatus `json:"status"`
	TrackingNumber string         `json:"tracking_number"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
}
