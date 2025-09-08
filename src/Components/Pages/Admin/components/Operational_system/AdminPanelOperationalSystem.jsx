import React, { useEffect, useState } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../style/AdminPanel.css";
import AddOperationalSystemModal from "./AddOperationalSystemModal";
import Referense from "../../../Referense";
import SoftwareMultiSelect from "./SoftwareMultiSelect";

const BACK_API = process.env.REACT_APP_BACK_API;

export default function AdminPanelOperationalSystem() {
  const [systems, setSystems] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingData, setEditingData] = useState({ name: "" });

  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch
  const fetchSystems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BACK_API}api/viewoperatingsystem?page=${page}&size=${size}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      setSystems(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error("Ошибка operatsion_system:", err);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, [page, size]);

// Add
const addSystem = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BACK_API}api/createoperatingsystem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      setSuccess(true);
      setText(result.message || "Успешно добавлено!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        fetchSystems(); // listni yangilash
      }, 3000);
    } else {
      const errorResult = await response.json();
      setText(errorResult.message || "Ошибка при добавлении!");
      setSuccess(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  } catch (err) {
    console.error(err);
    setText("Ошибка при добавлении!");
    setSuccess(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }
};


  // Update
  const updateSystem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BACK_API}api/updateoperatingsystem/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setText(result.message || "Успешно обновлено!");
        setShowSuccess(true);
        setEditing(null);
        setTimeout(() => {
          setShowSuccess(false);
          fetchSystems();
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
  const deleteSystem = async (id) => {
    if (!window.confirm("Удалить операционную систему?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BACK_API}api/deleteoperatingsystem/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setText(result.message || "Успешно удалено!");
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          fetchSystems();
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
          <FaPlus /> Добавить ОС
        </button>
      </div>

      {/* Table */}
      <table className="adminPanel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название ОС</th>
            <th>Программы</th>
            <th className="table-action">Действия</th>
          </tr>
        </thead>
        <tbody>
          {systems.map((os, i) => (
            <tr key={os.id}>
              <td>{i + 1 + (page - 1) * size}</td>

              {/* Название ОС */}
              <td>
                {editing === os.id ? (
                  <input
                    className="adminPanel-input-edit"
                    value={editingData.name}
                    onChange={(e) =>
                      setEditingData({ ...editingData, name: e.target.value })
                    }
                  />
                ) : (
                  os.name
                )}
              </td>

              {/* Программы */}
              <td>
                {editing === os.id ? (
                  <SoftwareMultiSelect
                    os={os}
                    editingData={editingData}
                    setEditingData={setEditingData}
                  />
                ) : (
                  <ul>
                    {os.softwares?.map((s) => (
                      <li key={s.id}>{s.name}</li>
                    ))}
                  </ul>
                )}
              </td>

              {/* Действия */}
              <td className="adminPanel-edit-btns">
                {editing === os.id ? (
                  <button
                    className="adminPanel-save-btn"
                    onClick={() => updateSystem(os.id)}
                  >
                    Сохранить
                  </button>
                ) : (
                  <>
                    <button
                      className="adminPanel-edit-btn"
                      onClick={() => {
                        setEditing(os.id);
                        setEditingData({
                          name: os.name,
                          softwares: os.softwares?.map((s) => s.id) || [],
                        });
                      }}
                    >
                      Редактировать
                    </button>
                    <button
                      className="adminPanel-delete-btn"
                      onClick={() => deleteSystem(os.id)}
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
        <AddOperationalSystemModal
          onClose={() => setShowAdd(false)}
          onSave={addSystem}
        />
      )}
      {showSuccess && <Referense title={text} background={success} />}
    </div>
  );
}
