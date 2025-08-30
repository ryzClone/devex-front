import React, { useState } from "react";
import "../../style/AdminPanel.css";

export default function AddOperationalSystemModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [shortname, setShortname] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, shortname });
    setName("");
    setShortname("");
    onClose();
  };

  return (
    <div className="adminPanel-modal-overlay" onClick={onClose}>
      <div
        className="adminPanel-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="adminPanel-modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="adminPanel-modal-title">➕ Операционная система</h2>
        <form className="adminPanel-modal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название ОС"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="adminPanel-modal-input"
            required
          />
          <input
            type="text"
            placeholder="Краткое имя"
            value={shortname}
            onChange={(e) => setShortname(e.target.value)}
            className="adminPanel-modal-input"
            required
          />

          <button type="submit" className="adminPanel-modal-submit">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
