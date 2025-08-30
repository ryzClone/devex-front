import React, { useState } from "react";
import "../../style/Addusermodal.css"; // Modal uchun CSS
import Referense from "../Referense"; // Import the Referense component for showing success/error message

const Addusermodal = ({ show, onClose, onSubmit }) => {
  const [passwordError, setPasswordError] = useState(""); // Xatolik xabari uchun state
  const [showSuccess, setShowSuccess] = useState(false); // State for success/error message
  const [text, setText] = useState(""); // Message content
  const [success, setSuccess] = useState(false); // To track if it's a success or error

  if (!show) return null;

  // Parolni tekshirish funksiyasi
  const validatePassword = (password) => {
    // Parol kamida 6 ta belgi bo'lishi kerak, katta harf, kichik harf, raqam va maxsus belgini o'z ichiga olishi kerak
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const password = e.target.password.value;

    // Parolni tekshirish
    if (!validatePassword(password)) {
      setPasswordError(
        "Пароль должен содержать минимум 6 символов, включая большую букву, маленькую букву, число и специальный символ !!!"
      );
      // Show error message
      setText("Ошибка: Неверный пароль");
      setSuccess(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return;
    }

    setPasswordError(""); // Xatolikni tozalash agar parol to'g'ri bo'lsa
    setText("Пользователь успешно добавлен"); // Set success message
    setSuccess(true);
    setShowSuccess(true); // Show success message
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    onSubmit(e); // Parol to'g'ri bo'lsa formani yuborish
  };

  // Function to render success or error message
  const renderSuccessMessage = () => {
    if (showSuccess) {
      return <Referense title={text} background={success} />;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">Добавить нового пользователя</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            Имя пользователя:
            <input className="modal-input" type="text" name="username" required />
          </label>
          <label className="modal-label">
            Пароль:
            <input
              className="modal-input"
              type="password"
              name="password"
              required
            />
          </label>
          {passwordError && (
            <p className="modal-error">{passwordError}</p> // Xatolik xabari
          )}
          <label className="modal-label">
            Роль:
            <select className="modal-select" name="role" required>
              <option value="Админ">АДМИН</option>
              <option value="Пользователь">ПОЛЬЗОВАТЕЛЬ</option>
            </select>
          </label>
          <label className="modal-label">
            Статус:
            <select className="modal-select" name="status" required>
              <option value="активный">активный</option>
              <option value="не активен">не активен</option>
            </select>
          </label>
          <button className="modal-submit" type="submit">
          добавить пользователя
          </button>
        </form>
        {renderSuccessMessage()} {/* Rendering the success/error message */}
      </div>
    </div>
  );
};

export default Addusermodal;
