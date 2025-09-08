import React, { useEffect, useState } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../style/AdminPanel.css";
import Referense from "../../../Referense";
import OperatingSystemSelect from "./OperatingSystemSelect";
import AddInstalledSoftwareModal from "./AddInstalledSoftwareModal";

const BACK_API = process.env.REACT_APP_BACK_API;

export default function AdminPanelInstalledSoftware() {
  const [softwares, setSoftwares] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingData, setEditingData] = useState({ name: "", operating_system_id: "" });

  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- Fetch softwares ---
  const fetchSoftwares = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACK_API}api/viewinstalledsoftware?page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setSoftwares(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error("Ошибка installed_software:", err);
    }
  };

  useEffect(() => {
    fetchSoftwares();
  }, [page, size]);

  // --- Add software ---
  const addSoftware = async (newData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACK_API}api/createinstalledsoftware`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData), // { name, operating_system_id }
      });
      const result = await response.json();
      setSuccess(response.ok);
      setText(result.message || (response.ok ? "ПО успешно добавлено!" : "Ошибка при добавлении!"));
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        fetchSoftwares();
        setShowAdd(false);
      }, 3000);
    } catch (err) {
      setSuccess(false);
      setText("Ошибка при добавлении!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // --- Update software ---
  const updateSoftware = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACK_API}api/updateinstalledsoftware/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingData),
      });
      const result = await response.json();
      setSuccess(response.ok);
      setText(result.message || (response.ok ? "Успешно обновлено!" : "Ошибка при обновлении!"));
      setShowSuccess(true);
      setEditing(null);
      setTimeout(() => {
        setShowSuccess(false);
        fetchSoftwares();
      }, 3000);
    } catch (err) {
      setSuccess(false);
      setText("Ошибка при обновлении!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // --- Delete software ---
  const deleteSoftware = async (id) => {
    if (!window.confirm("Удалить программное обеспечение?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACK_API}api/deleteinstalledsoftware/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      setSuccess(response.ok);
      setText(result.message || (response.ok ? "Успешно удалено!" : "Ошибка при удалении!"));
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        fetchSoftwares();
      }, 3000);
    } catch (err) {
      setSuccess(false);
      setText("Ошибка при удалении!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="adminPanel-container">
      <div className="adminPanel-header">
        {/* Pagination */}
        <div className="adminPanel-pagination">
          <button className="adminPanel-pagination-button" onClick={() => setPage(page - 1)} disabled={page === 1}>
            <FaChevronLeft />
          </button>
          <div className="adminPanel-pagination-page">{page}</div>
          <button className="adminPanel-pagination-button" onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / size)}>
            <FaChevronRight />
          </button>
          <select className="adminPanel-pagination-select" value={size} onChange={(e) => setSize(Number(e.target.value))}>
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
          </select>
          <div className="adminPanel-pagination-total">Общий: {total}</div>
        </div>

        {/* Add */}
        <button className="adminPanel-add-button" onClick={() => setShowAdd(true)}>
          <FaPlus /> Добавить ПО
        </button>
      </div>

      {/* Table */}
      <table className="adminPanel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название ПО</th>
            <th>ОС</th>
            <th className="table-action">Действия</th>
          </tr>
        </thead>
        <tbody>
          {softwares.map((sw, i) => (
            <tr key={sw.id}>
              <td>{i + 1 + (page - 1) * size}</td>

              {/* Name */}
              <td>
                {editing === sw.id ? (
                  <input
                    className="adminPanel-input-edit"
                    value={editingData.name}
                    onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  />
                ) : (
                  sw.name
                )}
              </td>

              {/* Operating System */}
              <td>
  {editing === sw.id ? (
    <OperatingSystemSelect
      value={editingData.operating_system_id}
      onChange={(val) => setEditingData({ ...editingData, operating_system_id: val })}
    />
  ) : (
    sw.operating_systems?.map(os => os.name).join(", ") || "-"
  )}
</td>


              {/* Actions */}
              <td className="adminPanel-edit-btns">
                {editing === sw.id ? (
                  <button className="adminPanel-save-btn" onClick={() => updateSoftware(sw.id)}>Сохранить</button>
                ) : (
                  <>
                    <button className="adminPanel-edit-btn" onClick={() => setEditing(sw.id) || setEditingData({ name: sw.name, operating_system_id: sw.system?.id || "" })}>
                      Редактировать
                    </button>
                    <button className="adminPanel-delete-btn" onClick={() => deleteSoftware(sw.id)}>Удалить</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAdd && <AddInstalledSoftwareModal onClose={() => setShowAdd(false)} onSave={addSoftware} />}
      {showSuccess && <Referense title={text} background={success} />}
    </div>
  );
}
