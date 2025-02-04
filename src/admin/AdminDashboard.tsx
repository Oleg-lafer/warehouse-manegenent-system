import React, { useState, useEffect } from "react";
import { fetchItems } from "../shared/api/itemsAPI";
import { fetchUsers } from "../shared/api/usersAPI";
import { fetchActions } from "../shared/api/ActionsAPI";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useNavigate } from "react-router-dom";
import "./AdminStyles.css";

Chart.register(...registerables);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [borrowedItems, setBorrowedItems] = useState<number>(0);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log("📡 Fetching dashboard data...");
      
      const [items, users, actions] = await Promise.all([
        fetchItems(),
        fetchUsers(),
        fetchActions(),
      ]);

      setTotalItems(items.length);
      setTotalUsers(users.length);
      setBorrowedItems(items.filter((item) => item.status === "borrowed").length);
      setRecentActions(actions.slice(0, 5));

      // Update Chart Data
      const availableItems = items.length - items.filter((item) => item.status === "borrowed").length;
      const borrowedItems = items.filter((item) => item.status === "borrowed").length;

      setChartData({
        labels: ["Available", "Borrowed"],
        datasets: [
          {
            label: "Item Status",
            data: [availableItems, borrowedItems],
            backgroundColor: ["#4CAF50", "#FF5733"],
            barThickness: 20, // ✅ Thinner bars (lower value = thinner)
            categoryPercentage: 0.6, // ✅ Reduces the overall width inside the category
          },
        ],
      });
      

      console.log("✅ Dashboard updated!");

    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <AdminNav />
      <h1>📊 Admin Dashboard</h1>

      <div className="stats-container">
        <div className="stat-box">📦 Total Items: <strong>{totalItems}</strong></div>
        <div className="stat-box">👤 Total Users: <strong>{totalUsers}</strong></div>
        <div className="stat-box">🔄 Borrowed Items: <strong>{borrowedItems}</strong></div>
      </div>

      <h2>🔄 Recent Actions</h2>
      <table className="action-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Item</th>
            <th>Action</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {recentActions.map((action, index) => (
            <tr key={index}>
              <td>{action.user_name}</td>
              <td>{action.item_name}</td>
              <td>{action.action_type}</td>
              <td>{new Date(action.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>📊 Live Item Status</h2>
        <div className="chart-container">
        {chartData && (
        <Bar 
            data={chartData} 
            options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                position: "top",
                labels: {
                    font: {
                    size: 14,
                    },
                    color: "#333", // Dark text
                },
                },
            },
            scales: {
                x: {
                ticks: {
                    font: {
                    size: 14,
                    },
                },
                },
                y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // ✅ Forces Y-axis to use only whole numbers
                    precision: 0, // ✅ Ensures numbers are not rounded with decimals
                    font: {
                    size: 14,
                    },
                },
                },
            },
            }}
            height={250} // ✅ Smaller height
            width={400} // ✅ Set width
        />
        )}
        </div>

    </div>
  );
};

const AdminNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="admin-nav">
      <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
      <button onClick={() => navigate("/admin/items")}>Manage Items</button>
      <button onClick={() => navigate("/admin/users")}>Manage Users</button>
      <button onClick={() => navigate("/admin/actions")}>View Actions</button>
    </nav>
  );
};

export default AdminDashboard;
