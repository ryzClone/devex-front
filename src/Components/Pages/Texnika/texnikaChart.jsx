import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import "../../style/Texnikachart.css";
import Referense from "../Referense";
import { useNavigate } from "react-router-dom";
import ExcelExport from "./UploadExcelTable";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const TexnikaChart = () => {
  const [chartData, setChartData] = useState({
    workingConditionData: [0, 0],
    repairData: [0, 0],
    unusedData: [0, 0],
    totalTexnika: 0,
    workingConditionCount: 0,
    repairCount: 0,
    unusedCount: 0,
  });
  const [selectedExcelExport, setSelectedExcelExport] = useState(false);

  const navigate = useNavigate();

  const BACK_API = process.env.REACT_APP_BACK_API;

  const token = localStorage.getItem("token");

  // Message Modal
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  const [isNull, setIsNull] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadErrors, setUploadErrors] = useState(null);
  const [uploadErrorsbtn, setUploadErrorsbtn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams({
          filter: "naimenovaniya_tex",
          status: "all",
          page: 1,
          size: 10,
        }).toString();

        const response = await fetch(
          `${BACK_API}api/readtexnika?${queryParams}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 403) {
          setText("Срок действия вашего токена истек");
          setSuccess(false);
          setShowSuccess(true);

          setTimeout(() => {
            setShowSuccess(false);
            navigate("/");
          }, 3000);
          return;
        }

        const responseBody = await response.json();
        if (!response.ok) throw new Error(responseBody.message);

        const texnikaData = responseBody.data;

        if (Array.isArray(texnikaData) && texnikaData.length > 0) {
          setIsNull(false);

          const totalTexnika = texnikaData.length;
          const readTexnika = texnikaData.filter(
            (item) => item.status === "В рабочем состоянии"
          );
          const readTexnikaRepair = texnikaData.filter(
            (item) => item.status === "В ремонте"
          );
          const readTexnikaUnused = texnikaData.filter(
            (item) => item.status === "В нерабочем состоянии"
          );

          setChartData({
            workingConditionData: [
              (readTexnika.length / totalTexnika) * 100,
              100 - (readTexnika.length / totalTexnika) * 100,
            ],
            repairData: [
              (readTexnikaRepair.length / totalTexnika) * 100,
              100 - (readTexnikaRepair.length / totalTexnika) * 100,
            ],
            unusedData: [
              (readTexnikaUnused.length / totalTexnika) * 100,
              100 - (readTexnikaUnused.length / totalTexnika) * 100,
            ],
            totalTexnika,
            workingConditionCount: readTexnika.length,
            repairCount: readTexnikaRepair.length,
            unusedCount: readTexnikaUnused.length,
          });
        } else {
          setIsNull(true);
        }

      } catch (error) {
        console.error("Ошибка:", error);
        setText(error.message || "Произошла ошибка при загрузке данных.");
        setSuccess(false);
        setShowSuccess(true);
      }
    };

    fetchData();
  }, [token, navigate , BACK_API]);

  const calculatePercentage = (part, total) => {
    return ((part / total) * 100).toFixed(0);
  };

  // Fayl tanlanganda darhol backendga yuborish
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);
    
    try {
      const response = await fetch(`${BACK_API}api/upload-excel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,       
      });
      
      const data = await response.json();
  
      if (response.ok) {    
        setText(data.message);
        setSuccess(false);
  
        setTimeout(() => {
          setShowSuccess(false);
          window.location.reload();
        }, 3000);
      } else {
        setText(data.message || "Произошла ошибка при загрузке файла");
        setUploadErrors(data.errors);
        setUploadErrorsbtn(true);
        setSuccess(false);
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      setText(error.message || "Ошибка сети");
      setSuccess(false);
      setShowSuccess(true);
    }
  
    setShowSuccess(true);
  };

  const handleUploadClick = () => {
    document.getElementById("file-input").click();
  };

  const closeModal = () => {
    setSelectedExcelExport(false); // ✅ Endi xato bo‘lmaydi
  };
  
  const handleModalExcelExport = () => {
    closeModal(); // ✅ Modalni yopish
  };

  const renderSuccessMessage = () => {
    if (showSuccess) {
      return <Referense title={text} background={success} />;
    }
  };

  return (
    <div>
      <div className="uploading-excel">
        <button
          className={`uploading_errors ${uploadErrorsbtn ? "show" : ""}`}
          onClick={() => setIsModalOpen(true)}
        >
          Просмотр ошибок
        </button>

        <button onClick={() => setSelectedExcelExport(true)}>Отчёт</button>

        <button type="button" onClick={handleUploadClick}>
          Загрузите файл Excel
        </button>

        <input
          type="file"
          id="file-input"
          style={{ display: "none" }}
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />

        {isModalOpen && (
          <div className="uploading-modal-overlay">
            <div className="uploading-modal">
              <h2>Ошибки</h2>
              <div className="uploading-modal-content">
                {uploadErrors.map((error, index) => (
                  <div key={index} className="uploading-error-item">
                    {error}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setUploadErrorsbtn(false);
                  window.location.reload();
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>

      {isNull ? (
        <div className="no-texnika-message">
          <p>В настоящее время нет зарегистрированных техники.</p>
        </div>
      ) : (
        <div className="texnika-chart-container">
          {/* Техника в рабочем состоянии */}
          <div className="donut-chart">
            <h3>В рабочем состоянии</h3>
            <div className="chart-content">
              <Doughnut
                data={{
                  labels: [], // Hide labels
                  datasets: [
                    {
                      data: chartData.workingConditionData,
                      backgroundColor: [
                        "rgb(75, 192, 192)",
                        "rgba(200, 200, 200, 0.7)",
                      ],
                      hoverOffset: 4,
                    },
                  ],
                }}
                options={{
                  cutout: "70%",
                  rotation: 0,
                  circumference: 360,
                  plugins: {
                    tooltip: {
                      enabled: false, // Disable tooltips
                    },
                    legend: {
                      display: false, // Disable legend
                    },
                  },
                  animation: {
                    duration: 0, // No animation
                  },
                }}
              />
              {/* Display percentage in the center of the donut */}
              <div className="donut-center">
                <p>
                  {calculatePercentage(
                    chartData.workingConditionCount,
                    chartData.totalTexnika
                  )}
                  %
                </p>
              </div>
            </div>
            <div className="chart-stats">
              <p>Всего техники: {chartData.totalTexnika}</p>
              <p>В рабочем состоянии: {chartData.workingConditionCount}</p>
            </div>
          </div>

          {/* Техника в ремонте */}
          <div className="donut-chart">
            <h3>В ремонте</h3>
            <div className="chart-content">
              <Doughnut
                data={{
                  labels: [], // Hide labels
                  datasets: [
                    {
                      data: chartData.repairData,
                      backgroundColor: [
                        "rgb(255, 99, 132)",
                        "rgba(200, 200, 200, 0.7)",
                      ],
                      hoverOffset: 4,
                    },
                  ],
                }}
                options={{
                  cutout: "70%",
                  rotation: 0,
                  circumference: 360,
                  plugins: {
                    tooltip: {
                      enabled: false, // Disable tooltips
                    },
                    legend: {
                      display: false, // Disable legend
                    },
                  },
                  animation: {
                    duration: 0, // No animation
                  },
                }}
              />
              {/* Display percentage in the center of the donut */}
              <div className="donut-center">
                <p>
                  {calculatePercentage(
                    chartData.repairCount,
                    chartData.totalTexnika
                  )}
                  %
                </p>
              </div>
            </div>
            <div className="chart-stats">
              <p>Всего техники: {chartData.totalTexnika}</p>
              <p>В ремонте: {chartData.repairCount}</p>
            </div>
          </div>

          {/* Техника в нерабочем состоянии */}
          <div className="donut-chart">
            <h3>В нерабочем состоянии</h3>
            <div className="chart-content">
              <Doughnut
                data={{
                  labels: [], // Hide labels
                  datasets: [
                    {
                      data: chartData.unusedData,
                      backgroundColor: [
                        "rgb(255, 159, 64)",
                        "rgba(200, 200, 200, 0.7)",
                      ],
                      hoverOffset: 4,
                    },
                  ],
                }}
                options={{
                  cutout: "70%",
                  rotation: 0,
                  circumference: 360,
                  plugins: {
                    tooltip: {
                      enabled: false, // Disable tooltips
                    },
                    legend: {
                      display: false, // Disable legend
                    },
                  },
                  animation: {
                    duration: 0, // No animation
                  },
                }}
              />
              <div className="donut-center">
                <p>
                  {calculatePercentage(
                    chartData.unusedCount,
                    chartData.totalTexnika
                  )}
                  %
                </p>
              </div>
            </div>
            <div className="chart-stats">
              <p>Всего техники: {chartData.totalTexnika}</p>
              <p>Не используется: {chartData.unusedCount}</p>
            </div>
          </div>


          {selectedExcelExport && (
        <ExcelExport
          show={true}
          onClose={closeModal}
          onSubmit={handleModalExcelExport}
        />
      )}

          {renderSuccessMessage()}
        </div>
      )}
    </div>
  );
};

export default TexnikaChart;
