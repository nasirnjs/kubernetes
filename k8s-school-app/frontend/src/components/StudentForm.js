import React, { useState } from "react";

const StudentForm = ({ onAddStudent }) => {
  const [form, setForm] = useState({ name: "", roll: "", address: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.roll || !form.address) return alert("All fields are required!");
    await onAddStudent(form);
    setForm({ name: "", roll: "", address: "" });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        name="roll"
        placeholder="Roll"
        value={form.roll}
        onChange={handleChange}
        required
      />
      <input
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Student</button>
    </form>
  );
};

export default StudentForm;
