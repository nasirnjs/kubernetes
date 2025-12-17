import React, { useState } from "react";

const StudentList = ({ students = [], onDelete, onEdit }) => {
  const [editingRoll, setEditingRoll] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", roll: "", address: "" });

  const startEdit = (student) => {
    setEditingRoll(student.roll);
    setEditForm(student);
  };

  const cancelEdit = () => {
    setEditingRoll(null);
    setEditForm({ name: "", roll: "", address: "" });
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
      <h2>Registered Students</h2>
      <ul>
        {students.length === 0 ? (
          <li>No students registered yet.</li>
        ) : (
          students.map((student) => (
            <li key={student.roll} style={{ marginBottom: "12px" }}>
              {editingRoll === student.roll ? (
                <>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    placeholder="Name"
                  />
                  <input
                    name="roll"
                    value={editForm.roll}
                    disabled
                  />
                  <input
                    name="address"
                    value={editForm.address}
                    onChange={handleChange}
                    placeholder="Address"
                  />
                  <button onClick={handleUpdate}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <strong>{student.name}</strong> - Roll: {student.roll} - Address: {student.address}
                  <button style={{ marginLeft: "10px" }} onClick={() => startEdit(student)}>
                    Edit
                  </button>
                  <button style={{ marginLeft: "5px" }} onClick={() => onDelete(student.roll)}>
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

export default StudentList;
