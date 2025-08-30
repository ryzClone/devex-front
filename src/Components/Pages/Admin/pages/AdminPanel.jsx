import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./AdminPanel.css";

const intervalOptions = ["daily", "weekly", "monthly"];

export default function AdminPanel() {
  // Countlar
  const [employeeCount, setEmployeeCount] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [positionCount, setPositionCount] = useState(0);
  const [operatingSystemCount, setOperatingSystemCount] = useState(0);
  const [installedSoftwareCount, setInstalledSoftwareCount] = useState(0);

  // Chartlar
  const [employeeChart, setEmployeeChart] = useState([]);
  const [supportChart, setSupportChart] = useState([]);
  const [positionChart, setPositionChart] = useState([]);
  const [operatingSystemChart, setOperatingSystemChart] = useState([]);
  const [installedSoftwareChart, setInstalledSoftwareChart] = useState([]);

  // Table ma’lumotlari
  const [employeeTable, setEmployeeTable] = useState([]);
  const [supportTable, setSupportTable] = useState([]);
  const [positionTable, setPositionTable] = useState([]);
  const [operatingSystemTable, setOperatingSystemTable] = useState([]);
  const [installedSoftwareTable, setInstalledSoftwareTable] = useState([]);

  const [selectedInterval, setSelectedInterval] = useState("daily");

  const BACK_API = process.env.REACT_APP_BACK_API;

  const [excelDateRange, setExcelDateRange] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const lastDay = now.toISOString().slice(0, 10);
    return { from: firstDay, to: lastDay };
  });

  // Modal uchun state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    fetchStats(selectedInterval);
  }, [selectedInterval]);

  const fetchStats = async (interval) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${BACK_API}api/admin-panel/stats?interval=${interval}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        console.error("Xatolik:", response.status, response.statusText);
        return;
      }
      const data = await response.json();

      // Chartlar
      setEmployeeChart(data.employeeGrowthChart || []);
      setSupportChart(data.supportGrowthChart || []);
      setPositionChart(data.positionGrowthChart || []);
      setOperatingSystemChart(data.osGrowthChart || []);
      setInstalledSoftwareChart(data.softwareGrowthChart || []);

      // Countlar
      setEmployeeCount(data.totalEmployees || 0);
      setSupportCount(data.totalSupportEmployees || 0);
      setPositionCount(data.totalPositions || 0);
      setOperatingSystemCount(data.totalOperatingSystems || 0);
      setInstalledSoftwareCount(data.totalInstalledSoftware || 0);

      // Jadval ma’lumotlari
      setEmployeeTable(data.employeeTable || []);
      setSupportTable(data.supportTable || []);
      setPositionTable(data.positionTable || []);
      setOperatingSystemTable(data.osTable || []);
      setInstalledSoftwareTable(data.softwareTable || []);
    } catch (error) {
      console.error("Statistikani olishda xatolik:", error);
    }
  };

  const renderLineChart = (data, color) => (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#2e2559" }} />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #504973",
            borderRadius: "8px",
            color: "#2e2559",
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={3}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
  const handleExcelDateChange = (e, type) => {
    setExcelDateRange((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const exportToExcel = async (type) => {
    const { from, to } = excelDateRange;
    const tableName = type;
    const token = localStorage.getItem("token");

    if (!from || !to) {
      alert("Iltimos, sanalarni tanlang!");
      return;
    }

    try {
      const response = await fetch(`${BACK_API}api/adminpanel-export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ from, to, tableName }),
      });

      if (!response.ok) throw new Error("Excel yuklashda xatolik");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${tableName}-${from}-to-${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      console.log("Excel fayl muvaffaqiyatli yuklab olindi ✅");
    } catch (error) {
      console.error("Excel yuklab olishda xatolik:", error);
    }
  };

  const openModal = (title, type) => {
    setModalTitle(title);
    if (type === "Employee") setModalData(employeeTable);
    if (type === "SupportEmployee") setModalData(supportTable);
    if (type === "Position") setModalData(positionTable);
    if (type === "OperatingSystem") setModalData(operatingSystemTable);
    if (type === "InstalledSoftware") setModalData(installedSoftwareTable);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="adminpanel-container">
      <div className="adminpanel-interval-selector">
        {intervalOptions.map((opt) => (
          <button
            key={opt}
            className={`adminpanel-interval-btn ${
              selectedInterval === opt ? "active" : ""
            }`}
            onClick={() => setSelectedInterval(opt)}
          >
            {opt === "daily"
              ? "Kunlik"
              : opt === "weekly"
              ? "Haftalik"
              : "Oylik"}
          </button>
        ))}
      </div>

      <div className="adminpanel-block">
        
        {/* Xodimlar */}
        <div className="adminpanel-card adminpanel-border-employee">
          <div className="adminpanel-card-header">
            <span className="adminpanel-icon">👤</span>
            <span>Jami Xodimlar</span>
            <div className="adminpanel-date-filter">
              <input
                type="date"
                value={excelDateRange.from}
                onChange={(e) => handleExcelDateChange(e, "from")}
              />
              <input
                type="date"
                value={excelDateRange.to}
                onChange={(e) => handleExcelDateChange(e, "to")}
              />
            </div>
            <button
              className="adminpanel-excel-btn"
              onClick={() => exportToExcel("Employee")}
            >
              Excel
            </button>
            <button
              className="adminpanel-view-btn"
              onClick={() => openModal("Xodimlar", "Employee")}
            >
              View
            </button>
          </div>
          <p className="adminpanel-value">{employeeCount}</p>
          {renderLineChart(employeeChart, "#2e2559")}
        </div>

        {/* Yordamchi Xodimlar */}
        <div className="adminpanel-card adminpanel-border-support">
          <div className="adminpanel-card-header">
            <span className="adminpanel-icon">🛠️</span>
            <span>Yordamchi Xodimlar</span>
            <div className="adminpanel-date-filter">
              <input
                type="date"
                value={excelDateRange.from}
                onChange={(e) => handleExcelDateChange(e, "from")}
              />
              <input
                type="date"
                value={excelDateRange.to}
                onChange={(e) => handleExcelDateChange(e, "to")}
              />
            </div>
            <button
              className="adminpanel-excel-btn"
              onClick={() => exportToExcel("SupportEmployee")}
            >
              Excel
            </button>
            <button
              className="adminpanel-view-btn"
              onClick={() => openModal("Yordamchi Xodimlar", "SupportEmployee")}
            >
              View
            </button>
          </div>
          <p className="adminpanel-value">{supportCount}</p>
          {renderLineChart(supportChart, "#504973")}
        </div>

        {/* Lavozimlar */}
        <div className="adminpanel-card adminpanel-border-position">
          <div className="adminpanel-card-header">
            <span className="adminpanel-icon">🏷️</span>
            <span>Lavozimlar</span>
            <div className="adminpanel-date-filter">
              <input
                type="date"
                value={excelDateRange.from}
                onChange={(e) => handleExcelDateChange(e, "from")}
              />
              <input
                type="date"
                value={excelDateRange.to}
                onChange={(e) => handleExcelDateChange(e, "to")}
              />
            </div>
            <button
              className="adminpanel-excel-btn"
              onClick={() => exportToExcel("Position")}
            >
              Excel
            </button>
            <button
              className="adminpanel-view-btn"
              onClick={() => openModal("Lavozimlar", "Position")}
            >
              View
            </button>
          </div>
          <p className="adminpanel-value">{positionCount}</p>
          {renderLineChart(positionChart, "#3c3277")}
        </div>

        {/* Operating Systems */}
        <div className="adminpanel-card adminpanel-border-os">
          <div className="adminpanel-card-header">
            <span className="adminpanel-icon">💻</span>
            <span>Operating Systems</span>
            <div className="adminpanel-date-filter">
              <input
                type="date"
                value={excelDateRange.from}
                onChange={(e) => handleExcelDateChange(e, "from")}
              />
              <input
                type="date"
                value={excelDateRange.to}
                onChange={(e) => handleExcelDateChange(e, "to")}
              />
            </div>
            <button
              className="adminpanel-excel-btn"
              onClick={() => exportToExcel("OperatingSystem")}
            >
              Excel
            </button>
            <button
              className="adminpanel-view-btn"
              onClick={() => openModal("Operating Systems", "OperatingSystem")}
            >
              View
            </button>
          </div>
          <p className="adminpanel-value">{operatingSystemCount}</p>
          {renderLineChart(operatingSystemChart, "#3c3277")}
        </div>

        {/* Installed Software */}
        <div className="adminpanel-card adminpanel-border-software">
          <div className="adminpanel-card-header">
            <span className="adminpanel-icon">📦</span>
            <span>Installed Software</span>
            <div className="adminpanel-date-filter">
              <input
                type="date"
                value={excelDateRange.from}
                onChange={(e) => handleExcelDateChange(e, "from")}
              />
              <input
                type="date"
                value={excelDateRange.to}
                onChange={(e) => handleExcelDateChange(e, "to")}
              />
            </div>
            <button
              className="adminpanel-excel-btn"
              onClick={() => exportToExcel("InstalledSoftware")}
            >
              Excel
            </button>
            <button
              className="adminpanel-view-btn"
              onClick={() =>
                openModal("Installed Software", "InstalledSoftware")
              }
            >
              View
            </button>
          </div>
          <p className="adminpanel-value">{installedSoftwareCount}</p>
          {renderLineChart(installedSoftwareChart, "#3c3277")}
        </div>

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="adminpanel-modal-overlay" onClick={closeModal}>
          <div
            className="adminpanel-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="adminpanel-modal-title">{modalTitle}</h3>
            <table>
              <thead>
                <tr>
                  {modalData.length > 0 &&
                    Object.keys(modalData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {modalData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="adminpanel-close-modal" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
