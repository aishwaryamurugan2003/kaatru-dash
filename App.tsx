import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DataAnalysisPage from "./pages/DataAnalysisPage";
import LoginPage from "./pages/LoginPage";
import DeviceAdministrationPage from "./pages/DeviceAdministrationPage";
import { isTokenAlive } from "./utils/token";
import { apiService } from "./services/api";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

useEffect(() => {
    const token = import.meta.env.VITE_KEYCLOAK_TOKEN;

  if (isTokenAlive(token)) {
    apiService.setKeycloakToken(token);
  } else {
    apiService.clearToken(); // we’ll add this
  }
}, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- LOGIN PAGE (NO SIDEBAR, NO HEADER) ---------- */}
        <Route path="/" element={<LoginPage />} />

        {/* ---------- DASHBOARD HOME (Data Analysis) ---------- */}
        <Route
          path="/dashboard"
          element={
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                ></div>
              )}

              <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

              <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header setSidebarOpen={setIsSidebarOpen} />
                <main className="p-4 sm:p-6 lg:p-8">
                  <DataAnalysisPage />
                </main>
              </div>
            </div>
          }
        />

        {/* ---------- DEVICE ADMINISTRATION PAGE ---------- */}
        <Route
          path="/device-admin"
          element={
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                ></div>
              )}

              <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

              <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header setSidebarOpen={setIsSidebarOpen} />
                <main className="p-4 sm:p-6 lg:p-8">
                  <DeviceAdministrationPage />
                </main>
              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
