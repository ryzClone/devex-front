import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
} from "react-icons/fa";
import "../../style/Users.css"; // Your CSS file
import { UserContext } from "../Users/userContex";
import SendModal from "./largemodaltrans";
import History from "../History/History";
import Referense from "../Referense";

export default function Transfers() {
  const navigate = useNavigate();
  const { search } = useContext(UserContext);

  // Pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [positionTable , setPositionTable] = useState([]);

  // State for modals and selected user data
  const [sendUsers, setSendUsers] = useState('');
  const [isSendModal, setisSendModal] = useState(false);

  // Message Modal
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  // Search and sorting
  const [globSearch, setGlobSearch] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null); // For tracking which menu is open

  // history
  const [isHistoryModal, setIsHistoryModal] = useState(false); // New state for history modal
  const [selectedUser, setSelectedUser] = useState("");

  const BACK_API = process.env.REACT_APP_BACK_API;

  useEffect(() => {
    readTransfers();
    setGlobSearch(search || "");
  }, [page, size, search, globSearch]);

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

  const readTransfers = async () => {
    const params = new URLSearchParams({
      page: page,
      size: size,
      search: globSearch,
    });
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(
        `${BACK_API}api/readtransfers?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 403) {
        // Token has expired, redirect user to login page
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
        const result = await response.json();
        setUsers(result.data);
        setTotal(result.total);
        setPositionTable(result.positionTable)                
      } else {
        setSuccess(false);
        setText("An error occurred while fetching data");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setSuccess(false);
      setText(error.message || "An error occurred while fetching data");
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
  const transfersTable = () => {
    return users.map((user, index) => (
      <tr key={user.id}>
        <td>{index + 1 + (page - 1) * size}</td>
        <td>{user.employee}</td>
        <td>{user.full_name}</td>
        <td>{user.equipment_name}</td>
        <td>{user.inventory_number}</td>
        <td>{user.serial_number}</td>
        <td>{user.data}</td>
        <td className="edit-btns">
          <div className="settings_menu-container">
            <button
              onClick={() => toggleMenu(user.id)}
              className="settings_menu-btn"
              style={{ display: isHistoryModal || isSendModal ? 'none' : 'block' }}
            >
              <FaEllipsisV className="settings_menu-icon" />
            </button>
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
                  возвратить
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
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          >
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
          </select>

          <div className="pagination-total">общий: {total}</div>
        </div>
      </div>

      {isSendModal && (
        <SendModal
          show={isSendModal}
          onClose={() => setisSendModal(false)}
          data={sendUsers}  // Pass the selected user's data here
          positionTable = {positionTable}
        />
      )}

      {/* Move this modal here or to wherever it should appear */}
      {isHistoryModal && (
        <History closeModal={() => setIsHistoryModal(false)} user={selectedUser} />
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>Ид</th>
            <th>Сотрудник</th>
            <th>ФИО</th>
            <th>Наименование техники</th>
            <th>Инвентарный номер техники</th>
            <th>Серийный номер</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{transfersTable()}</tbody>
      </table>
      {renderSuccessMessage()}
    </div>
  );
}
