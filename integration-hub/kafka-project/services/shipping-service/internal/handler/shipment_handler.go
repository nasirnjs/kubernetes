package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/nasirnjs/ecommerce/shipping-service/internal/model"
	"github.com/nasirnjs/ecommerce/shipping-service/internal/service"
)

type ShipmentHandler struct {
	svc *service.ShipmentService
}

func NewShipmentHandler(svc *service.ShipmentService) *ShipmentHandler {
	return &ShipmentHandler{svc: svc}
}

type createRequest struct {
	OrderID int64  `json:"order_id"`
	Address string `json:"address"`
}

func (h *ShipmentHandler) Create(w http.ResponseWriter, r *http.Request) {
	uid, ok := userIDFromCtx(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var req createRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	sh, err := h.svc.Create(r.Context(), uid, service.CreateInput{
		OrderID: req.OrderID,
		Address: req.Address,
	})
	if err != nil {
		if errors.Is(err, service.ErrInvalidInput) {
			writeError(w, http.StatusBadRequest, "invalid input")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusCreated, sh)
}

func (h *ShipmentHandler) Get(w http.ResponseWriter, r *http.Request) {
	uid, ok := userIDFromCtx(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	sh, err := h.svc.GetByID(r.Context(), uid, id)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrShipmentNotFound), errors.Is(err, service.ErrForbidden):
			writeError(w, http.StatusNotFound, "not found")
		default:
			writeError(w, http.StatusInternalServerError, "internal error")
		}
		return
	}
	writeJSON(w, http.StatusOK, sh)
}

func (h *ShipmentHandler) List(w http.ResponseWriter, r *http.Request) {
	uid, ok := userIDFromCtx(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	orderID, _ := strconv.ParseInt(r.URL.Query().Get("order_id"), 10, 64)
	items, err := h.svc.ListByUser(r.Context(), uid, orderID, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"items":  items,
		"limit":  limit,
		"offset": offset,
		"count":  len(items),
	})
}

type statusRequest struct {
	Status string `json:"status"`
}

func (h *ShipmentHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	uid, ok := userIDFromCtx(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var req statusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	sh, err := h.svc.UpdateStatus(r.Context(), uid, id, model.ShipmentStatus(req.Status))
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidInput):
			writeError(w, http.StatusBadRequest, "invalid status")
		case errors.Is(err, service.ErrShipmentNotFound), errors.Is(err, service.ErrForbidden):
			writeError(w, http.StatusNotFound, "not found")
		case errors.Is(err, service.ErrInvalidTransition):
			writeError(w, http.StatusConflict, "invalid status transition")
		default:
			writeError(w, http.StatusInternalServerError, "internal error")
		}
		return
	}
	writeJSON(w, http.StatusOK, sh)
}
