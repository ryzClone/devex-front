import React, { useState } from "react";
import axios from "axios";
import "../../style/ExcelExport.css"; // CSS fayl qo‘shildi

const ExcelExport = ({ show, onClose, onSubmit }) => {
    const [table, setTable] = useState("users");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5000/api/export-excel/${table}?start=${startDate}&end=${endDate}`,
                {
                    responseType: "blob",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Faylni yuklab olish
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${table}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url); // Xotirani tozalash

            if (onSubmit) onSubmit(); // **Excel yuklab olingandan keyin modal yopiladi**
        } catch (error) {
            console.error("Ошибка при загрузке отчета в Excel:", error);
        }
    };

    if (!show) return null; // `show === false` bo‘lsa, komponentni ko‘rsatmaslik

    return (
        <div className="excel-export-modal">
        <div className="excel-export">
            <h2>Отчёт</h2>
            
            <label>Выберите тип:</label>
            <select value={table} onChange={(e) => setTable(e.target.value)}>
                <option value="users">Пользователи</option>
                <option value="texnika">Техника</option>
                <option value="transfered">Перемещенные</option>
                <option value="user_history">История пользователей</option>
                <option value="tex_history">История техники</option>
            </select>
    
            <label>Дата начала:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
    
            <label>Дата окончания:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
    
            <div className="button-group">
                <button onClick={handleDownload}>Скачать отчет</button>
                <button onClick={onClose} className="close-button">Закрыть</button>
            </div>
        </div>
    </div>
    
    );
};

export default ExcelExport;
