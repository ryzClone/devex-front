import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../style/AdminPanel.css";
import AddPositionModal from "./AddPositionModal";
import Referense from "../../../Referense";

const BACK_API = process.env.REACT_APP_BACK_API;

export default function AdminPanelPosition() {
  const [positions, setPositions] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [showAdd, setShowAdd] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editingName, setEditingName] = useState("");

  // messageModal
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  const lockUI = () => {
    setIsLocked(true);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      window.location.reload();
    }, 3000);
  };

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BACK_API}api/viewposition?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Сервердан маълумот олишда хатолик");

      const result = await res.json();
      setPositions(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error("Ошибка при получении должностей:", err);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [page, size]);

  const addPosition = async (newPosition) => {
    if (isLocked) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACK_API}api/createposition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newPosition }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setText(result.message || "Должность успешно добавлена!");
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
        setText(errorResult.message || "Ошибка при добавлении должности");
        lockUI();
      }
    } catch (error) {
      setSuccess(false);
      setText("Ошибка соединения с сервером");
      lockUI();
    }
  };

  const updatePosition = async (id) => {
    if (isLocked) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BACK_API}api/updateposition/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingName }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setText(result.message || "Должность успешно обновлена!");
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
        setText(errorData.message || "Ошибка при обновлении");
        lockUI();
      }
    } catch (err) {
      setSuccess(false);
      setText("Ошибка при обновлении");
      lockUI();
    }
  };

  const deletePosition = async (id) => {
    if (isLocked) return;
    if (!window.confirm("Вы уверены, что хотите удалить?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACK_API}api/deleteposition/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setText(result.message || "Позиция успешно удалена!");
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
        setText(errorResult.message || "Ошибка при удалении позиции");
        setSuccess(false);
        lockUI();
      }
    } catch (err) {
      setText("Ошибка при удалении позиции");
      setSuccess(false);
      lockUI();
    }
  };

  const pagePrev = () => page > 1 && setPage(page - 1);
  const pageNext = () => page < Math.ceil(total / size) && setPage(page + 1);

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
          <div className="adminPanel-pagination-total">общий: {total}</div>
        </div>

        {/* Qo‘shish */}
        <div className="adminPanel-controls">
          <button
            className="adminPanel-add-button"
            onClick={() => setShowAdd(true)}
          >
            <FaPlus /> Добавить должность
          </button>
        </div>
      </div>

      {/* Jadval */}
      <table className="adminPanel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название должности</th>
            <th>Дата создания</th>
            <th className="table-action">Параметры</th>
          </tr>
        </thead>
        <tbody>
          {positions.length ? (
            positions.map((pos, i) => (
              <tr key={pos.id}>
                <td>{i + 1 + (page - 1) * size}</td>
                <td>
                  {editing === pos.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                  ) : (
                    pos.name
                  )}
                </td>
                <td>{new Date(pos.created_at).toLocaleDateString("ru-RU")}</td>
                <td className="adminPanel-edit-btns">
                  {editing === pos.id ? (
                    <button onClick={() => updatePosition(pos.id)}>
                      Сохранить
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditing(pos.id);
                          setEditingName(pos.name);
                        }}
                      >
                        Редактировать
                      </button>
                      <button onClick={() => deletePosition(pos.id)}>
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Должности не найдены</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showAdd && (
        <AddPositionModal onClose={() => setShowAdd(false)} onSave={addPosition} />
      )}
      {renderSuccessMessage()}
    </div>
  );
}
