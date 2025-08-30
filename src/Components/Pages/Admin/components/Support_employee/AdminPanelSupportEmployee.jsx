import React, { useEffect, useState } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../style/AdminPanel.css";
import AddSupportEmployeeModal from "./AddSupportEmployeeModal";
import Referense from "../../../Referense";

const BACK_API = process.env.REACT_APP_BACK_API;

export default function AdminPanelSupportEmployee() {
  const [supportEmployees, setSupportEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingData, setEditingData] = useState({ fullname: "" });

  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch
  const fetchSupportEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BACK_API}api/viewemployeesupport?page=${page}&size=${size}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      setSupportEmployees(result.data || []);
      setTotal(result.total || 0);
      console.log(result.data);
    } catch (err) {
      console.error("Ошибка support_employee:", err);
    }
  };

  useEffect(() => {
    fetchSupportEmployees();
  }, [page, size]);

// Add
const addSupportEmployee = async (newData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BACK_API}api/createemployeesupport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newData),
    });

    if (response.ok) {
      const result = await response.json();
      setSuccess(true);
      setText(result.message || "Поддержка пользователей успешно добавлена!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        fetchSupportEmployees(); 
      }, 3000);
    } else {
      const errorResult = await response.json();
      setText(errorResult.message || "Ошибка при добавлении!");
      setSuccess(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  } catch (err) {
    setText("Ошибка при добавлении!");
    setSuccess(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }
};

// Update
const updateSupportEmployee = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BACK_API}api/updateemployeesupport/${id}`, {
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
      setText(result.message || "Успешно обновлено!");
      setShowSuccess(true);
      setEditing(null);
      setTimeout(() => {
        setShowSuccess(false);
        fetchSupportEmployees();
      }, 3000);
    } else {
      const errorResult = await response.json();
      setText(errorResult.message || "Ошибка при обновлении!");
      setSuccess(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  } catch (err) {
    setText("Ошибка при обновлении!");
    setSuccess(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }
};

// Delete
const deleteSupportEmployee = async (id) => {
  if (!window.confirm("Удалить поддержку пользователей?")) return;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BACK_API}api/deleteemployeesupport/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const result = await response.json();
      setSuccess(true);
      setText(result.message || "Успешно удалено!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        fetchSupportEmployees();
      }, 3000);
    } else {
      const errorResult = await response.json();
      setText(errorResult.message || "Ошибка при удалении!");
      setSuccess(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  } catch (err) {
    setText("Ошибка при удалении!");
    setSuccess(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }
};


  return (
    <div className="adminPanel-container">
      <div className="adminPanel-header">
        {/* Pagination */}
        <div className="adminPanel-pagination">
          <button
            className="adminPanel-pagination-button"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <FaChevronLeft />
          </button>
          <div className="adminPanel-pagination-page">{page}</div>
          <button
            className="adminPanel-pagination-button"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / size)}
          >
            <FaChevronRight />
          </button>
          <select
            className="adminPanel-pagination-select"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
          </select>
          <div className="adminPanel-pagination-total">Общий: {total}</div>
        </div>

        {/* Add */}
        <button
          className="adminPanel-add-button"
          onClick={() => setShowAdd(true)}
        >
          <FaPlus /> Добавить Поддержка пользователей
        </button>
      </div>

      {/* Table */}
      <table className="adminPanel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ФИО</th>
            <th>Краткое имя</th>
            <th className="table-action">Действия</th>
          </tr>
        </thead>
        <tbody>
          {supportEmployees.map((emp, i) => (
            <tr key={emp.id}>
              <td>{i + 1 + (page - 1) * size}</td>

              {/* ФИО */}
              <td>
                {editing === emp.id ? (
                  <input
                    className="adminPanel-input-edit"
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

              {/* Краткое имя */}
              <td>
                {editing === emp.id ? (
                  <input
                    className="adminPanel-input-edit"
                    value={editingData.shortname}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        shortname: e.target.value,
                      })
                    }
                  />
                ) : (
                  emp.shortname
                )}
              </td>

              {/* Действия */}
              <td className="adminPanel-edit-btns">
                {editing === emp.id ? (
                  <button
                    className="adminPanel-save-btn"
                    onClick={() => updateSupportEmployee(emp.id)}
                  >
                    Сохранить
                  </button>
                ) : (
                  <>
                    <button
                      className="adminPanel-edit-btn"
                      onClick={() => {
                        setEditing(emp.id);
                        setEditingData({
                          fullname: emp.fullname,
                          shortname: emp.shortname,
                        });
                      }}
                    >
                      Редактировать
                    </button>
                    <button
                      className="adminPanel-delete-btn"
                      onClick={() => deleteSupportEmployee(emp.id)}
                    >
                      Удалить
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAdd && (
        <AddSupportEmployeeModal
          onClose={() => setShowAdd(false)}
          onSave={addSupportEmployee}
        />
      )}
      {showSuccess && <Referense title={text} background={success} />}
    </div>
  );
}
