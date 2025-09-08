import React, { useEffect, useState } from "react";
import Select from "react-select";

export default function OperatingSystemSelect({ editingData, setEditingData }) {
  const [options, setOptions] = useState([]);

  // Backenddan OSlarni olib kelamiz
  useEffect(() => {
    const fetchOS = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.REACT_APP_BACK_API}api/viewoperatingsystem?page=1&size=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const result = await res.json();
        if (result.data) {
          setOptions(result.data.map((os) => ({ value: os.id, label: os.name })));
        }
      } catch (err) {
        console.error("Ошибка загрузки ОС:", err);
      }
    };

    fetchOS();
  }, []);

  return (
    <Select
      options={options}
      value={options.find((o) => o.value === editingData.operating_system_id) || null}
      onChange={(selected) =>
        setEditingData({
          ...editingData,
          operating_system_id: selected?.value || null,
        })
      }
      placeholder="Выберите ОС"
    />
  );
}
