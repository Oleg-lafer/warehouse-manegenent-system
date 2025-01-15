import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Admin.css";
import { fetchItems } from "../shared/api/itemsAPI";
import { fetchUsers } from "../shared/api/usersAPI";

interface User {
  id: number;
  name: string;
}

interface Item {
  id: number;
  type_name: string;
  barcode: string;
  status: string; // e.g., "borrowed" or "available"
}

interface Action {
  id: number;
  user_name: string;
  item_name: string;
  action_type: string;
  timestamp: string;
}

const ActionsApp: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<string>("borrow");

  // Fetch users, items, and actions on component load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, itemsData] = await Promise.all([fetchUsers(), fetchItems()]);
        setUsers(usersData);
        setItems(itemsData);

        const actionsResponse = await fetch("http://localhost:5000/api/actions");
        const actionsData = await actionsResponse.json();
        setActions(actionsData);
      } catch (error) {
        toast.error("Failed to fetch data.");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddAction = async () => {
    if (!selectedUserId || !selectedItemId) {
      toast.error("Please select a user and an item.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserId,
          item_id: selectedItemId,
          action_type: actionType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add action.");
      }
  
  

      const updatedActions = await fetch("http://localhost:5000/api/actions").then((res) => res.json());
      const updatedItems = await fetchItems();

      setActions(updatedActions);
      setItems(updatedItems);

      toast.success("Action added successfully!");
      setSelectedUserId(null);
      setSelectedItemId(null);
      setActionType("borrow");
    } catch (error) {
      console.error("Error adding action:", error);
      toast.error("Failed to add action.");
    }
  };
  const handleDeleteAction = async (actionId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/actions/${actionId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete action.");
      }
  
      // עדכון רשומות לאחר מחיקה
      const updatedActions = await fetch("http://localhost:5000/api/actions").then((res) =>
        res.json()
      );
      setActions(updatedActions); // עדכון ה-state של הפעולות
  
      toast.success("Action deleted successfully!");
    } catch (error) {
      console.error("Error deleting action:", error);
      toast.error("Failed to delete action.");
    }
  };
  


  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <h1>Manage Actions</h1>

      {/* Add Action Form */}
      <div className="form-container">
        <h3>Add New Action</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Users Dropdown */}
          <select
            value={selectedUserId || ""}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            className="input"
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {/* Items Dropdown */}
          <select
            value={selectedItemId || ""}
            onChange={(e) => setSelectedItemId(Number(e.target.value))}
            className="input"
          >
            <option value="">Select Item</option>
            {items
              .filter((item) => item.status === "available") // רק פריטים זמינים
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.type_name} - {item.barcode}
                </option>
              ))}
          </select>


          {/* Action Type Dropdown */}
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="input"
          >
            <option value="borrow">Borrow</option>
            <option value="return">Return</option>
          </select>

          {/* Add Action Button */}
          <button onClick={handleAddAction} className="button">
            Add Action
          </button>
        </div>
      </div>

       {/* Actions History Table */}
       <h3>Actions History</h3>
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Item</th>
            <th>Action</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <tr key={action.id}>
              <td>{action.user_name}</td>
              <td>{action.item_name}</td>
              <td>{action.action_type}</td>
              <td>{new Date(action.timestamp).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDeleteAction(action.id)} className="button" style={{ color: "red" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActionsApp;
