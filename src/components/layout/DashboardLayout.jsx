import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, theme }) => {
  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#171717]' : 'bg-white'}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout; 