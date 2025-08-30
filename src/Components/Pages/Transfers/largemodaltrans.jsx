import React, { useEffect, useState, useRef } from "react";
import "../../style/largemodal.css";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import Referense from "../Referense";

const handleInputChange = (e, setJsonData) => {
  const { name, value } = e.target;

  setJsonData((prev) => {
    const newJsonData = { ...prev, [name]: value };

    if (name === "employee_fio") {
      const formattedFio = value
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      newJsonData.employee_fio = formattedFio;

      const fioParts = formattedFio.split(" ");
      if (fioParts.length >= 2) {
        const shortFio =
          fioParts.length === 3 || fioParts.length === 4
            ? `${fioParts[0]}.${fioParts[1][0]}.${fioParts[2][0]}`
            : `${fioParts[0]}.${fioParts[1][0]}`;
        newJsonData.new_employee_fio = shortFio;
      } else {
        newJsonData.new_employee_fio = "";
      }
    }

    return newJsonData;
  });
};

const SendModal = ({ show, onClose, data = {} , positionTable = {}  }) => {
  const [inputsDisabled, setInputsDisabled] = useState(true);
  const [jsonData, setJsonData] = useState({
    data: data.data,
    passport_issue_date: data.passport_issue_date,
    id: data.id,
    department: data.department,
    division: data.division,
    position: data.position,
    serial_number: data.serial_number,
    issued_by: data.issued_by,
    equipment_name: data.equipment_name || "",
    inventory_number: data.inventory_number || "",
    document_file: data.document_file || "",
    mac: data.mac || "",
    passport_serial_number: data.passport_serial_number || "",
    shortname: data.shortname || "",
    employee: data.employee || "",
    full_name: data.full_name || "",
  });

  const [pdfUrl, setPdfUrl] = useState("");
  const [pdffile, setPdffile] = useState("new_output.pdf");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPdfUpdated, setIsPdfUpdated] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const BACK_API = process.env.REACT_APP_BACK_API;

  const navigate = useNavigate();

  // Message Modal
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPdfUrl(pdffile); 
  }, [pdffile]);

  useEffect(() => {
    const requiredFields = [
      jsonData.division,
      jsonData.department,
      jsonData.full_name,
      jsonData.passport_serial_number,
      jsonData.shortname,
      jsonData.position,
      jsonData.passport_issue_date,
      jsonData.issued_by,
      jsonData.equipment_name,
      jsonData.inventory_number,
      jsonData.data,
    ];

    const isValid = requiredFields.every((value) => value);
    setIsFormValid(isValid);
    setIsPdfUpdated(false);
    setIsFileUploaded(false);
    if (isValid) setPdffile("new_output.pdf");
  }, [jsonData]);

  const fetchPdfUrl = async (filename) => {
    try {
      const token = localStorage.getItem("token"); // Tokenni olish
      const timestamp = new Date().getTime();

      const response = await fetch(
        `${BACK_API}api/sendpdf?timestamp=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Authorization Header
          },
          body: JSON.stringify({
            fileName: filename,
            date: jsonData.employee_date,
          }),
        }
      );

      if (response.status === 403) {
        // Tokenni tekshirish
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false); // Error message ni yashirish uchun
          navigate("/"); // Login sahifasiga yo'naltirish
        }, 3000);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch PDF URL");

      const data = await response.json();      
      
      setPdfUrl(`${data.pdfUrl}?timestamp=${timestamp}`);      
    } catch (error) {
      console.error("Error fetching PDF URL:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputData = {
      ...jsonData,
      invoiceNumber: "67890",
    };

    try {
      const token = localStorage.getItem("token"); // Get token from localStorage

      const response = await fetch(`${BACK_API}api/updatePdftransfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add token to Authorization header
        },
        body: JSON.stringify(inputData),
      });

      // Check for token expiration (403 status)
      if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false); // Hide the error message after 3 seconds
          navigate("/"); // Redirect to login page
        }, 3000);
        return; // Stop further execution if token is expired
      }

      if (response.ok) {
        setPdffile("output.pdf");
        setIsPdfUpdated(true);
        setIsFormValid(false);
      } else {
        alert("Error: " + (await response.text()));
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An unexpected error occurred.");
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token"); // Get token from localStorage

      const response = await fetch(`${BACK_API}api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the Authorization header
        },
        body: formData,
      });

      // Check for token expiration (403 status)
      if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false); // Hide the error message after 3 seconds
          navigate("/"); // Redirect to login page
        }, 3000);
        return; // Stop further execution if token is expired
      }

      if (response.ok) {
        setPdffile("output.pdf");
        setIsFileUploaded(true);
        setInputsDisabled(true);
        fetchPdfUrl("output.pdf"); // Call to fetch the PDF URL after upload
      } else {
        alert("Error: " + (await response.text()));
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      alert(error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleClear = () => {
    setIsFileUploaded(false);
    setIsPdfUpdated(false);
    setPdffile("new_output.pdf");
    setIsFormValid(true)
     
  };

  // Function to trigger file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Function to handle completion and save data to backend
  const handleComplete = async () => {
    const inputData = {
      data: jsonData.data, // 'data' ma'lumoti
      passport_issue_date: jsonData.passport_issue_date, // 'data_vydachi' - passport_issue_date bilan almashtirildi
      id: data.id, // 'id' - acception jadvalidan olingan id
      position: jsonData.position, // 'должность'
      issued_by: jsonData.issued_by, // 'кем_выдан' - employee_viden o'rniga issued_by
      equipment_name: jsonData.equipment_name, // 'наименование_техники' - naimenovaniya_tex o'rniga equipment_name
      department: jsonData.department, // 'отдел' - order_name o'rniga department
      division: jsonData.division, // 'подразделение' - employee_podrazdelenie o'rniga division
      employee: localStorage.getItem("username"), // 'сотрудник'
      documnet_file: "output.pdf", // 'файл_pdf'
      full_name: jsonData.full_name, // 'фио' - employee_fio o'rniga full_name
      mac: jsonData.mac,
      transfers: data, // 'transfers' from data
    };

    try {
      const token = localStorage.getItem("token"); // Get token from localStorage

      const response = await fetch(`${BACK_API}api/sendtransfered`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
        body: JSON.stringify(inputData),
      });

      // Check for token expiration (403 status)
      if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false); // Hide the error message after 3 seconds
          navigate("/"); // Redirect to login page
        }, 3000);
        return; // Stop further execution if token is expired
      }

      if (response.ok) {
        const result = await response.json();
        setText("Техника успешно возвращена");
        setSuccess(true);
        setShowSuccess(true); // Show success message

        setTimeout(() => {
          setShowSuccess(false); // Hide the success message after 3 seconds
          onClose(); // Close the modal after success
          window.location.reload();
        }, 3000);
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.message || "Не удалось сохранить данные."}`);
      }
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      alert("Произошла непредвиденная ошибка при отправке данных.");
    }
  };

  const renderSuccessMessage = () => {
    if (showSuccess) {
      return <Referense title={text} background={success} />;
    }
  };

  return (
    show && (
      <div className="largemodal-overlay">
        <div className="largemodal-content">
          <h2>Transfers</h2>
          <div className="largemodal-body">
            <div className="largemodal-left">
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="input-row">
                    <label>
                      Подразделение:
                      <input
                        type="text"
                        name="division"
                        value={jsonData.division}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                    <label>
                      Отдел:
                      <input
                        type="text"
                        name="department"
                        value={jsonData.department}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                  </div>

                  <div className="input-row">
                    <label>
                      ФИО сотрудника:
                      <input
                        type="text"
                        name="full_name"
                        value={jsonData.full_name}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>

                    <label>
                      Сокращенно ФИО:
                      <input
                        type="text"
                        name="new_employee_fio"
                        value={jsonData.shortname}
                        readOnly
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                  </div>

                  <div className="input-row">
                    <label>
                      Должность:
                      <select
                        name="position"
                        value={jsonData.position}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      >
                        <option value="">Выберите должность</option>
                        {positionTable.map((item) => (
                          <option key={item.id} value={item.positionname}>
                            {item.positionname}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="input-row">
                    <label>
                      Серия и номер паспорта:
                      <input
                        type="text"
                        name="passport_serial_number"
                        value={jsonData.passport_serial_number}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                  </div>

                  <div className="input-row">
                    <label>
                      Дата видача паспорт:
                      <input
                        type="date"
                        name="passport_issue_date"
                        value={
                          jsonData.passport_issue_date
                            ? jsonData.passport_issue_date
                                .split("-")
                                .reverse()
                                .join("-")
                            : ""
                        }
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                    <label>
                      Кем видан:
                      <input
                        type="text"
                        name="issued_by"
                        value={jsonData.issued_by}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <div className="input-row">
                    <label>
                      Наименования тех:
                      <input
                        type="text"
                        name="equipment_name"
                        value={jsonData.equipment_name}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                    <label>
                      Инв. тех:
                      <input
                        type="text"
                        name="inventory_number"
                        value={jsonData.inventory_number}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                    <label>
                      Серийный номер:
                      <input
                        type="text"
                        name="serial_number"
                        value={jsonData.serial_number}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                  </div>
                </div>

                <div className="button-group">
                  <button
                    type="submit"
                    className="largemodal-submit-btn"
                    disabled={!isFormValid}
                  >
                    Проверять
                  </button>
                  <button
                    type="button"
                    className="largemodal-submit-btn"
                    onClick={triggerFileInput}
                    disabled={!isPdfUpdated}
                  >
                    Загрузить
                  </button>
                  <button
                    type="button"
                    className="largemodal-submit-btn"
                    onClick={handleComplete}
                    disabled={!isFileUploaded}
                  >
                    возвращать
                  </button>
                  <button
                    type="button"
                    className="largemodal-submit-btn"
                    onClick={handleClear} // Clear button action
                  >
                    очистить
                  </button>
                  <button
                    type="button"
                    className="largemodal-submit-btn"
                    onClick={onClose}
                  >
                    закрыть
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              </form>
            </div>
            <div className="largemodal-right">
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="100%"
                  title="PDF Document"
                />
              )}
            </div>
          </div>
        </div>
        {renderSuccessMessage()}
      </div>
    )
  );
};

export default SendModal;
