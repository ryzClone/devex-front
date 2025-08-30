import React, { useState } from "react";
import "../../style/AdminPanel.css"; // umumiy style

export default function AddEmployeeModal({ onClose, onSave, positions }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [positionId, setPositionId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !positionId) return;

    const newEmployee = {
      full_name: fullName,
      email,
      phone,
      position_id: positionId,
    };

    onSave(newEmployee);

    // Formani tozalash
    setFullName("");
    setEmail("");
    setPhone("");
    setPositionId("");

    onClose();
  };

  return (
    <div className="adminPanel-modal-overlay" onClick={onClose}>
      <div
        className="adminPanel-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Yopish tugmasi */}
        <button className="adminPanel-modal-close" onClick={onClose}>
          ×
        </button>

        <h2 className="adminPanel-modal-title">➕ Добавить сотрудника</h2>

        <form className="adminPanel-modal-form" onSubmit={handleSubmit}>
          <label className="adminPanel-modal-label">
            Ф.И.О:
            <input
              type="text"
              placeholder="Введите Ф.И.О"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="adminPanel-modal-input"
              required
            />
          </label>

          <label className="adminPanel-modal-label">
            Email:
            <input
              type="email"
              placeholder="Введите Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="adminPanel-modal-input"
            />
          </label>

          <label className="adminPanel-modal-label">
            Телефон:
            <input
              type="text"
              placeholder="Введите телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="adminPanel-modal-input"
            />
          </label>

          <label className="adminPanel-modal-label">
            Должность:
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className="adminPanel-modal-input"
              required
            >
              <option value="">Выберите должность</option>
              {positions?.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="adminPanel-modal-submit">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
