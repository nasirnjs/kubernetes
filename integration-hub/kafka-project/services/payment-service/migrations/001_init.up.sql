CREATE SCHEMA IF NOT EXISTS payment_svc;
SET search_path TO payment_svc;

CREATE TABLE IF NOT EXISTS payments (
    id            BIGSERIAL PRIMARY KEY,
    order_id      BIGINT       NOT NULL,
    user_id       BIGINT       NOT NULL,
    amount_cents  BIGINT       NOT NULL CHECK (amount_cents > 0),
    status        VARCHAR(32)  NOT NULL,
    provider_ref  VARCHAR(64)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT payments_status_chk CHECK (status IN ('pending','succeeded','failed','refunded'))
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);
