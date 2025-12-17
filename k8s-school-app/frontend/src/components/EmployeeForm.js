// src/components/EmployeeForm.js
import React, { useState } from 'react';

function EmployeeForm({ onAddEmployee }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [position, setPosition] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && id && position) {
      onAddEmployee({ name, id, position });
      setName('');
      setId('');
      setPosition('');
    } else {
      alert("All fields are required.");
    }
  };

  return (
    <div>
      <h2>Add Employee</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Employee Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Employee ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <button type="submit">Add Employee</button>
      </form>
    </div>
  );
}

export default EmployeeForm;
