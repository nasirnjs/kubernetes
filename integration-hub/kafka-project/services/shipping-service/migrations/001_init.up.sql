CREATE SCHEMA IF NOT EXISTS shipping_svc;
SET search_path TO shipping_svc;

CREATE TABLE IF NOT EXISTS shipments (
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT       NOT NULL,
    user_id         BIGINT       NOT NULL,
    address         TEXT         NOT NULL,
    status          VARCHAR(32)  NOT NULL DEFAULT 'pending',
    tracking_number VARCHAR(64)  NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT shipments_status_chk CHECK (status IN ('pending','dispatched','in_transit','delivered','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_shipments_user ON shipments (user_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments (order_id);
