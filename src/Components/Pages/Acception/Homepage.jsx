import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
} from "react-icons/fa";
import "../../style/Users.css"; // Your CSS file
import { UserContext } from "../Users/userContex";
import SendModal from "./largemodalsend";
import History from "../History/History"; // Import the History component
import Referense from "../Referense";
import MultiSendModal from "./MultiSendModal";

export default function Accepted() {
  const navigate = useNavigate();
  const { search } = useContext(UserContext);

  // Pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(100);
  const [users, setUsers] = useState([]);
  const [positionTable , setPositionTable] = useState([]);
 
  // State for modals and selected user data
  const [sendUsers, setSendUsers] = useState("");
  const [sendMultiUsers, setSendMultiUsers] = useState("");
  const [isSendModal, setisSendModal] = useState(false);
  const [isSendMultiModal, setisSendmultiModal] = useState(false);
  const [isHistoryModal, setIsHistoryModal] = useState(false); // New state for history modal
  const [selectedUser, setSelectedUser] = useState("");

  // Search and sorting
  const [globSearch, setGlobSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null); // For tracking which menu is open

  // New state to manage the selected option
  const [selectedOption, setSelectedOption] = useState(null);

    // alert
    const [showSuccess, setShowSuccess] = useState(false); // State for success/error message
    const [text, setText] = useState(""); // Message content
    const [success, setSuccess] = useState(false); // To track if it's a success or error

    const BACK_API = process.env.REACT_APP_BACK_API;

  useEffect(() => {
    readAcception();
    setGlobSearch(search || "");
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }
  }, [page, size, search, globSearch, navigate]);

  const pagePrev = () => {
    if (page >= 2) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const pageNext = () => {
    if (page < Math.ceil(total / size)) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Read Acception data
  const readAcception = async () => {
    const params = new URLSearchParams({
      page: page,
      size: size,
      search: globSearch,
    });
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(
        `${BACK_API}api/readacception?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 403) {
        // Token muddati tugagan bo'lsa, foydalanuvchini login sahifasiga yo'naltirish
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);

              // Trigger onClose after unexpected error message is displayed
        setTimeout(() => {
          setShowSuccess(false); // Hide the error message after 3 seconds
          navigate('/')
        }, 3000);
        return;
      }
  
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data);
        setTotal(result.total);
        setPositionTable(result.positionTable)
        
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  

  // Toggle dropdown menu for a specific user
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id); // Toggle dropdown for the selected user
  };

  // Open history modal and set the selected user
  const openHistoryModal = (user) => {
    setSelectedUser(user); // Set the selected user data
    setIsHistoryModal(true); // Show history modal
    setOpenMenuId(null); // Close dropdown
  };

  // Render table rows for users
  const acceptionTable = () => {
    return users.map((user, index) => (
      <tr key={user.id}>
        <td>{index + 1 + (page - 1) * size}</td>
        <td>{user.department}</td>
        <td>{user.equipment_name}</td>
        <td>{user.inventory_number}</td>
        <td>{user.serial_number}</td>
        <td>{user.mac}</td>
        <td>{user.data}</td>
        <td className="edit-btns">
          <div className="settings_menu-container">
            {!isHistoryModal && (
              <button
                onClick={() => toggleMenu(user.id)} // Toggle the menu for this row
                className="settings_menu-btn"
              >
                <FaEllipsisV className="settings_menu-icon" />
              </button>
            )}
            {openMenuId === user.id && !isHistoryModal && (
              <div className="settings_dropdown-menu">
                <button
                  className="settings_dropdown-item"
                  onClick={() => {
                    setSendUsers(user); // Set the current user for sending
                    setisSendModal(true); // Open the SendModal
                    toggleMenu(user.id); // Close the dropdown
                  }}
                >
                  отправить
                </button>
                <button
                  className="settings_dropdown-item"
                  onClick={() => openHistoryModal(user)} // Pass user data to openHistoryModal
                >
                  история
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  const handleCloseSendModal = () => {
    setisSendModal(false); // Close the SendModal
    setisSendmultiModal(false)
    window.location.reload();  // Re-fetch the data after modal is closed
  };

  const handleCreateMultiModal = () =>{
    setSendMultiUsers(users);
     setisSendmultiModal(true);
  }

  const renderSuccessMessage = () => {
    if (showSuccess) {
      return <Referense title={text} background={success} />;
    }
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <div className="pagination">
          <button className="pagination-button" onClick={pagePrev}>
            <FaChevronLeft />
          </button>
          <div className="pagination-page">{page}</div>
          <button className="pagination-button" onClick={pageNext}>
            <FaChevronRight />
          </button>

          <select
            className="pagination-select"
            value={selectedOption || size}
            onChange={(e) => setSelectedOption(e.target.value)} // Update selectedOption when changed
          >
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
          </select>

          <div className="pagination-total">общий: {total}</div>
        </div>
        <div>
          <button className="pagination-button" onClick={handleCreateMultiModal}>Create</button>
        </div>
      </div>

      {isSendModal && (
        <SendModal
          show={isSendModal}
          onClose={handleCloseSendModal} 
          data={sendUsers}
          positionTable = {positionTable}
        />
      )}
      {isSendMultiModal && (
        <MultiSendModal
          show={isSendMultiModal}
          onClose={handleCloseSendModal} 
          data={sendMultiUsers}
          positionTable = {positionTable}
        />
      )}


      {isHistoryModal && (
        <History closeModal={() => setIsHistoryModal(false)} user={selectedUser} />
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>Ид</th>
            <th>Подразделение</th>
            <th>Наименование техники</th>
            <th>Инвентарный номер</th>
            <th>Серийный номер</th>
            <th>МАК Адресс</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{acceptionTable()}</tbody>
      </table>
      {renderSuccessMessage()} {/* Rendering the success/error message */}
    </div>
  );
}
