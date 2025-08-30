import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
} from "react-icons/fa";
import "../../style/Users.css"; // CSS faylingiz
import Referense from "../Referense";
import { UserContext } from "../Users/userContex";
import UpdateModalTexnika from "./Updatetexnika";
import TexnikaDetailModal from "./Detail texnika/TexnikaDetailModal";
import EquipmentHistory from "../History/EquipmentHistory";

export default function TexnikaUnused() {
  const navigate = useNavigate();
  const { search } = useContext(UserContext);

  // Pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(100);
  const [users, setUsers] = useState([]);

  // Message Modal
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  // Search and Sort
  const [globSearch, setGlobSearch] = useState("");
  const [activeSort, setActiveSort] = useState(null);

  // Update and Add User
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserUpdate, setSelectedUserUpdate] = useState("");

  // History
  const [showHistory, setShowHistory] = useState(false); // History


  // Dropdown Menu Active State
  const [activeMenuId, setActiveMenuId] = useState(null);

  const BACK_API = process.env.REACT_APP_BACK_API;

  // Detail texnika
    const [selectedViewItem, setSelectedViewItem] = useState(null);

  // useEffect
  useEffect(() => {
    readAcception();
    setGlobSearch(search || "");
  }, [page, size, search, globSearch, activeSort]);


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

  // Fetch Acception
  const readAcception = async () => {
    const data = {
      page: page || 1,
      size: size || 10,
      search: globSearch || "",
      filter: activeSort || "",
      status: "unused",
    };
  
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams(data).toString();
  
      const response = await fetch(
        `${BACK_API}api/readtexnika?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 403) {
        // Token muddati tugagan bo'lsa, foydalanuvchini login sahifasiga yo'naltirish
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);
  
        setTimeout(() => {
          setShowSuccess(false); // Xabarni 3 soniyadan so'ng yashirish
          navigate("/"); // Login sahifasiga yo'naltirish
        }, 3000);
        return;
      }
  
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data);
        setTotal(result.total);
      } else {
        const errorResult = await response.json();
        console.log(errorResult.message);
      }
    } catch (error) {
      console.log("Xatolik yuz berdi:", error);
    }
  };

  // Update Acception
  const handleUpdate = (user) => {
    setSelectedUserUpdate(user);
  };
 
  const handleSendToRepair = async (equipment) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id"); // user_id ni localStorage dan olish

      if (!userId) {
        setSuccess(false);
        setText("Foydalanuvchi ID topilmadi");
        setShowSuccess(true);
        return;
      }

      const response = await fetch(`${BACK_API}api/movetorepair`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipment_id: equipment.id,
          users_id: +userId, // string bo'lishi mumkin, shuning uchun numberga aylantiryapmiz
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setText(data.message || "Texnika muvaffaqiyatli o'zgartirildi");
      } else {
        setSuccess(false);
        setText(data.message || "Texnika o'zgartirishda xatolik yuz berdi");
      }
    } catch (error) {
      setSuccess(false);
      setText(error.message || "Texnika o'zgartirishda xatolik yuz berdi");
    } finally {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
      }, 3000);
    }
  };

const handleSendToTexnika = async (equipment) => {
  try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id"); // user_id ni localStorage dan olish

      if (!userId) {
        setSuccess(false);
        setText("Foydalanuvchi ID topilmadi");
        setShowSuccess(true);
        return;
      }

    // API so'rovini yuborish
    const response = await fetch(`${BACK_API}api/movetotexnika`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Tokenni Authorization header'iga qo'shish
      },
        body: JSON.stringify({
          equipment_id: equipment.id,
          users_id: +userId, // string bo'lishi mumkin, shuning uchun numberga aylantiryapmiz
        }),
    });

    if (response.status === 403) {
      // Token muddati tugagan bo'lsa, foydalanuvchini login sahifasiga yo'naltirish
      setText("Срок действия вашего токена истек");
      setSuccess(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false); // 3 soniyadan so'ng xabarni yashirish
        navigate("/"); // Login sahifasiga yo'naltirish
      }, 3000);
      return;
    }

    const data = await response.json();

    if (response.ok) {
      // Muvaffaqiyatli javobni ko'rsatish
      setSuccess(true);
      setText(data.message || "Texnika muvaffaqiyatli o'zgartirildi");
    } else {
      // Xatolik xabarini ko'rsatish
      setSuccess(false);
      setText(data.message || "Texnika o'zgartirishda xatolik yuz berdi");
    }
  } catch (error) {
    // Umumiy xatolikni ko'rsatish
    console.error("Error while sending to unused:", error);
    setSuccess(false);
    setText(error.message || "Texnika o'zgartirishda xatolik yuz berdi");
  } finally {
    // Modalni yoki muvaffaqiyat xabarini ko'rsatish
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      window.location.reload(); // Sahifani qayta yuklash
    }, 3000); // 3 soniya kutish
  }
};

  const toggleMenu = (id) => {
    if (activeMenuId === id) {
      setActiveMenuId(null); // Agar shu menyu ochiq bo'lsa, yopiladi
    } else {
      setActiveMenuId(id); // Aks holda, menyu ochiladi
    }
  };

  // User Table
  const acceptionTable = () => {
    return users.map((user, index) => (
      <tr key={user.id} onDoubleClick={() => setSelectedViewItem(user)}>
        <td>{index + 1 + (page - 1) * size}</td>
        <td>{user.name}</td>
        <td>{user.inventory_number}</td>
        <td>{user.serial_number}</td>
        <td>{user.mac_address}</td>
        <td>
          {new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(new Date(user.created_at))}
        </td>
        <td>{user.status}</td>
        <td className="edit-btns">
          <div className="menu-options">
            <button className="menu-icon" onClick={() => toggleMenu(user.id)}>
              <FaEllipsisV />
            </button>
            {activeMenuId === user.id && (
              <div className="dropdown-menu">
                                <button
                  onClick={() => {
                    handleSendToTexnika(user);
                    setActiveMenuId(null); // Menyuni yopish
                  }}
                >
                  Направить в эксплуатации
                </button>
                <button
                  onClick={() => {
                    handleSendToRepair(user);
                    setActiveMenuId(null); // Menyuni yopish
                  }}
                >
                  Направить в ремонт
                </button>
                <button
                  onClick={() => {
                    handleUpdate(user);
                    setActiveMenuId(null); // Menyuni yopish
                  }}
                >
                  Редактировать
                </button>
                <button
                onClick={() => {
                  handleShowHistory(user);
                  setActiveMenuId(null); // Menyuni yopish
                }}
              >
                История
              </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    ));
    
  };

  const handleShowHistory = (user) => {
    setSelectedUser(user);
    setShowHistory(true);
  };

  const handleCloseModal = () => {
    setShowHistory(false);
    setSelectedUser(null);
  };

  // Sort by Status
  const handleSortStatusClick = (sortField) => {
    setActiveSort(sortField);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setSelectedUserUpdate(null);
  };

  const handleModalTexnika = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const data = {
      id: e.id,
      name: e.equipment_name || e.name || "",
      inventory_number: e.inventory_number || "",
      serial_number: e.serial_number || "",
      mac_address: e.mac || e.mac_address || "",
      users_id: localStorage.getItem("user_id"),
      description: "Изменение данных техники",
      action: "Обновление",
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BACK_API}api/updatetexnika`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 403) {
        // Token muddati tugagan bo'lsa, foydalanuvchini login sahifasiga yo'naltirish
        setText("Срок действия вашего токена истек");
        setSuccess(false);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          navigate("/");
        }, 3000);
        return;
      }

      const result = await response.json();

      if (response.ok) {
        // Muvaffaqiyatli javobni boshqarish
        setSuccess(true);
        setText(result.message || "Texnika muvaffaqiyatli yangilandi");
      } else {
        // Xatolikni boshqarish
        setSuccess(false);
        setText(result.message || "Texnika yangilashda xatolik yuz berdi");
      }
    } catch (error) {
      // Umumiy xatolikni boshqarish
      setSuccess(false);
      setText(error.message || "Texnika yangilashda xatolik yuz berdi");
    } finally {
      // Xabarni ko'rsatish va sahifani yangilash
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
      }, 3000);
    }

    closeModal(); // Modalni yopish
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

        <div className="controls">
          <div className="dropdown">
            <button className="icon-button">
              <FaFilter />
            </button>
            <div className="dropdown-menu">
              <a href="#!" onClick={() => handleSortStatusClick("naimenovaniya_tex")}>
                Наименования тех
              </a>
              <a href="#!" onClick={() => handleSortStatusClick("inv_tex")}>
                ИНВ номер
              </a>
              <a href="#!" onClick={() => handleSortStatusClick("seriyniy_nomer")}>
                Серийный номер
              </a>
              <a href="#!" onClick={() => handleSortStatusClick("mac_address")}>
                Mac address
              </a>
            </div>
          </div>
        </div>
      </div>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Наименования тех</th>
            <th>ИНВ номер</th>
            <th>Серийный номер</th>
            <th>Mac addres</th>
            <th>Дата</th>
            <th>Статус</th>
            <th className="table-action">Параметры</th>
          </tr>
        </thead>
        <tbody>{acceptionTable()}</tbody>
      </table>

      {showHistory && selectedUser && (
        <EquipmentHistory user={selectedUser} closeModal={handleCloseModal} />
      )}

      {selectedUserUpdate && (
        <UpdateModalTexnika
          show={true}
          user={selectedUserUpdate}
          onClose={closeModal}
          onSubmit={handleModalTexnika}
        />
      )}

            {selectedViewItem && (
        <TexnikaDetailModal item={selectedViewItem} onClose={() => setSelectedViewItem(null)} />
      )}

      {renderSuccessMessage()}
    </div>
  );
}
