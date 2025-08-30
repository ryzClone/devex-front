import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "../../style/largemodal.css";
import Referense from "../Referense";
import { useNavigate } from "react-router-dom";

const handleInputChange = (e, setJsonData) => {
  const { name, value } = e.target;

  setJsonData((prev) => {
    const newJsonData = { ...prev, [name]: value };

    // Agar 'ФИО сотрудника' o'zgarayotgan bo'lsa, 'Сокращенно ФИО' ni yangilash
    if (name === "employee_fio") {
      const formattedFio = value
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      newJsonData.employee_fio = formattedFio;

      const fioParts = formattedFio.split(" ");
      if (fioParts.length === 3 || fioParts.length === 4) {
        const shortFio = `${fioParts[0]}.${fioParts[1][0]}.${fioParts[2][0]}`;
        newJsonData.new_employee_fio = shortFio;
      } else if (fioParts.length === 2) {
        const shortFio = `${fioParts[0]}.${fioParts[1][0]}`;
        newJsonData.new_employee_fio = shortFio;
      } else {
        newJsonData.new_employee_fio = "";
      }
    }

    return newJsonData;
  });
};

const MultiSendModal = ({
  show,
  onClose,
  data={},
  equipmentList = [],
  positionTable = [],
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdffile, setPdffile] = useState("new_output.pdf");
  const [isPdfUpdated, setIsPdfUpdated] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [text, setText] = useState("");
  const [success, setSuccess] = useState(false);

  const [jsonData, setJsonData] = useState({
    employee_fio: "",
    new_employee_fio: "",
    position: "",
    order_name: "",
    employee_podrazdelenie: "",
    employee_seria: "",
    employee_date: "",
    employee_viden: "",
  });

  const BACK_API = process.env.REACT_APP_BACK_API;

  useEffect(() => {
    fetchPdfUrl(pdffile); // Fetch PDF URL
    if (isFormValid === true) {
      setPdffile("new_output.pdf");
    }
  }, [pdffile, isPdfUpdated]);

  useEffect(() => {
    const isValid =
      jsonData.employee_podrazdelenie &&
      jsonData.order_name &&
      jsonData.employee_fio &&
      jsonData.employee_seria &&
      jsonData.employee_date &&
      jsonData.employee_viden &&
      jsonData.equipment_name &&
      jsonData.inventory_number &&
      jsonData.new_employee_fio &&
      jsonData.position &&
      jsonData.serial_number;
    setIsFormValid(isValid);
    setIsPdfUpdated(false);
    setIsFileUploaded(false);
  }, [jsonData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setJsonData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "employee_fio") {
        const formattedFio = value
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

        newData.employee_fio = formattedFio;

        const parts = formattedFio.split(" ");
        if (parts.length >= 3) {
          newData.new_employee_fio = `${parts[0]}.${parts[1][0]}.${parts[2][0]}`;
        } else if (parts.length === 2) {
          newData.new_employee_fio = `${parts[0]}.${parts[1][0]}`;
        } else {
          newData.new_employee_fio = "";
        }
      }

      return newData;
    });
  };

  const fetchPdfUrl = async (filename) => {
    try {
      const timestamp = new Date().getTime(); // Adding a timestamp parameter
      const token = localStorage.getItem("token");

      // Make the fetch request with token and file name
      const response = await fetch(
        `${BACK_API}api/sendpdf?timestamp=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fileName: filename }),
        }
      );

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

      // Check if the response is OK
      if (!response.ok) throw new Error("Failed to fetch PDF URL");

      // Process the response data to extract the PDF URL
      const data = await response.json();
      setPdfUrl(`${data.pdfUrl}?timestamp=${timestamp}`); // Setting PDF URL with timestamp
      console.log(data.pdfUrl);
    } catch (error) {
      console.error("Error fetching PDF URL:", error);
      // Optionally, you can display a generic error message for failed PDF fetch
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const inputData = {
      ...jsonData,
      shortname: jsonData.new_employee_fio,
      equipment: selectedEquipment.map((eq) => ({
        equipment_name: eq.label,
        inventory_number: eq.value.inventory_number,
        serial_number: eq.value.serial_number,
        mac: eq.value.mac,
      })),
      invoiceNumber: "12",
    };

    try {
      const response = await fetch(`${BACK_API}api/updatepdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
      });

      if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
        return;
      }

      if (response.ok) {
        setPdffile("output.pdf");
        setIsPdfUpdated(true);
        fetchPdfUrl("output.pdf");
      } else {
        alert("Ошибка при обновлении PDF");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleFileUpload = async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACK_API}api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 403) {
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (response.ok) {
        setIsFileUploaded(true);
        setInputsDisabled(true);
        fetchPdfUrl("output.pdf");
      } else {
        alert("Ошибка при загрузке PDF");
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleComplete = async () => {
    const inputData = {
      employee: localStorage.getItem("username"),
      full_name: jsonData.employee_fio,
      division: jsonData.employee_podrazdelenie,
      department: jsonData.order_name,
      position: jsonData.position,
      passport_serial_number: jsonData.employee_seria,
      passport_issue_date: jsonData.employee_date,
      issued_by: jsonData.employee_viden,
      serial_number: jsonData.serial_number,
      equipment_name: jsonData.equipment_name,
      inventory_number: jsonData.inventory_number,
      shortname: jsonData.new_employee_fio,
      document_file: "output.pdf",
      acception: data,
      mac: jsonData.mac,
    };

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACK_API}api/addTransfered`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        return;
      }

      if (response.ok) {
        // Success message reflecting the equipment assignment process
        setText(`Оборудование успешно передано сотруднику`);
        setSuccess(true);
        setShowSuccess(true);

        // Trigger onClose after success message is displayed
        setTimeout(() => {
          setShowSuccess(false); // Hide the success message after 3 seconds
          onClose(); // Call onClose to close the modal
        }, 3000);
      } else {
        const error = await response.json();

        // Error message reflecting the issue in the equipment transfer process
        setText(`Ошибка: ${error.message}. Не удалось передать оборудование.`);
        setSuccess(false);
        setShowSuccess(true);

        // Trigger onClose after error message is displayed
        setTimeout(() => {
          setShowSuccess(false); // Hide the error message after 3 seconds
          onClose(); // Call onClose to close the modal
        }, 3000);
      }
    } catch (error) {
      // Unexpected error message reflecting the failure in the equipment assignment process
      setText("Произошла непредвиденная ошибка при передаче оборудования.");
      setSuccess(false);
      setShowSuccess(true);

      // Trigger onClose after unexpected error message is displayed
      setTimeout(() => {
        setShowSuccess(false); // Hide the error message after 3 seconds
        onClose(); // Call onClose to close the modal
      }, 3000);
    }
  };

  const handleClear = () => {
    setJsonData({
      employee_fio: "",
      new_employee_fio: "",
      position: "",
      order_name: "",
      employee_podrazdelenie: "",
      employee_seria: "",
      employee_date: "",
      employee_viden: "",
    });
    setSelectedEquipment([]);
    setIsFileUploaded(false);
    setIsPdfUpdated(false);
    setInputsDisabled(false);
    setPdffile("new_output.pdf");

    // setUploadedFile(null);
  };

  // Trigger file input click on button click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const options = equipmentList.map((item) => ({
    label: item.equipment_name,
    value: item,
  }));

  const renderSuccessMessage = () =>
    showSuccess && <Referense title={text} background={success} />;

  return (
    show && (
      <div className="largemodal-overlay">
        <div className="largemodal-content">
          <h2>Множественная передача оборудования</h2>
          <div className="largemodal-body">
            <div className="largemodal-left" >
              <div className="input-row">
                <label>
                  ФИО сотрудника:
                  <input
                    type="text"
                    name="employee_fio"
                    value={jsonData.employee_fio}
                    onChange={handleInputChange}
                    className="largemodal-input"
                  />
                </label>
                <label>
                  Сокращенно:
                  <input
                    type="text"
                    value={jsonData.new_employee_fio}
                    readOnly
                    className="largemodal-input"
                  />
                </label>
              </div>
              <div className="input-row">
                <label>
                  Подразделение:
                  <input
                    type="text"
                    name="employee_podrazdelenie"
                    value={jsonData.employee_podrazdelenie}
                    onChange={handleInputChange}
                    className="largemodal-input"
                  />
                </label>
                <label>
                  Отдел:
                  <input
                    type="text"
                    name="order_name"
                    value={jsonData.order_name}
                    onChange={handleInputChange}
                    className="largemodal-input"
                  />
                </label>
              </div>
              <div className="input-row">
                <label>
                  Должность:
                  <select
                    name="position"
                    value={jsonData.position}
                    onChange={handleInputChange}
                    className="largemodal-input"
                  >
                    <option value="">Выберите</option>
                    {positionTable.map((item) => (
                      <option key={item.id} value={item.positionname}>
                        {item.positionname}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="input-row">
                <label>
                  Паспорт:
                  <input
                    type="text"
                    name="employee_seria"
                    value={jsonData.employee_seria || ""}
                    placeholder="__ _______"
                    onChange={(e) => {
                      let value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, ""); // faqat harf va raqam

                      // 2 ta harf + 7 ta raqam
                      const letters = value.slice(0, 2).replace(/[^A-Z]/g, "");
                      const digits = value
                        .slice(2)
                        .replace(/[^0-9]/g, "")
                        .slice(0, 7);

                      // Format: "AA 1234567"
                      const formatted =
                        letters + (letters.length === 2 ? " " : "") + digits;

                      setJsonData((prev) => ({
                        ...prev,
                        employee_seria: formatted,
                      }));
                    }}
                    className="largemodal-input"
                    disabled={inputsDisabled}
                    maxLength={10} // 2 harf + 1 probel + 7 raqam
                  />
                </label>

                <label>
                  Дата выдачи:
                  <input
                    type="date"
                    name="employee_date"
                    value={jsonData.employee_date}
                    onChange={handleInputChange}
                    className="largemodal-input"
                  />
                </label>
              </div>
              <div className="input-row">
                <label>
                  Кем выдан:
                  <input
                    type="text"
                    name="employee_viden"
                    value={jsonData.employee_viden}
                    onChange={handleInputChange}
                    className="largemodal-input"
                  />
                </label>
              </div>

              <label>
                Оборудование:
                <Select
                  isMulti
                  options={options}
                  onChange={setSelectedEquipment}
                  value={selectedEquipment}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Выберите оборудование..."
                />
              </label>

              {selectedEquipment.map((eq, index) => (
                <div key={eq.value} className="input-row">
                  <label>
                    Наименование тех.:
                    <input
                      type="text"
                      value={eq.equipment_name}
                      className="largemodal-input"
                      disabled
                    />
                  </label>
                  <label>
                    Инв. тех.:
                    <input
                      type="text"
                      value={eq.inventory_number}
                      className="largemodal-input"
                      disabled
                    />
                  </label>
                  <label>
                    Серийный номер:
                    <input
                      type="text"
                      value={eq.serial_number}
                      className="largemodal-input"
                      disabled
                    />
                  </label>
                </div>
              ))}

              <div className="button-group">
                <button
                  className="largemodal-submit-btn"
                  onClick={handleSubmit}
                >
                  Генерация PDF
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
                  className="largemodal-submit-btn"
                  onClick={handleComplete}
                  disabled={!isFileUploaded}
                >
                  Отправить
                </button>
                <button className="largemodal-submit-btn" onClick={handleClear}>
                  Очистить
                </button>
                <button className="largemodal-submit-btn" onClick={onClose}>
                  Закрыть
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </div>
            </div>
            <div className="largemodal-right">
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          </div>
          {renderSuccessMessage()}
        </div>
      </div>
    )
  );
};

export default MultiSendModal;
