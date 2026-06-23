CREATE SCHEMA IF NOT EXISTS notification_svc;
SET search_path TO notification_svc;

CREATE TABLE IF NOT EXISTS notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    channel    VARCHAR(32)  NOT NULL,
    subject    VARCHAR(255) NOT NULL,
    body       TEXT         NOT NULL,
    status     VARCHAR(32)  NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT notifications_channel_chk CHECK (channel IN ('email','sms','in_app')),
    CONSTRAINT notifications_status_chk  CHECK (status IN ('sent','failed'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, id DESC);
