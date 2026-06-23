package model

import "time"

type Channel string

const (
	ChannelEmail Channel = "email"
	ChannelSMS   Channel = "sms"
	ChannelInApp Channel = "in_app"
)

func IsValidChannel(c Channel) bool {
	switch c {
	case ChannelEmail, ChannelSMS, ChannelInApp:
		return true
	}
	return false
}

type NotificationStatus string

const (
	StatusSent   NotificationStatus = "sent"
	StatusFailed NotificationStatus = "failed"
)

type Notification struct {
	ID        int64              `json:"id"`
	UserID    int64              `json:"user_id"`
	Channel   Channel            `json:"channel"`
	Subject   string             `json:"subject"`
	Body      string             `json:"body"`
	Status    NotificationStatus `json:"status"`
	CreatedAt time.Time          `json:"created_at"`
}
