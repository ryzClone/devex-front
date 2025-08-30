import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFilter,
  FaUserPlus,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
} from "react-icons/fa";
import "../../style/Users.css"; // CSS faylingiz
import Addusermodal from "./Addusermodal";
import Referense from "../Referense";
import { UserContext } from "./userContex";
import UpdateUserModal from "./updateusermodal";
import UserHistory from "../History/UserHistory";
import UserDetailModal from "./Detail User/UserDetailModal";

const BACK_API = process.env.REACT_APP_BACK_API;

export default function Users() {
  const navigate = useNavigate();
  const { search } = useContext(UserContext);
  // pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(100);
  const [users, setUsers] = useState([]);

  // addusermodal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModal, setIsUpdateModal] = useState(false);

  // messageModal
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  // Search and sort
  const [globSearch, setGlobSearch] = useState("");
  const [sortStatus, setSortStatus] = useState("");
  const [filterDelete, setFilterDelete] = useState(true);

  // update user
  const [selectedUser, setSelectedUser] = useState("");

  // Dropdown Menu Active State
  const [activeOptions, setActiveOptions] = useState(null);
  const [activeFilter, setActiveFilter] = useState(false);
  const menuRef = useRef(null);
  const filterRef = useRef(null);

  // History
  const [showHistory, setShowHistory] = useState(false); // History

    // detail texnika
  const [selectedViewItem, setSelectedViewItem] = useState(null);

  // useEffects
  useEffect(() => {
    readUser();
    setGlobSearch(search || "");
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveOptions(false); // tashqariga bosilsa menyuni yopish
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveFilter(false); // tashqariga bosilsa yopiladi
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [page, size, filterDelete, sortStatus, search, globSearch]);

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

  // add Fetch
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      username: formData.get("username"),
      password: formData.get("password"),
      role: formData.get("role"),
      status: formData.get("status"),
      users_id: localStorage.getItem("user_id"), // local foydalanuvchining IDsi bo'lishi kerak
    };
    
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACK_API}api/adduser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
        body: JSON.stringify(data),
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
        setSuccess(true);
        setText(result.message || "User added successfully!");
      } else {
        const errorResult = await response.json();
        setSuccess(false);
        setText(errorResult.message || "Failed to add user");
      }
    } catch (error) {
      setSuccess(false);
      setText(error.message || "An error occurred while adding user");
    } finally {
      setShowSuccess(true);
      setIsModalOpen(false);
      setTimeout(() => {
        setShowSuccess(false);
        // window.location.reload();
      }, 3000);
    }
  };

  // update Fetch
  const handleUpdateModal = async (formData) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACK_API}api/updateuser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
        setSuccess(true);
        setText(result.message || "Пользователь обновлен успешно!");
      } else {
        const errorResult = await response.json();
        setSuccess(false);
        setText(errorResult.message || "Не удалось обновить пользователя.");
      }
    } catch (error) {
      setSuccess(false);
      setText(error.message || "Произошла ошибка при обновлении пользователя.");
    } finally {
      setShowSuccess(true);
      setIsUpdateModal(false);
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
      }, 3000);
    }
  };

  // render message
  const renderSuccessMessage = () => {
    if (showSuccess) {
      return <Referense title={text} background={success} />;
    }
  };

  // read Users
  const readUser = async () => {
    const data = {
      page: page,
      size: size,
      search: globSearch,
      status: sortStatus,
      state: filterDelete,
    };

    try {
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams(data).toString();

      const response = await fetch(`${BACK_API}api/readuser?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        setUsers(result.data);
        console.log(result.data);
        
        setTotal(result.total);
      } else {
        const errorResult = await response.json();
        setSuccess(false);
        setText(errorResult.message || "Не удалось обновить пользователей.");
      }
    } catch (error) {
      setSuccess(false);
      setText(
        error.message || "Произошла ошибка при обновлении пользователей."
      );
    } finally {
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  // Update users
  const handleUpdate = (user) => {
    setIsUpdateModal(true);
    setSelectedUser(user);
  };

  // Delate users
  const handleDelete = async (userId) => {
    const isConfirmed = window.confirm("Вы уверены, что хотите удалить?");

    if (isConfirmed) {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${BACK_API}api/deleteuser`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: userId,
            user_id: localStorage.getItem("user_id"),
          }),
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
          return; // Exit the function if token is expired
        }

        if (response.ok) {
          const result = await response.json();
          setSuccess(true);
          setText(result.message || "Пользователь успешно удален!");
        } else {
          const errorResult = await response.json();
          setSuccess(false);
          setText(errorResult.message || "Не удалось удалить пользователя");
        }
      } catch (error) {
        setSuccess(false);
        setText(error.message || "Произошла ошибка при удалении пользователя");
      } finally {
        setShowSuccess(true);
        setIsModalOpen(false);
        setTimeout(() => {
          setShowSuccess(false);
          window.location.reload();
        }, 3000);
      }
    }
  };

  // History users
  const handleHistory = (user) => {
    setSelectedUser(user);
    setShowHistory(true);
  };

  const handleCloseModal = () => {
    setShowHistory(false);
    setSelectedUser(null);
  };
  // Edit active
  const handleToggleChange = async (userId) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: user.status === "active" ? "inactive" : "active",
          }
        : user
    );

    const updatedUser = updatedUsers.find((user) => user.id === userId);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACK_API}api/editstatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: userId,
          status: updatedUser.status,
          users_id: localStorage.getItem("user_id"),
        }), // id ni ham jo'natamiz
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
        return; // Exit the function if token is expired
      }

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      // Muvaffaqiyatli bo'lsa, foydalanuvchilar ro'yxatini yangilash
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error updating user status:", error);

      // API so'rov muvaffaqiyatsiz bo'lsa, statusni qaytarib qo'yish
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: user.status === "active" ? "inactive" : "active",
              }
            : user
        )
      );
    }
  };

  // user table
  const usersTable = () => {
    if (!users.length) {
      return (
        <tr>
          <td colSpan="8" className="no-users">
            Пользователи не найдены
          </td>
        </tr>
      );
    }

    return users.map((user, index) => {      
      
      const formattedDate = user.created_at
        ? new Date(user.created_at).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";

      return (
        <tr
          key={user.id}
          className={user.status === "inactive" ? "inactive-user" : ""}
          onDoubleClick={() => setSelectedViewItem(user)}
        >
          <td>{index + 1 + (page - 1) * size}</td>
          <td>{user.username}</td>
          <td>******</td>
          <td>{user.role}</td>

          <td>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id={`toggle-${user.id}`}
                checked={user.status === "active"}
                onChange={() => {
                  if (user.state) handleToggleChange(user.id);
                }}
                className="toggle-checkbox"
                disabled={user.state === "false"}
              />
              <label htmlFor={`toggle-${user.id}`} className="toggle-label">
                <span className="slider"></span>
              </label>
            </div>
          </td>

          <td>{formattedDate}</td>

          <td className="edit-btns">
            <div
              className="menu-options"
              ref={activeOptions === user.id ? menuRef : null}
            >
              {user.state === "true" && (
                <>
                  <button
                    className="menu-icon"
                    onClick={() => toggleMenu(user.id)}
                  >
                    <FaEllipsisV />
                  </button>

                  {activeOptions === user.id && (
                    <div className="dropdown-menu">
                      <button
                        onClick={() => {
                          handleUpdate(user);
                          setActiveOptions(null);
                        }}
                      >
                        Редактировать
                      </button>

                      <button
                        onClick={() => {
                          handleDelete(user.id);
                          setActiveOptions(null);
                        }}
                      >
                        Удалить
                      </button>

                      <button
                        onClick={() => {
                          handleHistory(user);
                          setActiveOptions(null);
                        }}
                      >
                        История
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  const toggleMenu = (id) => {
    if (activeOptions === id) {
      setActiveOptions(null); // Agar shu menyu ochiq bo'lsa, yopiladi
    } else {
      setActiveOptions(id); // Aks holda, menyu ochiladi
    }
  };

  const toggleFilter = () => {
    setActiveFilter((prev) => !prev); // bosganda ochiladi/yopiladi
  };

  // Active sort status
  const handleStatusActive = () => {
    setSortStatus("active");
    setFilterDelete(true);
    setActiveFilter(false);
  };

  const handleStatusDisabled = () => {
    setSortStatus("false");
    setFilterDelete(true);
    setActiveFilter(false);
  };

  const handleStatusAll = () => {
    setSortStatus("");
    setFilterDelete(true);
    setActiveFilter(false);
  };

  const handleStatusDeleted = () => {
    setFilterDelete(false);
    setSortStatus("");
    setActiveFilter(false);
  };

  // Update form modal
  const formDateUpdate = async (data) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACK_API}api/updateuser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
        return; // Exit if token expired
      }

      if (response.ok) {
        const result = await response.json();

        // Update user list
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === result.data.id ? result.data : user
          )
        );

        setIsUpdateModal(false);
      } else {
        const errorResult = await response.json();
        console.error(errorResult.message || "Failed to update user");
      }
    } catch (error) {
      console.error(error.message || "An error occurred while updating user");
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

        <div className="controls">
          <div
            className={`dropdown ${activeFilter ? "active" : ""}`}
            ref={filterRef}
          >
            <button className="icon-button" onClick={toggleFilter}>
              <FaFilter />
            </button>
            {activeFilter && (
              <div className="dropdown-menu">
                <div onClick={handleStatusActive}>Активный</div>
                <div onClick={handleStatusDisabled}>Не активен</div>
                <div onClick={handleStatusAll}>Всё</div>
                <hr />
                <div onClick={handleStatusDeleted}>Удаленные</div>
              </div>
            )}
          </div>

          <button
            className="add-user-button"
            onClick={() => setIsModalOpen(true)}
          >
            <FaUserPlus /> Добавить пользователя
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="add-user-modal-overlay">
          <Addusermodal
            show={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddUserSubmit}
            user={formDateUpdate} // formDateUpdate ni user sifatida uzatamiz
          />
        </div>
      )}

      {showHistory && selectedUser && (
        <UserHistory user={selectedUser} closeModal={handleCloseModal} />
      )}

      {isUpdateModal && (
        <div className="add-user-modal-overlay">
          <UpdateUserModal
            show={isUpdateModal}
            onClose={() => setIsUpdateModal(false)}
            onSubmit={handleUpdateModal}
            user={selectedUser} // Pass selected user data to the modal
          />
        </div>
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>ИД</th>
            <th>Имя пользователя</th>
            <th>Пароль</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Дата</th>
            <th className="table-action">Параметры</th>
          </tr>
        </thead>
        <tbody>{usersTable()}</tbody>
      </table>
            {selectedViewItem && (
              <UserDetailModal item={selectedViewItem} onClose={() => setSelectedViewItem(null)} />
            )}
      {renderSuccessMessage()}
    </div>
  );
}
