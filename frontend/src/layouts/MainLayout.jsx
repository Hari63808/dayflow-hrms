import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ChatBot from '../components/chat/ChatBot';

const MainLayout = ({ title }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
      {/* Floating Dayflow AI Assistant Chatbot */}
      <ChatBot />
    </div>
  );
};

export default MainLayout;
