import React from "react";
import { FaTimes } from "react-icons/fa";
import "./TexnikaDetailModal.css"; // Yangi alohida CSS fayl

export default function TexnikaDetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="detail-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-modal-content">
        <button className="detail-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="detail-modal-title">Детали техники</h2>
        <div className="detail-modal-form">
          <label>
            Наименование техники:
            <input type="text" value={item.name} readOnly />
          </label>
          <label>
            ИНВ номер:
            <input type="text" value={item.inventory_number} readOnly />
          </label>
          <label>
            Серийный номер:
            <input type="text" value={item.serial_number} readOnly />
          </label>
          <label>
            MAC адрес:
            <input type="text" value={item.mac_address} readOnly />
          </label>
          <label>
            Статус:
            <input type="text" value={item.status} readOnly />
          </label>
          <label>
            Дата:
            <input
              type="text"
              value={new Date(item.created_at).toLocaleString("ru-RU", {
                timeZone: "UTC",
              })}
              readOnly
            />
          </label>
        </div>
      </div>
    </div>
  );
}
