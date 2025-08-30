import React, { useEffect, useState, useRef } from "react";
import "../../style/largemodal.css";
import "react-datepicker/dist/react-datepicker.css";
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

const SendModal = ({ show, onClose, data = {}, positionTable = {} }) => {
  const navigate = useNavigate();

  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [jsonData, setJsonData] = useState({
    department: "",
    order_name: "",
    employee_fio: "",
    employee_seria: "",
    employee_date: "",
    employee_viden: "",
    equipment_name: data.equipment_name || "",
    inventory_number: data.inventory_number || "",
    serial_number: data.serial_number || "",
    new_employee_fio: "",
    position: "",
    mac: data.mac,
  });

  const [pdfUrl, setPdfUrl] = useState("");
  const [pdffile, setPdffile] = useState("new_output.pdf");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPdfUpdated, setIsPdfUpdated] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const fileInputRef = useRef(null); // Reference to the hidden file input element

  // alert
  const [showSuccess, setShowSuccess] = useState(false); // State for success/error message
  const [text, setText] = useState(""); // Message content
  const [success, setSuccess] = useState(false); // To track if it's a success or error

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
    } catch (error) {
      console.error("Error fetching PDF URL:", error);
      // Optionally, you can display a generic error message for failed PDF fetch
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const inputData = {
      division: jsonData.employee_podrazdelenie, // Boshqaruv bo'limi
      department: jsonData.order_name, // Bo'lim nomi
      full_name: jsonData.employee_fio, // Xodimning F.I.Sh.
      passport_serial_number: jsonData.employee_seria, // Pasport seriya raqami
      passport_issue_date: jsonData.employee_date, // Pasportni berish sanasi
      issued_by: jsonData.employee_viden, // Pasportni bergan tashkilot
      equipment_name: jsonData.equipment_name, // Texnika nomi
      inventory_number: jsonData.inventory_number, // Inventarizatsiya raqami
      new_employee_fio: jsonData.new_employee_fio, // Yangi xodimning F.I.Sh.
      serial_number: jsonData.serial_number, // Seriya raqami
      position: jsonData.position, // Lavozimi
      invoiceNumber: "12", // Hisob-faktura raqami
    };

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACK_API}api/updatepdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

      const result = await response.text();

      if (response.ok) {
        setPdffile(`output.pdf`);
        setIsPdfUpdated(true);
        setIsFormValid(false);
        setIsFileUploaded(false);
      } else {
        alert("Error: " + result);
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An unexpected error occurred.");
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACK_API}api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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

      const result = await response.text();

      if (response.ok) {
        setPdffile("output.pdf");
        setIsPdfUpdated(false);
        setIsFileUploaded(true);
        setInputsDisabled(true); // Disable inputs after file upload
        fetchPdfUrl("output.pdf"); // Update PDF URL after file upload
      } else {
        alert("Error: " + result);
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      alert(error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);
    setIsFileUploaded(true);

    if (file) {
      handleUpload(file);
    }
  };

  // Trigger file input click on button click
  const triggerFileInput = () => {
    fileInputRef.current.click();
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

  // New clear function
  const handleClear = () => {
    setJsonData((prevState) => ({
      ...prevState,
      employee_podrazdelenie: "",
      order_name: "",
      employee_fio: "",
      employee_seria: "",
      employee_date: "",
      employee_viden: "",
      equipment_name: data?.equipment_name || "",
      inventory_number: data?.inventory_number || "",
      new_employee_fio: "",
      position: "",
    }));

    setUploadedFile(null);
    setIsFileUploaded(false);
    setIsPdfUpdated(false);
    setPdffile("new_output.pdf");
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
          <h2>Акт приёма-передачи</h2>
          <div className="largemodal-body">
            <div className="largemodal-left">
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="input-row">
                    <label>
                      Подразделение:
                      <input
                        type="text"
                        name="employee_podrazdelenie"
                        value={jsonData.employee_podrazdelenie || ""}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                    <label>
                      Отдел:
                      <input
                        type="text"
                        name="order_name"
                        value={jsonData.order_name}
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
                        name="employee_fio"
                        value={jsonData.employee_fio}
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
                        value={jsonData.new_employee_fio}
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
                        name="employee_seria"
                        value={jsonData.employee_seria || ""}
                        placeholder="__ _______"
                        onChange={(e) => {
                          let value = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, ""); // faqat harf va raqam

                          // 2 ta harf + 7 ta raqam
                          const letters = value
                            .slice(0, 2)
                            .replace(/[^A-Z]/g, "");
                          const digits = value
                            .slice(2)
                            .replace(/[^0-9]/g, "")
                            .slice(0, 7);

                          // Format: "AA 1234567"
                          const formatted =
                            letters +
                            (letters.length === 2 ? " " : "") +
                            digits;

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
                  </div>
                  <div className="input-row">
                    <label>
                      Дата видача паспорт:
                      <input
                        type="date"
                        name="employee_date"
                        value={jsonData.employee_date}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                    <label>
                      Кем видан:
                      <input
                        type="text"
                        name="employee_viden"
                        value={jsonData.employee_viden}
                        onChange={(e) => handleInputChange(e, setJsonData)}
                        className="largemodal-input"
                        disabled={inputsDisabled}
                      />
                    </label>
                  </div>
                </div>

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
                    отправлять
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
          {renderSuccessMessage()} {/* Rendering the success/error message */}
        </div>
      </div>
    )
  );
};

export default SendModal;
