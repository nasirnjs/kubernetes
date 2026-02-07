// src/App.js
import React, { useState, useEffect } from "react";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import TeacherForm from "./components/TeacherForm";
import TeacherList from "./components/TeacherList";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import "./App.css";
import { init as initApm } from '@elastic/apm-rum'

// APM initialization
const apm = initApm({
  serviceName: 'kindergarten-frontend',
  serverUrl: 'http://192.168.121.224:8200',
  serviceVersion: '1.0.0',
  environment: 'development'
})




function App() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("students");

  // API Base URLs for each service
  const STUDENT_SERVICE_URL = "http://172.17.18.230:/std";
  const TEACHER_SERVICE_URL = "http://172.17.18.230:/tech";
  const EMPLOYEE_SERVICE_URL = "http://172.17.18.230:/emp";

  const fetchStudents = () => {
    fetch(`${STUDENT_SERVICE_URL}/students`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Student service error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setStudents(data || []))
      .catch((err) => console.error("Fetch students error:", err));
  };

  const fetchTeachers = () => {
    fetch(`${TEACHER_SERVICE_URL}/teachers`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Teacher service error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setTeachers(data || []))
      .catch((err) => console.error("Fetch teachers error:", err));
  };

  const fetchEmployees = () => {
    fetch(`${EMPLOYEE_SERVICE_URL}/employees`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Employee service error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setEmployees(data || []))
      .catch((err) => console.error("Fetch employees error:", err));
  };

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchEmployees();
  }, []);

  const addStudent = async (student) => {
    try {
      await fetch(`${STUDENT_SERVICE_URL}/add-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      fetchStudents();
    } catch (err) {
      console.error("Add student error:", err);
      alert("Failed to add student. Please try again.");
    }
  };

  const addTeacher = async (teacher) => {
    try {
      await fetch(`${TEACHER_SERVICE_URL}/add-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacher),
      });
      fetchTeachers();
    } catch (err) {
      console.error("Add teacher error:", err);
      alert("Failed to add teacher. Please try again.");
    }
  };

  const addEmployee = async (employee) => {
    try {
      await fetch(`${EMPLOYEE_SERVICE_URL}/add-employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });
      fetchEmployees();
    } catch (err) {
      console.error("Add employee error:", err);
      alert("Failed to add employee. Please try again.");
    }
  };

  const handleDeleteStudent = async (roll) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await fetch(`${STUDENT_SERVICE_URL}/delete-student?roll=${roll}`, {
          method: "DELETE",
        });
        fetchStudents();
      } catch (err) {
        console.error("Delete student error:", err);
        alert("Failed to delete student. Please try again.");
      }
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await fetch(`${TEACHER_SERVICE_URL}/delete-teacher?id=${id}`, {
          method: "DELETE",
        });
        fetchTeachers();
      } catch (err) {
        console.error("Delete teacher error:", err);
        alert("Failed to delete teacher. Please try again.");
      }
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await fetch(`${EMPLOYEE_SERVICE_URL}/delete-employee?id=${id}`, {
          method: "DELETE",
        });
        fetchEmployees();
      } catch (err) {
        console.error("Delete employee error:", err);
        alert("Failed to delete employee. Please try again.");
      }
    }
  };

  // Edit handlers
  const handleEditStudent = async (updatedStudent) => {
    try {
      await fetch(`${STUDENT_SERVICE_URL}/update-student`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });
      fetchStudents();
    } catch (err) {
      console.error("Update student error:", err);
      alert("Failed to update student. Please try again.");
    }
  };

  const handleEditTeacher = async (updatedTeacher) => {
    try {
      await fetch(`${TEACHER_SERVICE_URL}/update-teacher`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTeacher),
      });
      fetchTeachers();
    } catch (err) {
      console.error("Update teacher error:", err);
      alert("Failed to update teacher. Please try again.");
    }
  };

  const handleEditEmployee = async (updatedEmployee) => {
    try {
      await fetch(`${EMPLOYEE_SERVICE_URL}/update-employee`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEmployee),
      });
      fetchEmployees();
    } catch (err) {
      console.error("Update employee error:", err);
      alert("Failed to update employee. Please try again.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Kindergarten School Registry</h1>

      {/* Service Status */}
      <div style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
        <strong>Services:</strong> 
        <span style={{ color: "#28a745", marginLeft: "10px" }}>● Student (5001)</span>
        <span style={{ color: "#007bff", marginLeft: "10px" }}>● Teacher (5002)</span>
        <span style={{ color: "#dc3545", marginLeft: "10px" }}>● Employee (5003)</span>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>
        <button 
          className={`tab-button ${activeTab === "teachers" ? "active" : ""}`}
          onClick={() => setActiveTab("teachers")}
        >
          Teachers
        </button>
        <button 
          className={`tab-button ${activeTab === "employees" ? "active" : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          Employees
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "students" && (
          <div className="tab-panel">
            <h2>Student Management</h2>
            <StudentForm onAddStudent={addStudent} />
            <StudentList 
              students={students} 
              onDelete={handleDeleteStudent} 
              onEdit={handleEditStudent} 
            />
          </div>
        )}

        {activeTab === "teachers" && (
          <div className="tab-panel">
            <h2>Teacher Management</h2>
            <TeacherForm onAddTeacher={addTeacher} />
            <TeacherList 
              teachers={teachers} 
              onDelete={handleDeleteTeacher} 
              onEdit={handleEditTeacher} 
            />
          </div>
        )}

        {activeTab === "employees" && (
          <div className="tab-panel">
            <h2>Employee Management</h2>
            <EmployeeForm onAddEmployee={addEmployee} />
            <EmployeeList 
              employees={employees} 
              onDelete={handleDeleteEmployee} 
              onEdit={handleEditEmployee} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;