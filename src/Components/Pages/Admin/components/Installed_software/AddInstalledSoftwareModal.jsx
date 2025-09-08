import React, { useState, useEffect } from "react";
import Select from "react-select";
import "../../style/AdminPanel.css";

export default function AddInstalledSoftwareModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [selectedOS, setSelectedOS] = useState(null);

  // Backenddan OS larni olib kelish
  useEffect(() => {
    const fetchOperatingSystems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.REACT_APP_BACK_API}api/viewoperatingsystem?page=1&size=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.data) {
          setOperatingSystems(result.data.map((os) => ({ value: os.id, label: os.name })));
        }
      } catch (err) {
        console.error("Ошибка загрузки ОС:", err);
      }
    };
    fetchOperatingSystems();
  }, []);

const handleSubmit = (e) => {
  e.preventDefault();
  if (!selectedOS) {
    alert("Выберите операционную систему!");
    return;
  }
  onSave({ 
    name, 
    operating_system_ids: [selectedOS.value] // singular → array
  });
  setName("");
  setSelectedOS(null);
  onClose();
};


  return (
    <div className="adminPanel-modal-overlay" onClick={onClose}>
      <div className="adminPanel-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="adminPanel-modal-close" onClick={onClose}>×</button>
        <h2 className="adminPanel-modal-title">➕ Добавить ПО</h2>
        <form className="adminPanel-modal-form" onSubmit={handleSubmit}>
          {/* Название ПО */}
          <input
            type="text"
            placeholder="Название ПО"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="adminPanel-modal-input"
            required
          />

          {/* Operating System select */}
          <Select
            options={operatingSystems}
            value={selectedOS}
            onChange={setSelectedOS}
            placeholder="Выберите ОС"
            className="adminPanel-modal-select"
          />

          <button type="submit" className="adminPanel-modal-submit">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
