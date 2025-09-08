import { Routes, Route } from "react-router-dom";
import Error from "./Components/Error";
import LoginPage from "./Components/Pages/Loginpage";
import Website from "./Components/Pages/Website";
import "./style/app.css";
import Transfers from "./Components/Pages/Transfers/Transfers";
import Accepted from "./Components/Pages/Acception/Homepage";
import EditPassword from "./Components/Pages/EditPassword";
import { UserProvider } from "./Components/Pages/Users/userContex";
import Texnika from "./Components/Pages/Texnika/Texnika";
import TexnikaRepair from "./Components/Pages/Texnika/texnika-repair";
import TexnikaUnused from "./Components/Pages/Texnika/texnika-unused";
import Users from "./Components/Pages/Users/Users";
import TexnikaChart from "./Components/Pages/Texnika/texnikaChart";
import AdminPanel from "./Components/Pages/Admin/pages/AdminPanel";
import AdminPanelPosition from "./Components/Pages/Admin/components/Position/AdminPanelPosition";
import AdminPanelEmployee from "./Components/Pages/Admin/components/Employee/AdminEmployee";
import AdminPanelSupportEmployee from "./Components/Pages/Admin/components/Support_employee/AdminPanelSupportEmployee";
import AdminPanelOperationalSystem from "./Components/Pages/Admin/components/Operational_system/AdminPanelOperationalSystem";
import AdminPanelInstalledSoftware from "./Components/Pages/Admin/components/Installed_software/AdminPanelInstalledSoftware";

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/website" element={<Website />}>
          <Route index element={<Accepted />} />
          <Route path="/website/users" element={<Users />} />
          <Route path="/website/editpassword" element={<EditPassword />} />

          <Route path="/website/texnika" element={<Texnika />} />
          <Route path="/website/texnika/repair" element={<TexnikaRepair />} />
          <Route path="/website/texnika/unused" element={<TexnikaUnused />} />
          <Route path="/website/texnikachart" element={<TexnikaChart />} />

          <Route path="/website/transfers" element={<Transfers />} />

          <Route path="/website/adminpanel" element={<AdminPanel />} />
          <Route path="/website/adminpanel/employee" element={<AdminPanelEmployee />} />
          <Route path="/website/adminpanel/support-staff" element={<AdminPanelSupportEmployee />} />
          <Route path="/website/adminpanel/position" element={<AdminPanelPosition />} />
          <Route path="/website/adminpanel/operating-systems" element={<AdminPanelOperationalSystem />} />
          <Route path="/website/adminpanel/installed-software" element={<AdminPanelInstalledSoftware />} />

          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
