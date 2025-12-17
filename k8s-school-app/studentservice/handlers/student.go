package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
	"studentservice/database"
	"studentservice/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.elastic.co/apm/v2"
)

func GetStudents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Start APM span for database operation
	span, ctx := apm.StartSpan(r.Context(), "GetStudentsFromDB", "db.mongodb.query")
	defer span.End()

	collection := database.GetCollection("students")
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var students []models.Student
	if err = cursor.All(ctx, &students); err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(students)
}

func AddStudent(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var student models.Student
	if err := json.NewDecoder(r.Body).Decode(&student); err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Start APM span for database operation
	span, ctx := apm.StartSpan(r.Context(), "AddStudentToDB", "db.mongodb.query")
	defer span.End()

	collection := database.GetCollection("students")
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Check if student already exists
	existing := collection.FindOne(ctx, bson.M{"roll": student.Roll})
	if existing.Err() == nil {
		err := existing.Err()
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, "Student with this roll number already exists", http.StatusConflict)
		return
	}

	_, err := collection.InsertOne(ctx, student)
	if err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(student)
}

func DeleteStudent(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	roll := r.URL.Query().Get("roll")
	if roll == "" {
		http.Error(w, "Roll parameter missing", http.StatusBadRequest)
		return
	}

	// Start APM span for database operation
	span, ctx := apm.StartSpan(r.Context(), "DeleteStudentFromDB", "db.mongodb.query")
	defer span.End()

	collection := database.GetCollection("students")
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"roll": roll})
	if err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Student not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Student deleted successfully"})
}

func UpdateStudent(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var updated models.Student
	if err := json.NewDecoder(r.Body).Decode(&updated); err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Start APM span for database operation
	span, ctx := apm.StartSpan(r.Context(), "UpdateStudentInDB", "db.mongodb.query")
	defer span.End()

	collection := database.GetCollection("students")
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	result, err := collection.UpdateOne(
		ctx,
		bson.M{"roll": updated.Roll},
		bson.M{"$set": updated},
	)
	if err != nil {
		apm.CaptureError(r.Context(), err).Send()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Student not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updated)
}