import React, { useEffect, useState } from "react";
import Select from "react-select";

export default function SoftwareMultiSelect({ os, editingData, setEditingData }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchSoftwares = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.REACT_APP_BACK_API}api/viewinstalledsoftware`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await res.json();
        if (result.data) {
          setOptions(result.data.map((s) => ({ value: s.id, label: s.name })));
        }
      } catch (err) {
        console.error("Ошибка загрузки software:", err);
      }
    };
    fetchSoftwares();
  }, []);

  return (
    <Select
      isMulti
      options={options}
      value={options.filter((o) =>
        editingData.softwares?.includes(o.value)
      )}
      onChange={(selected) =>
        setEditingData({
          ...editingData,
          softwares: selected.map((s) => s.value),
        })
      }
      placeholder="Выберите программы"
    />
  );
}
