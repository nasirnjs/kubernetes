package client

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

var (
	ErrProductNotFound   = errors.New("product not found")
	ErrInsufficientStock = errors.New("insufficient stock")
	ErrUnauthorized      = errors.New("unauthorized")
)

type Product struct {
	ID         int64  `json:"id"`
	SKU        string `json:"sku"`
	Name       string `json:"name"`
	PriceCents int64  `json:"price_cents"`
	Stock      int32  `json:"stock"`
}

type ProductClient struct {
	baseURL string
	http    *http.Client
}

func NewProductClient(baseURL string) *ProductClient {
	return &ProductClient{
		baseURL: baseURL,
		http:    &http.Client{Timeout: 5 * time.Second},
	}
}

func (c *ProductClient) Get(ctx context.Context, id int64) (*Product, error) {
	url := fmt.Sprintf("%s/api/products/%d", c.baseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		p := &Product{}
		if err := json.NewDecoder(resp.Body).Decode(p); err != nil {
			return nil, err
		}
		return p, nil
	case http.StatusNotFound:
		return nil, ErrProductNotFound
	default:
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("product-service GET %d: %s", resp.StatusCode, body)
	}
}

func (c *ProductClient) AdjustStock(ctx context.Context, id int64, delta int32, jwt string) (*Product, error) {
	url := fmt.Sprintf("%s/api/products/%d/stock", c.baseURL, id)
	body, _ := json.Marshal(map[string]int32{"delta": delta})

	req, err := http.NewRequestWithContext(ctx, http.MethodPatch, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if jwt != "" {
		req.Header.Set("Authorization", "Bearer "+jwt)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		p := &Product{}
		if err := json.NewDecoder(resp.Body).Decode(p); err != nil {
			return nil, err
		}
		return p, nil
	case http.StatusUnauthorized:
		return nil, ErrUnauthorized
	case http.StatusNotFound:
		return nil, ErrProductNotFound
	case http.StatusConflict:
		return nil, ErrInsufficientStock
	default:
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("product-service PATCH stock %d: %s", resp.StatusCode, respBody)
	}
}
