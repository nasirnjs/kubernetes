// src/components/EmployeeList.js
import React, { useState } from "react";

const EmployeeList = ({ employees = [], onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", id: "", position: "" });

  const startEdit = (employee) => {
    setEditingId(employee.id);
    setEditForm(employee);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", id: "", position: "" });
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    onEdit(editForm);
    cancelEdit();
  };

  return (
    <div>
      <h2>Registered Employees</h2>
      <ul>
        {employees.length === 0 ? (
          <li>No employees registered yet.</li>
        ) : (
          employees.map((employee) => (
            <li key={employee.id} style={{ marginBottom: "12px" }}>
              {editingId === employee.id ? (
                <>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    placeholder="Name"
                    style={{ marginRight: "8px", padding: "4px" }}
                  />
                  <input
                    name="id"
                    value={editForm.id}
                    disabled
                    style={{ marginRight: "8px", padding: "4px" }}
                  />
                  <input
                    name="position"
                    value={editForm.position}
                    onChange={handleChange}
                    placeholder="Position"
                    style={{ marginRight: "8px", padding: "4px" }}
                  />
                  <button 
                    onClick={handleUpdate}
                    style={{ marginRight: "5px", padding: "4px 8px" }}
                  >
                    Save
                  </button>
                  <button 
                    onClick={cancelEdit}
                    style={{ padding: "4px 8px" }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <strong>{employee.name}</strong> - ID: {employee.id} - Position: {employee.position}
                  <button 
                    style={{ marginLeft: "10px", padding: "4px 8px" }} 
                    onClick={() => startEdit(employee)}
                  >
                    Edit
                  </button>
                  <button 
                    style={{ marginLeft: "5px", padding: "4px 8px" }} 
                    onClick={() => onDelete(employee.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default EmployeeList;