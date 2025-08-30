import React, { useEffect, useState, useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../style/Website.css"; // CSS faylini import qilish
import logo from "../../images/svg/logo.svg";
import { UserContext } from "./Users/userContex";
import SeasonalEffect from "./seansonal/SeansonalEffect";

function Website() {
  const navigate = useNavigate();
  const location = useLocation();
  const [display, setDisplay] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [texnikaDisplay, setTexnikaDisplay] = useState("");
  const [adminDisplay, setAdminDisplay] = useState("");

  const pageTitleMap = {
    "/website": "Принятые устройства",
    "/website/transfers": "Переданных устройств",
    "/website/users": "Пользователи",
    "/website/texnika": "Техника в рабочем состоянии",
    "/website/texnika/repair": "Техника в ремонте",
    "/website/texnika/unused": "Техника в списании",
    "/website/editpassword": "Изменить пароль",
    "/website/texnikachart": "Данные техники",
    "/website/adminpanel": "Панель администратора",
    "/website/adminpanel/position": "Должности",
    "/website/adminpanel/help": "Поддержка",
    "/website/adminpanel/employee": "Сотрудники",
    "/website/adminpanel/support-staff": "Поддержка пользователей",
    "/website/adminpanel/operating-systems": "Операционные системы",
    "/website/adminpanel/installed-software": "Установленные программы",
  };

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const title = Object.keys(pageTitleMap).find(
    (key) => location.pathname === key
  );
  const pageTitle = title ? pageTitleMap[title] : "Default Title";

  const { setSearch } = useContext(UserContext);

  useEffect(() => {
    if (location.pathname.includes("/website/texnika")) {
      if (location.pathname === "/website/texnika") {
        setTexnikaDisplay("ish-holati");
      } else if (location.pathname === "/website/texnika/repair") {
        setTexnikaDisplay("remontda");
      } else if (location.pathname === "/website/texnika/unused") {
        setTexnikaDisplay("ishlatilma");
      }
    } else {
      setTexnikaDisplay("");
    }

    if (location.pathname.includes("/website/adminpanel")) {
      if (location.pathname === "/website/adminpanel/support-employees") {
        setAdminDisplay("support");
      } else if (location.pathname === "/website/adminpanel/employees") {
        setAdminDisplay("employees");
      } else if (location.pathname === "/website/adminpanel/positions") {
        setAdminDisplay("positions");
      }
    } else {
      setAdminDisplay("");
    }

    // Dropdown menyu holatini ko'rsatish
    const displayDoc = document.querySelector(".user-dropdown");
    if (displayDoc) {
      displayDoc.style.display = display ? "block" : "none";
    }

    // Avtorizatsiya va token tekshiruvi
    const token = localStorage.getItem("token");
    if (!token) {
      if (location.pathname !== "/") {
        navigate("/");
      }
    } else {
      const timer = setTimeout(() => {
        localStorage.clear();
        if (location.pathname !== "/") {
          navigate("/");
        }
      }, 3600000); // 1 soat

      return () => clearTimeout(timer);
    }
  }, [navigate, location.pathname, display, searchTerm]);

  const handleLogout = () => {
    window.location.pathname = "/";
    localStorage.removeItem("token");
  };

  const toggleDisplay = () => {
    setDisplay((prevDisplay) => !prevDisplay);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch(searchTerm);
  };

  const handleTexnikaClick = (section) => {
    if (texnikaDisplay === section) {
      setTexnikaDisplay("");
    } else {
      setTexnikaDisplay(section);
    }
  };

  return (
    <div className="website-container">
      <SeasonalEffect season="spring" />

      <header className="website-header">
        <div className="header-content">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            <div className="logo-container-text">Anorbank Обмен Устройств</div>
          </div>
          <nav className="website-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link
                  to="/website"
                  className={`nav-link ${
                    location.pathname === "/website" ? "active" : ""
                  }`}
                >
                  <i className="fas fa-check-circle nav-icon"></i>
                  <p>Принятые</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/website/transfers"
                  className={`nav-link ${
                    location.pathname === "/website/transfers" ? "active" : ""
                  }`}
                >
                  <i className="fas fa-exchange-alt nav-icon"></i>
                  <p>Переданных</p>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/website/users"
                  className={`nav-link ${
                    location.pathname === "/website/users" ? "active" : ""
                  }`}
                >
                  <i className="fas fa-users nav-icon"></i>
                  <p>Пользователи</p>
                </Link>
              </li>

              <li className="nav-item">
                <div className="nav-link-container">
                  <Link
                    to="/website/texnikachart"
                    className={`nav-link ${
                      location.pathname.startsWith("/website/texnika")
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setTexnikaDisplay(texnikaDisplay ? "" : "active")
                    }
                  >
                    <i className="fas fa-cogs nav-icon"></i>
                    <p>Техника</p>
                  </Link>
                  {texnikaDisplay && (
                    <div
                      className={`texnika-expandable ${
                        texnikaDisplay ? "active" : ""
                      }`}
                    >
                      <Link
                        to="/website/texnika"
                        className={`nav-link-tex ${
                          location.pathname === "/website/texnika"
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleTexnikaClick("ish-holati")}
                      >
                        <i className="fas fa-sync-alt"></i> В эксплуатации
                      </Link>
                      <Link
                        to="/website/texnika/repair"
                        className={`nav-link-tex ${
                          location.pathname === "/website/texnika/repair"
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleTexnikaClick("remontda")}
                      >
                        <i className="fas fa-tools"></i> В ремонте
                      </Link>
                      <Link
                        to="/website/texnika/unused"
                        className={`nav-link-tex ${
                          location.pathname === "/website/texnika/unused"
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleTexnikaClick("ishlatilma")}
                      >
                        <i className="fas fa-ban"></i> В списании
                      </Link>
                    </div>
                  )}
                </div>
              </li>

              <li className="nav-item">
                <div className="nav-link-container">
                  <Link
                    to="/website/adminpanel"
                    className={`nav-link ${
                      location.pathname.startsWith("/website/adminpanel")
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setAdminDisplay(adminDisplay ? "" : "active")
                    }
                  >
                    <i className="fas fa-user-shield nav-icon"></i>
                    <p>Админ панел</p>
                  </Link>
                  {adminDisplay && (
                    <div
                      className={`texnika-expandable ${
                        adminDisplay ? "active" : ""
                      }`}
                    >
                      <Link
                        to="/website/adminpanel/help"
                        className={`nav-link-tex ${
                          location.pathname ===
                          "/website/adminpanel/help"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="fas fa-headset"></i> Поддержка
                      </Link>

                      <Link
                        to="/website/adminpanel/employee"
                        className={`nav-link-tex ${
                          location.pathname === "/website/adminpanel/employee"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="fas fa-users"></i> Сотрудники
                      </Link>

                      <Link
                        to="/website/adminpanel/position"
                        className={`nav-link-tex ${
                          location.pathname === "/website/adminpanel/position"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="fas fa-briefcase"></i> Должност
                      </Link>

                      <Link
                        to="/website/adminpanel/support-staff"
                        className={`nav-link-tex ${
                          location.pathname ===
                          "/website/adminpanel/support-staff"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="fas fa-user-cog"></i> Поддержка пользователей
                      </Link>

                      <Link
                        to="/website/adminpanel/operating-systems"
                        className={`nav-link-tex ${
                          location.pathname ===
                          "/website/adminpanel/operating-systems"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="fas fa-desktop"></i> Операционные системы
                      </Link>

                      <Link
                        to="/website/adminpanel/installed-software"
                        className={`nav-link-tex ${
                          location.pathname ===
                          "/website/adminpanel/installed-software"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="fas fa-th-list"></i> Установленные программы
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="website-content">
        <div className="section-content">
          <div className="section-content-title">{pageTitle}</div>
          <div className="section-content-body">
            <form onSubmit={handleSubmit} className="section-content-body-form">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Поиск"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="search-button">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>

            <div className="section-content-body-user">
              <div className="user-icon" onClick={toggleDisplay}>
                <i className="fas fa-user"></i>
              </div>
              <div className="user-dropdown">
                <ul>
                  <li className="username">
                    Имя: <span>{username}</span>
                  </li>
                  <li className="role">
                    Роль: <span>{role}</span>
                  </li>
                  <li
                    onClick={() =>
                      (window.location.pathname = "/website/editpassword")
                    }
                  >
                    <i className="fas fa-key"></i>
                    <span>Изменить пароль</span>
                  </li>
                  <li onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Выход</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="section-outlet">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Website;
