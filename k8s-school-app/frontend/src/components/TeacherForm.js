// src/components/TeacherForm.js
import React, { useState } from 'react';

function TeacherForm({ onAddTeacher }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && id && subject) {
      onAddTeacher({ name, id, subject });
      setName('');
      setId('');
      setSubject('');
    } else {
      alert("All fields are required.");
    }
  };

  return (
    <div>
      <h2>Add Teacher</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Teacher Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Teacher ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <button type="submit">Add Teacher</button>
      </form>
    </div>
  );
}

export default TeacherForm;
