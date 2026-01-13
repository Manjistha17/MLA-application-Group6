import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/components/EditProfile.css";

const EditProfile = ({ currentUser }) => {
  const [form, setForm] = useState({
    contact: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    axios
      .get(`/api/auth/user/${currentUser}`)
      .then((res) => {
        setForm({
          contact: res.data.contact || "",
          age: res.data.age || "",
          gender: res.data.gender || "",
          height: res.data.height || "",
          weight: res.data.weight || "",
        });
      })
      .catch((err) => console.error("Error loading profile:", err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios
      .put(`/api/auth/user/${currentUser}`, form)
      .then(() => {
        window.location.href = "/profile";
      })
      .catch((err) => console.error("Update failed:", err));
  };

  const handleCancel = () => {
    window.location.href = "/profile";
  };

  if (loading) {
    return (
      <div className="editProfilePage">
        <div className="editProfileCard">
          <h2>Loading profile…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="editProfilePage">
      <div className="editProfileCard">
        <div className="editProfileHeader">
          <h2>Edit Profile</h2>
          <p className="editProfileSubtitle">
            Update your personal and fitness details
          </p>
        </div>

        <div className="editFormGrid">
          <div className="formField">
            <label>Contact</label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
            />
          </div>

          <div className="formField">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
            />
          </div>

          <div className="formField">
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </select>
          </div>

          <div className="formField">
            <label>Height (cm)</label>
            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
            />
          </div>

          <div className="formField">
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="editProfileActions">
          <button className="cancelBtn" onClick={handleCancel}>
            Cancel
          </button>

          <button className="saveBtn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
