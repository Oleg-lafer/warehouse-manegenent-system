import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminDashboard from "./admin/AdminDashboard";
import ItemsApp from "./admin/ItemsApp";
import UsersApp from "./admin/UsersApp";
import ActionsApp from "./admin/ActionsApp";
import UserDashboard from "./user/UserApp";

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

// 🔹 Layout with Role-Based Navigation
const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Automated Warehouse System</h1>

      {/* 🔹 Role Selection Navigation */}
      <nav className="role-nav">
        <button onClick={() => navigate("/admin/dashboard")}>Admin Panel</button>
        <button onClick={() => navigate("/user")}>User Interface</button>
      </nav>

      <Routes>
        {/* 🔹 Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/items" element={<ItemsApp />} />
        <Route path="/admin/users" element={<UsersApp />} />
        <Route path="/admin/actions" element={<ActionsApp />} />

        {/* 🔹 User Route */}
        <Route path="/user" element={<UserDashboard />} />

        {/* 🔹 Default Redirect to Dashboard */}
        <Route path="/" element={<Navigate replace to="/admin/dashboard" />} />
      </Routes>
    </div>
  );
};

export default App;
