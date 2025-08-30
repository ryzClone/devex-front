import React, { useState } from "react";
import "../../style/Addusermodal.css"; // Modal uchun CSS

export default function AddTexnika({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    naimenovaniya_tex: "",
    inv_tex: "",
    seriyniy_nomer: "",
    mac_address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">Добавить Техника</h2>
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData); // FormData ni onSubmit funksiyasiga uzatish
          }}
        >
          <label className="modal-label">
            Наименование тех:
            <input
              className="modal-input"
              type="text"
              name="naimenovaniya_tex"
              value={formData.naimenovaniya_tex}
              onChange={handleChange}
              required
            />
          </label>
          <label className="modal-label">
            ИНВ номер:
            <input
              className="modal-input"
              type="text"
              name="inv_tex"
              value={formData.inv_tex}
              onChange={handleChange}
              required
            />
          </label>
          <label className="modal-label">
            Серийный номер:
            <input
              className="modal-input"
              type="text"
              name="seriyniy_nomer"
              value={formData.seriyniy_nomer}
              onChange={handleChange}
              required
            />
          </label>
          <label className="modal-label">
            MAC-адрес:
            <input
              className="modal-input"
              type="text"
              name="mac_address"
              value={formData.mac_address}
              onChange={handleChange}
              required
            />
          </label>
          <button className="modal-submit" type="submit">
            Добавить
          </button>
        </form>
      </div>
    </div>
  );
}
