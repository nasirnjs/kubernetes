package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
	"teacherservice/database"
	"teacherservice/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.elastic.co/apm/v2"
)

func GetTeachers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Start APM span for database operation
	span, ctx := apm.StartSpan(r.Context(), "GetTeachersFromDB", "db.mongodb.query")
	defer span.End()

	collection := database.GetCollection("teachers")
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var teachers []models.Teacher
	if err = cursor.All(ctx, &teachers); err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(teachers)
}

func AddTeacher(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var teacher models.Teacher
	if err := json.NewDecoder(r.Body).Decode(&teacher); err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Start APM span for database operation
	span, ctx := apm.StartSpan(r.Context(), "AddTeacherToDB", "db.mongodb.query")
	defer span.End()

	collection := database.GetCollection("teachers")
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Check if teacher already exists
	existing := collection.FindOne(ctx, bson.M{"id": teacher.ID})
	if existing.Err() == nil {
		err := existing.Err()
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, "Teacher with this ID already exists", http.StatusConflict)
		return
	}

	_, err := collection.InsertOne(ctx, teacher)
	if err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(teacher)
}

func DeleteTeacher(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "ID parameter missing", http.StatusBadRequest)
		return
	}

	// Start APM span for database operation
	span, ctx := apm.StartSpan(r.Context(), "DeleteTeacherFromDB", "db.mongodb.query")
	defer span.End()

	collection := database.GetCollection("teachers")
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Teacher not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Teacher deleted successfully"})
}

func UpdateTeacher(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var updated models.Teacher
	if err := json.NewDecoder(r.Body).Decode(&updated); err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Start APM span for database operation
	span, ctx := apm.StartSpan(r.Context(), "UpdateTeacherInDB", "db.mongodb.query")
	defer span.End()

	collection := database.GetCollection("teachers")
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	result, err := collection.UpdateOne(
		ctx,
		bson.M{"id": updated.ID},
		bson.M{"$set": updated},
	)
	if err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Teacher not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updated)
}