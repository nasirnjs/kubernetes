package main

import (
	"log"
	"net/http"
	"studentservice/database"
	"studentservice/handlers"
	
	"go.elastic.co/apm/v2"
)

// SIMPLIFIED APM initialization
func initAPM() {
	// APM auto-initializes from environment variables in Docker
	if apm.DefaultTracer().Active() {
		log.Println("APM initialized for Student Service")
	} else {
		log.Println("APM not active - using environment variables")
	}
}

// SIMPLIFIED APM middleware
func apmMiddleware(handler http.HandlerFunc, operationName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tracer := apm.DefaultTracer()
		if tracer == nil || !tracer.Active() {
			handler(w, r)
			return
		}
		
		tx := tracer.StartTransaction(operationName, "request")
		defer tx.End()
		
		ctx := apm.ContextWithTransaction(r.Context(), tx)
		req := r.WithContext(ctx)
		handler(w, req)
	}
}

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, traceparent, tracestate")
}

func main() {
	// Initialize APM
	initAPM()

	// Database connection
	if err := database.Connect(); err != nil {
		log.Fatal("Database connection failed:", err)
	}

	// Student Routes with APM middleware
	http.HandleFunc("/std/add-student", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions {
			return
		}
		apmMiddleware(handlers.AddStudent, "POST /add-student")(w, r)
	})

	http.HandleFunc("/std/students", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions {
			return
		}
		apmMiddleware(handlers.GetStudents, "GET /students")(w, r)
	})

	http.HandleFunc("/std/delete-student", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method != http.MethodDelete {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		apmMiddleware(handlers.DeleteStudent, "DELETE /delete-student")(w, r)
	})

	http.HandleFunc("/std/update-student", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		apmMiddleware(handlers.UpdateStudent, "PUT /update-student")(w, r)
	})

	log.Println("Student Service running on port 5001")
	log.Fatal(http.ListenAndServe(":5001", nil))
}