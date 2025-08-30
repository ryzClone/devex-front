import React from "react";
import { FaTimes } from "react-icons/fa";
import "./UserDetailModal.css"; // CSS fayl bir xil qoladi

export default function UserDetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="detail-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-modal-content">
        <button className="detail-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="detail-modal-title">Детали пользователя</h2>
        <div className="detail-modal-form">
          <label>
            ID:
            <input type="text" value={item.id} readOnly />
          </label>
          <label>
            Логин (username):
            <input type="text" value={item.username} readOnly />
          </label>
          <label>
            Пароль:
            <input type="text" value="*****" readOnly />
          </label>
          <label>
            Роль:
            <input type="text" value={item.role} readOnly />
          </label>
          <label>
            Статус:
            <input type="text" value={item.status ? "Активный" : "Неактивный"} readOnly />
          </label>
          <label>
            Состояние (state):
            <input type="text" value={item.state ? "Активный" : "Неактивный"} readOnly />
          </label>
          <label>
            Дата создания:
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
