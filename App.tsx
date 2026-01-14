import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DataAnalysisPage from "./pages/DataAnalysisPage";
import LoginPage from "./pages/LoginPage";
import DeviceAdministrationPage from "./pages/DeviceAdministrationPage";

// ⭐ Import apiService
import { apiService } from "./services/api";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ⭐ Set your Keycloak token once when app loads
  useEffect(() => {
    apiService.setKeycloakToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJZaW1ZbDh2aVdSMDVJaEZHQ1NSazFWd2NrQjM3UXlWWkVvUlVnZEF2N0VnIn0.eyJleHAiOjE3Njg0MjY1NzAsImlhdCI6MTc2ODM5MDU3MCwianRpIjoiNjRmZDg0ZmUtZGIzNy00ZDI5LWE3ODktOTQ5MzdkMjRiMmY1IiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLXB5dGhvbi1jYWFzLWtleWNsb2FrLTE6ODA4MC9yZWFsbXMva2FhdHJ1LWNhYXMiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiZTUwOGNkZGQtZjdjNC00ZjUyLTg4Y2YtNzNhZDFhMzI3NjA2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiY2Fhcy1iYWNrZW5kIiwic2Vzc2lvbl9zdGF0ZSI6ImExN2FmZGM3LTgzM2EtNGRmNC1iYWYxLWYyY2U2ZWJkNWMwMiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2xvY2FsaG9zdDo4MDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWthYXRydS1jYWFzIiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIiwidXNlciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJlYWxtLW1hbmFnZW1lbnQiOnsicm9sZXMiOlsidmlldy1yZWFsbSIsInZpZXctaWRlbnRpdHktcHJvdmlkZXJzIiwibWFuYWdlLWlkZW50aXR5LXByb3ZpZGVycyIsImltcGVyc29uYXRpb24iLCJyZWFsbS1hZG1pbiIsImNyZWF0ZS1jbGllbnQiLCJtYW5hZ2UtdXNlcnMiLCJxdWVyeS1yZWFsbXMiLCJ2aWV3LWF1dGhvcml6YXRpb24iLCJxdWVyeS1jbGllbnRzIiwicXVlcnktdXNlcnMiLCJtYW5hZ2UtZXZlbnRzIiwibWFuYWdlLXJlYWxtIiwidmlldy1ldmVudHMiLCJ2aWV3LXVzZXJzIiwidmlldy1jbGllbnRzIiwibWFuYWdlLWF1dGhvcml6YXRpb24iLCJtYW5hZ2UtY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiYTE3YWZkYzctODMzYS00ZGY0LWJhZjEtZjJjZTZlYmQ1YzAyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJIZW1uYXRoIEthYXRydSIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluIiwiZ2l2ZW5fbmFtZSI6IkhlbW5hdGgiLCJmYW1pbHlfbmFtZSI6IkthYXRydSIsImVtYWlsIjoiaGVtbmF0aEBrYWF0cnUub3JnIn0.emkg8aKFR2WLOT-lXwJrMRsC5aGuwqpLOAiCyMmNuc8d8ZXUTogtRRnay30u_D7HCSk4gXgFXgPUv2XK-SFLkx6X6vmGBap5X0YCdzX5u8-KqhuDCzfRQXjbbq3z_NOG9liBgJqjh0qtt1D21fVnKFVBbNgPSXfQvJUA8rCGx2nUKuZq10zBKXzOII8NGmrQSXJ-itRms8EXbVOWFKKQ7-DyPQbhXW9qeIFs5TKCbDu88xIGQ4wAUrEI0Kky2-dVO23RJ5lWdbs4WCgHP_xiWw2vGOVTKbXPlzGVybzpUske0OTDsUGwMEDUZz1iCeZ2yn_LwW7J7YpglXhKSjyLHA");
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
