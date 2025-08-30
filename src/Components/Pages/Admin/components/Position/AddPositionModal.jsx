import React, { useState } from "react";
import "../../style/AdminPanel.css"; // umumiy style

export default function AddPositionModal({ onClose, onSave }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name);
    setName("");
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

        <h2 className="adminPanel-modal-title">➕ Добавить должность</h2>

        <form className="adminPanel-modal-form" onSubmit={handleSubmit}>
          <label className="adminPanel-modal-label">
            Должность:
            <input
              type="text"
              placeholder="Введите должность"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="adminPanel-modal-input"
              required
            />
          </label>

          <button type="submit" className="adminPanel-modal-submit">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
