import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../style/AdminPanel.css";
import AddEmployeeModal from "./AdminEmployeeModal";
import Referense from "../../../Referense";

const BACK_API = process.env.REACT_APP_BACK_API;

export default function AdminPanelEmployee() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [showAdd, setShowAdd] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editingData, setEditingData] = useState({
    fullname: "",
    position: "",
  });

  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  // 🔒 Lock
  const lockUI = () => {
    setIsLocked(true);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      window.location.reload();
    }, 3000);
  };

  // Xodimlarni olish
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BACK_API}api/viewemployee?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Ошибка при получении сотрудников");

      const result = await res.json();
      setEmployees(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error("Ошибка при получении сотрудников:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, size]);

  // Qo‘shish
  const addEmployee = async (newEmployee) => {
    if (isLocked) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACK_API}api/createemployee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setText(result.message || "Сотрудник успешно добавлен!");
        lockUI();
      } else if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/");
        }, 3000);
      } else {
        const errorResult = await response.json();
        setSuccess(false);
        setText(errorResult.message || "Ошибка при добавлении сотрудника");
        lockUI();
      }
    } catch (error) {
      setSuccess(false);
      setText("Ошибка соединения с сервером");
      lockUI();
    }
  };

  // Yangilash
  const updateEmployee = async (id) => {
    if (isLocked) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACK_API}api/updateemployee/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setText(result.message || "Сотрудник успешно обновлен!");
        lockUI();
      } else if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/");
        }, 3000);
      } else {
        const errorData = await response.json();
        setSuccess(false);
        setText(errorData.message || "Ошибка при обновлении сотрудника");
        lockUI();
      }
    } catch (err) {
      setSuccess(false);
      setText("Ошибка при обновлении");
      lockUI();
    }
  };

  // O‘chirish
  const deleteEmployee = async (id) => {
    if (isLocked) return;
    if (!window.confirm("Вы уверены, что хотите удалить сотрудника?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACK_API}api/deleteemployee/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setText(result.message || "Сотрудник успешно удален!");
        lockUI();
      } else if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/");
        }, 3000);
      } else {
        const errorResult = await response.json();
        setText(errorResult.message || "Ошибка при удалении сотрудника");
        setSuccess(false);
        lockUI();
      }
    } catch (err) {
      setText("Ошибка при удалении сотрудника");
      setSuccess(false);
      lockUI();
    }
  };

  // Pagination
  const pagePrev = () => page > 1 && setPage(page - 1);
  const pageNext = () => page < Math.ceil(total / size) && setPage(page + 1);

  // message render
  const renderSuccessMessage = () => {
    if (showSuccess) {
      return <Referense title={text} background={success} />;
    }
  };

  return (
    <div className="adminPanel-container">
      <div className="adminPanel-header">
        {/* Pagination */}
        <div className="adminPanel-pagination">
          <button className="adminPanel-pagination-button" onClick={pagePrev}>
            <FaChevronLeft />
          </button>
          <div className="adminPanel-pagination-page">{page}</div>
          <button className="adminPanel-pagination-button" onClick={pageNext}>
            <FaChevronRight />
          </button>
          <select
            className="adminPanel-pagination-select"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          >
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
          </select>
          <div className="adminPanel-pagination-total">Общий: {total}</div>
        </div>

        {/* Qo‘shish */}
        <div className="adminPanel-controls">
          <button
            className="adminPanel-add-button"
            onClick={() => setShowAdd(true)}
          >
            <FaPlus /> Добавить сотрудника
          </button>
        </div>
      </div>

      {/* Jadval */}
      <table className="adminPanel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ФИО</th>
            <th>Краткое имя</th>
            <th>Должность (ID)</th>
            <th>Отдел</th>
            <th>Подразделение</th>
            <th>Паспорт серия</th>
            <th>Кем выдан</th>
            <th>Дата выдачи</th>
            <th>Создан</th>
            <th className="table-action">Параметры</th>
          </tr>
        </thead>

        <tbody>
          {employees.length ? (
            employees.map((emp, i) => (
              <tr key={emp.id}>
                <td>{i + 1 + (page - 1) * size}</td>
                <td>
                  {editing === emp.id ? (
                    <input
                      type="text"
                      value={editingData.fullname}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          fullname: e.target.value,
                        })
                      }
                    />
                  ) : (
                    emp.fullname
                  )}
                </td>
                <td>{emp.shortname}</td>
                <td>{emp.position_id}</td>
                <td>{emp.department}</td>
                <td>{emp.subdivision}</td>
                <td>{emp.passport_serial_number}</td>
                <td>{emp.passport_given_by}</td>
                <td>
                  {new Date(emp.passport_given_date).toLocaleDateString(
                    "ru-RU"
                  )}
                </td>
                <td>{new Date(emp.created_at).toLocaleDateString("ru-RU")}</td>
                <td className="adminPanel-edit-btns">
                  {editing === emp.id ? (
                    <button onClick={() => updateEmployee(emp.id)}>
                      Сохранить
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditing(emp.id);
                          setEditingData({
                            fullname: emp.fullname,
                            shortname: emp.shortname,
                            department: emp.department,
                          });
                        }}
                      >
                        Редактировать
                      </button>
                      <button onClick={() => deleteEmployee(emp.id)}>
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11">Сотрудники не найдены</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onSave={addEmployee}
        />
      )}
      {renderSuccessMessage()}
    </div>
  );
}
