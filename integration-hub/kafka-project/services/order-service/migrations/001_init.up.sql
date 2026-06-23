CREATE SCHEMA IF NOT EXISTS order_svc;
SET search_path TO order_svc;

CREATE TABLE IF NOT EXISTS orders (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    status      VARCHAR(32) NOT NULL DEFAULT 'created',
    total_cents BIGINT      NOT NULL CHECK (total_cents >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT orders_status_chk CHECK (status IN ('created','confirmed','completed','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id, id DESC);

CREATE TABLE IF NOT EXISTS order_items (
    id               BIGSERIAL PRIMARY KEY,
    order_id         BIGINT       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id       BIGINT       NOT NULL,
    sku              VARCHAR(64)  NOT NULL,
    name             VARCHAR(255) NOT NULL,
    unit_price_cents BIGINT       NOT NULL CHECK (unit_price_cents >= 0),
    quantity         INTEGER      NOT NULL CHECK (quantity > 0),
    line_total_cents BIGINT       NOT NULL CHECK (line_total_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
