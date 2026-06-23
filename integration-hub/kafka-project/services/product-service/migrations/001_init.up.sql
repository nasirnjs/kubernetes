CREATE SCHEMA IF NOT EXISTS product_svc;
SET search_path TO product_svc;

CREATE TABLE IF NOT EXISTS products (
    id           BIGSERIAL PRIMARY KEY,
    sku          VARCHAR(64)  NOT NULL UNIQUE,
    name         VARCHAR(255) NOT NULL,
    description  TEXT         NOT NULL DEFAULT '',
    price_cents  BIGINT       NOT NULL CHECK (price_cents >= 0),
    stock        INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
