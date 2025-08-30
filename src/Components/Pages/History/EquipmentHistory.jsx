import React, { useEffect, useRef, useState } from "react";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
} from "react-icons/fa";
import "../../style/history.css";
import { useNavigate } from "react-router-dom";
import Referense from "../Referense";
import axios from "axios";

export default function EquipmentHistory({ closeModal, user }) {
  const [historyData, setHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedOptionFetch, setSelectedOptionFetch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [total, setTotal] = useState(100);

  const BACK_API = process.env.REACT_APP_BACK_API;
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [size, page, searchTerm, selectedOption]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleDropdownToggle = () => setIsDropdownOpen((prev) => !prev);
  const handleDropdownOptionClick = (option) => {
    let filterKey = "";
    switch (option) {
      case "Пользователь":
        filterKey = "user_id";
        break;
      case "Сотрудник":
        filterKey = "employee_id";
        break;
      default:
        filterKey = "";
    }

    setSelectedOption(option);
    setSelectedOptionFetch(filterKey);
    setIsDropdownOpen(false);
  };

  const maxPage = Math.ceil(total / size);
  const pagePrev = () => page > 1 && setPage((prevPage) => prevPage - 1);
  const pageNext = () => page < maxPage && setPage((prevPage) => prevPage + 1);
  const handleClose = (e) => e.target === e.currentTarget && closeModal();

  const fetchHistory = async () => {
    const data = {
      page,
      size,
      search: searchTerm,
      filter: selectedOptionFetch,
      intity_id: user.id,
      user_id: localStorage.getItem("user_id"),
    };

    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams(data).toString();

      const response = await fetch(`${BACK_API}api/equipmenthistory?${queryParams}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/login");
        }, 3000);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setHistoryData(result.data);
        console.log(result.data);
        
        setTotal(result.total);
      } else {
        console.error("Error fetching equipment history:", response.statusText);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const handleUploadClick = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/export-history/filtered/equipment_history`,
        {
          user_id: localStorage.getItem("user_id"),
          filename: "equipment_history",
          records: historyData,
        },
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ИСТОРИЯ ТЕХНИКИ.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Excel yuklab olishda xatolik:", error);
    }
  };

  const renderSuccessMessage = () =>
    showSuccess && <Referense title={text} background={success} />;

  return (
    <div className="history_modal-overlay" onClick={handleClose}>
      <div className="history_modal-content">
        <button className="history_modal-close" onClick={closeModal}>
          <FaTimes />
        </button>
        <div className="history_modal-controls">
          <div className="pagination">
            <button className="pagination-button" onClick={pagePrev}>
              <FaChevronLeft />
            </button>
            <div className="pagination-page">{page}</div>
            <button className="pagination-button" onClick={pageNext}>
              <FaChevronRight />
            </button>
            <select
              className="pagination-select"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
            >
              <option value="20">20</option>
              <option value="40">40</option>
              <option value="60">60</option>
            </select>
            <div className="pagination-total">общий: {total}</div>
          </div>

          <div className="history_modal-controls-right">
            <button className="export-table-btn" onClick={handleUploadClick}>
              Отчёт
            </button>
            <div className="history_modal-search">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="history_modal-dropdown">
              <div
                className={`custom-dropdown ${isDropdownOpen ? "active" : ""}`}
                ref={dropdownRef}
              >
                <button
                  className="custom-dropdown-button"
                  onClick={handleDropdownToggle}
                >
                  {selectedOption || "Пользователь"}
                </button>
                {isDropdownOpen && (
                  <div className="custom-dropdown-content">
                    <div onClick={() => handleDropdownOptionClick("Пользователь")}>
                      Пользователь
                    </div>
                    <div onClick={() => handleDropdownOptionClick("Сотрудник")}>
                      Сотрудник
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="history_modal-body">
          <h2>ИСТОРИЯ ТЕХНИКИ</h2>
            <table className="history_info-table">
            {historyData.length > 0 ? (
                <>
                <thead>
                    <tr>
                    <th>Ид</th>
                    <th>Имя пользователя</th>
                    <th>Наименования тех</th>
                    <th>Инв. номер</th>
                    <th>Описание</th>
                    <th>Статус</th>
                    <th>Тип операции</th>
                    <th>Тип сущности</th>
                    <th>Дата</th>
                    </tr>
                </thead>
                <tbody>
                    {historyData.map((row, index) => (
                    <tr key={row.id}>
                        <td>{index + 1 + (page - 1) * size}</td>
                        <td>{row.user_histories?.username || "—"}</td>
                        <td>{row.equipment_entity?.name || "—"}</td>
                        <td>{row.equipment_entity?.inventory_number || "—"}</td>
                        <td>{row.description || "—"}</td>
                        <td>{row.equipment_entity?.status || "—"}</td>
                        <td>{row.action}</td>
                        <td>{row.entity_type}</td>
                        <td>
                        {new Date(row.created_at).toLocaleString("ru-RU", {
                            timeZone: "UTC",
                        })}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </>
            ) : (
                <tbody>
                <tr>
                    <td colSpan={9}>Нет записей.</td>
                </tr>
                </tbody>
            )}
            </table>
        </div>
      </div>
      {renderSuccessMessage()}
    </div>
  );
}
