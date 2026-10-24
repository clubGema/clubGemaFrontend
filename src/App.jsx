import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { BRAND_COLORS, alpha } from "./config/themeColors.js";

import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from "./pages/ResetPassword";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";

import PublicLayout from "./routes/PublicLayout";
import { getStudentRoutes } from "./routes/studentRoutes";
import { getTeacherRoutes } from "./routes/teacherRoutes";
import { getAdminRoutes } from "./routes/adminRoutes";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            border: `2px solid ${BRAND_COLORS.primary}`,
            padding: '16px',
            color: BRAND_COLORS.primary,
            borderRadius: '1rem',
            fontWeight: '900',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            boxShadow: `0 10px 15px -3px ${alpha(BRAND_COLORS.primary, 0.2)}, 0 4px 6px -2px ${alpha(BRAND_COLORS.primary, 0.1)}`
          },
          success: {
            style: {
              background: BRAND_COLORS.bg,
              borderLeft: `6px solid ${BRAND_COLORS.primary}`, // Vinotinto representing Imperio 7 operations
            },
            iconTheme: {
              primary: BRAND_COLORS.primary,
              secondary: '#fff', // primer plano sobre el primario, no una superficie de marca
            },
          },
          // El naranja del toast de error se queda crudo a propósito: aquí es
          // un color de ESTADO (atención), no el acento de marca. Si el acento
          // cambiara a otro tono, los errores no deben seguirlo.
          error: {
            style: {
              background: '#fff',
              borderLeft: '6px solid #D4AF37', // Orange indicating errors
              color: '#D4AF37',
              borderColor: '#D4AF37'
            },
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/*" element={<PublicLayout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* --- RUTAS PROTEGIDAS (DASHBOARD) --- */}
        <Route path="/dashboard">
          {getStudentRoutes()}
          {getTeacherRoutes()}
          {getAdminRoutes()}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
