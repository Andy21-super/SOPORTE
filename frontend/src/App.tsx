import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layouts/MainLayout";
import { CreateTicket } from "./pages/CreateTicket";
import { Audit } from "./pages/Audit";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { PublicHome } from "./pages/PublicHome";
import { PublicTicketDetail } from "./pages/PublicTicketDetail";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Modules } from "./pages/Modules";
import { Reports } from "./pages/Reports";
import { Roles } from "./pages/Roles";
import { Settings } from "./pages/Settings";
import { TicketDetail } from "./pages/TicketDetail";
import { Tickets } from "./pages/Tickets";
import { Users } from "./pages/Users";
import { EmailTemplates } from "./pages/EmailTemplates";
import { SlaConfig } from "./pages/SlaConfig";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/olvide-contrasena" element={<ForgotPassword />} />
      <Route index element={<PublicHome />} />
      <Route path="/ticket/:id" element={<PublicTicketDetail />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/nuevo" element={<CreateTicket />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="modulos" element={<Modules />} />
          <Route path="plantillas-correo" element={<EmailTemplates />} />
          <Route path="sla" element={<SlaConfig />} />
          <Route path="reportes" element={<Reports />} />
          <Route path="auditoria" element={<Audit />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
