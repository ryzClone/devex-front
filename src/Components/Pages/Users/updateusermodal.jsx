import React, { useState, useEffect } from "react";
import "../../style/Addusermodal.css"; // Modal uchun CSS
import Referense from "../Referense";

const UpdateUserModal = ({ show, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    username: "",
    users_id: localStorage.getItem("user_id") || "",
    password: "",
    role: "Пользователь",
    status: "активный",
    id: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [text, setText] = useState(""); // Xabar matni uchun
  const [success, setSuccess] = useState(false); // Muvaffaqiyatli yoki xato uchun
  const [showSuccess, setShowSuccess] = useState(false); // Xabarni ko'rsatish

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username || "",
        password: user.password || "",
        role: user.role || "Пользователь",
        status: user.status || "активный",
        id: user.id || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== user.password) {
      if (
        !formData.password.trim().startsWith("$2b$10$") &&
        !validatePassword(formData.password)
      ) {
        setPasswordError("Пароль должен содержать минимум 6 символов, включая большую букву, маленькую букву, число и специальный символ !!!");
        setText("Ошибка: Неверный пароль");
        setSuccess(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        return;
      }
    } else {
      formData.password = user.password;
    }

    setPasswordError("");
    setText("Пользователь успешно обновлен");
    setSuccess(true);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      onSubmit(formData); // Formani yuborish
      onClose(); // Modalni yopish
    }, 3000);
  };

  if (!show) return null;

  const renderSuccessMessage = () => {
    if (showSuccess) {
      return <Referense title={text} background={success} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">Обновить пользователя</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={formData.id} />
          <label className="modal-label">
            Имя пользователя:
            <input
              className="modal-input"
              type="text"
              name="system_users"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>

          <label className="modal-label">
            Пароль:
            <input
              className="modal-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          {passwordError && <p className="modal-error">{passwordError}</p>}
          {renderSuccessMessage()}

          <label className="modal-label">
            Роль:
            <select
              className="modal-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Админ">Админ</option>
              <option value="Пользователь">Пользователь</option>
            </select>
          </label>

          <label className="modal-label">
            Статус:
            <select
              className="modal-select"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="активный">активный</option>
              <option value="не активен">не активен</option>
            </select>
          </label>

          <button className="modal-submit" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserModal;
