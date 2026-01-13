import React, { useState } from 'react';
import DataAnalysisPage from './pages/DataAnalysisPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
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
  );
}

export default App;