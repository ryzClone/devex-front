import React, { useState, useEffect } from "react";
import "../../style/Addusermodal.css"; // Modal uchun CSS

export default function UpdateModalTexnika({ show, onClose, onSubmit, user }) {
  const [formData, setFormData] = useState({
    name: "",
    inventory_number: "",
    serial_number: "",
    mac_address: "",
    id: "",
    username:"",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        equipment_name: user.name || "",
        inventory_number: user.inventory_number || "",
        serial_number: user.serial_number || "",
        mac: user.mac_address || "",
        id: user.id || "",
        username : user.username || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // Modal ichida bosishni to'xtatish
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">Обновить техническую информацию</h2>
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
        >
          <input type="hidden" name="id" value={formData.id} />
          <label className="modal-label">
            Наименование тех:
            <input
              className="modal-input"
              type="text"
              name="equipment_name"
              value={formData.equipment_name}
              onChange={handleChange}
              required
            />
          </label>
          <label className="modal-label">
            ИНВ номер:
            <input
              className="modal-input"
              type="text"
              name="inventory_number"
              value={formData.inventory_number}
              onChange={handleChange}
              required
            />
          </label>
          <label className="modal-label">
            Серийный номер:
            <input
              className="modal-input"
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              required
            />
          </label>
          <label className="modal-label">
            MAC-адрес:
            <input
              className="modal-input"
              type="text"
              name="mac"
              value={formData.mac}
              onChange={handleChange}
              required
            />
          </label>
          <button className="modal-submit" type="submit">
            Обнавить
          </button>
        </form>
      </div>
    </div>
  );
}
