import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { getToken } from "../api/auth";

type User = {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    api
      .get<User>("/users/me")
      .then((res) => {
        setUser(res.data);
        setFullName(res.data.full_name);
        setPhone(res.data.phone ?? "");
      })
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login");
        else setError(err.response?.data?.error ?? "failed to load");
      });
  }, [navigate]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await api.put<User>("/users/me", { full_name: fullName, phone });
      setUser(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>Profile</h2>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <form onSubmit={onSave}>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
