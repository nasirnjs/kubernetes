package main

import (
	"log"
	"net/http"
	"teacherservice/database"
	"teacherservice/handlers"
	
	"go.elastic.co/apm/v2"
)

func initAPM() {
	if apm.DefaultTracer().Active() {
		log.Println("APM initialized for Teacher Service")
	} else {
		log.Println("APM not active - using environment variables")
	}
}

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
	initAPM()

	if err := database.Connect(); err != nil {
		log.Fatal("Database connection failed:", err)
	}

	// Teacher Routes
	http.HandleFunc("/tech/add-teacher", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions { return }
		apmMiddleware(handlers.AddTeacher, "POST /add-teacher")(w, r)
	})

	http.HandleFunc("/tech/teachers", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions { return }
		apmMiddleware(handlers.GetTeachers, "GET /teachers")(w, r)
	})

	http.HandleFunc("/tech/delete-teacher", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions { return }
		if r.Method != http.MethodDelete {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		apmMiddleware(handlers.DeleteTeacher, "DELETE /delete-teacher")(w, r)
	})

	http.HandleFunc("/tech/update-teacher", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions { return }
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		apmMiddleware(handlers.UpdateTeacher, "PUT /update-teacher")(w, r)
	})

	log.Println("Teacher Service running on port 5002")
	log.Fatal(http.ListenAndServe(":5002", nil))
}