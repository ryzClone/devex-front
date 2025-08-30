import React, { useState } from "react";
import "../style/EditPasswod.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Referense from "./Referense";
import { useNavigate } from "react-router-dom";

export default function EditPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [message, setMessage] = useState({ text: "", success: null });
  const [showMessage, setShowMessage] = useState(false);

  const BACK_API = process.env.REACT_APP_BACK_API;
  const navigate = useNavigate();

  // Parolni tekshiruvchi regex
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
    return passwordRegex.test(password);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      showMessageWithTimeout(
        "Пароль должен содержать минимум 6 символов, включая большую букву, маленькую букву, число и специальный символ.",
        false
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessageWithTimeout("Новый пароль и подтверждение пароля не совпадают.", false);
      return;
    }

    try {
      const system_users = localStorage.getItem("username");
      if (!system_users) {
        showMessageWithTimeout(
          "Информация о пользователе не найдена. Пожалуйста, войдите снова.",
          false
        );
        return;
      }

      const response = await fetch(`${BACK_API}api/updatepassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ system_users, oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.status === 403) {
        showMessageWithTimeout("Срок действия вашего токена истек.", false);
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (response.ok) {
        showMessageWithTimeout(data.message || "Пароль успешно обновлён.", true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        if (data.data?.login === "out") {
          localStorage.clear();
          setTimeout(() => navigate("/"), 2000);
        }
      } else {
        // Aniqlangan xabarlarni ko‘rsatish
        const errorMsg =
          data.message === "Неверный старый пароль"
            ? "Старый пароль введен неверно."
            : data.message || "Произошла ошибка при обновлении пароля.";
        showMessageWithTimeout(errorMsg, false);
      }
    } catch (error) {
      showMessageWithTimeout("Ошибка соединения с сервером.", false);
    }
  };

  const showMessageWithTimeout = (text, success) => {
    setMessage({ text, success });
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <div className="container">
      <h2>Изменить пароль</h2>
      <form onSubmit={handleSubmit}>
        {["old", "new", "confirm"].map((type) => (
          <div className="input-container" key={type}>
            <label htmlFor={`${type}Password`}>
              {type === "old"
                ? "Старый пароль:"
                : type === "new"
                ? "Новый пароль:"
                : "Подтвердите новый пароль:"}
            </label>
            <input
              type={showPassword[type] ? "text" : "password"}
              id={`${type}Password`}
              value={
                type === "old"
                  ? oldPassword
                  : type === "new"
                  ? newPassword
                  : confirmPassword
              }
              onChange={(e) => {
                if (type === "old") setOldPassword(e.target.value);
                else if (type === "new") setNewPassword(e.target.value);
                else setConfirmPassword(e.target.value);
              }}
              required
              className="edit-password-input"
            />
            <span
              className="eye-icon"
              onClick={() => togglePasswordVisibility(type)}
            >
              {showPassword[type] ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
        ))}

        <button type="submit" className="edit-password-button">
          Изменить
        </button>
      </form>
      {showMessage && (
        <div className="modal-error">
          <Referense title={message.text} background={message.success} />
        </div>
      )}
    </div>
  );
}
