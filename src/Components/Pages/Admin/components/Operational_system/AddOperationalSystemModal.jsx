import React, { useState, useEffect } from "react";
import Select from "react-select";
import "../../style/AdminPanel.css";

export default function AddOperationalSystemModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [softwares, setSoftwares] = useState([]); // backenddan kelgan barcha software
  const [selectedSoftwares, setSelectedSoftwares] = useState([]); // tanlanganlari
  const [loading, setLoading] = useState(true); // yuklanish holati
  const [error, setError] = useState(null);

  // softwarelarni backenddan olib kelamiz
  useEffect(() => {
    const fetchSoftwares = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.REACT_APP_BACK_API}api/viewinstalledsoftware`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const result = await res.json();

        if (result.success && result.data) {
          const options = result.data.map((s) => ({
            value: s.id,
            label: s.name,
          }));
          setSoftwares(options);
        } else {
          setError("Не удалось загрузить программы");
        }
      } catch (err) {
        console.error("Ошибка загрузки software:", err);
        setError("Ошибка загрузки программ");
      } finally {
        setLoading(false);
      }
    };

    fetchSoftwares();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    const softwareIds = selectedSoftwares.map((s) => s.value);

    // agar software tanlanmagan bo'lsa ogohlantirish
    if (!softwareIds.length) {
      alert("Выберите хотя бы одну программу для ОС");
      return;
    }

    onSave({ name, softwares: softwareIds });

    // formni tozalash
    setName("");
    setSelectedSoftwares([]);
    onClose();
  };

  return (
    <div className="adminPanel-modal-overlay" onClick={onClose}>
      <div
        className="adminPanel-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="adminPanel-modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="adminPanel-modal-title">➕ Операционная система</h2>

        {loading ? (
          <p>Загрузка программ...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <form className="adminPanel-modal-form" onSubmit={handleSubmit}>
            {/* Название ОС */}
            <input
              type="text"
              placeholder="Название ОС"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="adminPanel-modal-input"
              required
            />

            {/* Software select */}
            <Select
              isMulti
              options={softwares}
              value={selectedSoftwares}
              onChange={setSelectedSoftwares}
              placeholder="Выберите программы"
              className="adminPanel-modal-select"
            />

            <button type="submit" className="adminPanel-modal-submit">
              Сохранить
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
