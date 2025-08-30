import React, { useState } from "react";
import "../style/Loginpage.css";
import LoginImg from "../images/Loginpage.jpg";
import Referense from "./Referense";

export default function LoginPage() {
  const [UserName, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  const BACK_API = process.env.REACT_APP_BACK_API;


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BACK_API}api/login`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: UserName,
          password: password,
        }),
      });

      // Xatolik statusini tekshirish
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Произошла ошибка");
      }

      const result = await response.json();

      const { token, username, role , user_id} = result.data;
      
      // Token va boshqa ma'lumotlarni saqlash
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("role", role);

      setSuccess(true);
      setText("Успешный вход");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        // Sahifani qayta yo'naltirish
        window.location.pathname = "/website";
      }, 1000);
    } catch (error) {
      setSuccess(false);
      setText(error.message || "Произошла ошибка");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }

    setPassword("");
  };

  const renderSuccessMessage = () => {
    if (showSuccess) {
      return <Referense title={text} background={success} />;
    }
  };

  return (
    <div className="loginpage-main">
      <div className="loginpage-container">
        <div className="loginpage-image">
          <img src={LoginImg} alt="Login" />
        </div>
        <div className="loginpage-form">
          <h2>Anorbank Обмен Устройств</h2> 

          <form onSubmit={handleSubmit} className="loginpage-form-body">
            <div className="form-group">
              <label htmlFor="username">Имя пользователя</label> {/* Tarjima: Foydalanuvchi nomi */}
              <input
                type="text"
                id="username"
                name="username"
                value={UserName}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль</label> {/* Tarjima: Parol */}
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Войти</button> {/* Tarjima: Kirish */}
          </form>
        </div>
        {renderSuccessMessage()}
      </div>
    </div>
  );
}
