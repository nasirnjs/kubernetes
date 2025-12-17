package main

import (
	"log"
	"net/http"
	"employeeservice/database" 
	"employeeservice/handlers"
	
	"go.elastic.co/apm/v2" 
)

func initAPM() {
	// In newer APM versions, the tracer is automatically initialized
	// from environment variables. We don't need manual initialization.
	
	// Check if APM is working
	if apm.DefaultTracer().Active() {
		log.Println("APM initialized successfully for Employee Service")
	} else {
		log.Println("APM is not active - check environment variables")
	}
}

// SIMPLIFIED APM middleware - FIXED VERSION
func apmMiddleware(handler http.HandlerFunc, operationName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if APM tracer is available before using it
		tracer := apm.DefaultTracer()
		if tracer == nil || !tracer.Active() {
			// If APM is not available, just call the handler directly
			handler(w, r)
			return
		}
		
		// Start transaction - CORRECT WAY
		tx := tracer.StartTransaction(operationName, "request")
		defer tx.End()
		
		// Set transaction context
		ctx := apm.ContextWithTransaction(r.Context(), tx)
		req := r.WithContext(ctx)
		
		// Call the handler
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

	// Employee Routes with APM middleware
	http.HandleFunc("/emp/add-employee", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions {
			return
		}
		apmMiddleware(handlers.AddEmployee, "POST /add-employee")(w, r)
	})

	http.HandleFunc("/emp/employees", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions {
			return
		}
		apmMiddleware(handlers.GetEmployees, "GET /employees")(w, r)
	})

	http.HandleFunc("/emp/delete-employee", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method != http.MethodDelete {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		apmMiddleware(handlers.DeleteEmployee, "DELETE /delete-employee")(w, r)
	})

	http.HandleFunc("/emp/update-employee", func(w http.ResponseWriter, r *http.Request) {
		enableCors(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		apmMiddleware(handlers.UpdateEmployee, "PUT /update-employee")(w, r)
	})

	log.Println("Employee Service running on port 5003")
	log.Fatal(http.ListenAndServe(":5003", nil))
}