// src/components/TeacherList.js
import React, { useState } from "react";

const TeacherList = ({ teachers = [], onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", id: "", subject: "" });

  const startEdit = (teacher) => {
    setEditingId(teacher.id);
    setEditForm(teacher);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", id: "", subject: "" });
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
      <h2>Registered Teachers</h2>
      <ul>
        {teachers.length === 0 ? (
          <li>No teachers registered yet.</li>
        ) : (
          teachers.map((teacher) => (
            <li key={teacher.id} style={{ marginBottom: "12px" }}>
              {editingId === teacher.id ? (
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
                    name="subject"
                    value={editForm.subject}
                    onChange={handleChange}
                    placeholder="Subject"
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
                  <strong>{teacher.name}</strong> - ID: {teacher.id} - Subject: {teacher.subject}
                  <button 
                    style={{ marginLeft: "10px", padding: "4px 8px" }} 
                    onClick={() => startEdit(teacher)}
                  >
                    Edit
                  </button>
                  <button 
                    style={{ marginLeft: "5px", padding: "4px 8px" }} 
                    onClick={() => onDelete(teacher.id)}
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

export default TeacherList;