import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminStyles.css";
import { fetchItems, updateItemStatus } from "../shared/api/itemsAPI"; 
import { fetchUsers } from "../shared/api/usersAPI";
import { fetchActions, addAction, deleteAction} from "../shared/api/ActionsAPI";
import Action from "../shared/utils/Actions";
import User from "../shared/utils/Users";
import Item from "../shared/utils/Items";
import { useNavigate } from "react-router-dom";

const ActionsApp: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<string>("borrow");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log("🔍 Users:", users);
    console.log("🔍 Items:", items);
    console.log("🔍 Selected User:", selectedUserId);
  
    if (actionType === "borrow") {
      console.log("📌 Filtering available items...");
      setFilteredItems(items.filter((item) => item.status === "available"));
    } else if (actionType === "return" && selectedUserId) {
      console.log("📌 Filtering borrowed items...");
      const user = users.find((user) => user.id === selectedUserId);
      if (user) {
        console.log("📦 User Borrowed Items:", user.borrowedItems);
        setFilteredItems(items.filter((item) => user.borrowedItems.includes(item.type_name)));
      } else {
        setFilteredItems([]);
      }
    }
  }, [actionType, selectedUserId, items, users]);
  
  
  
  

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log("📡 Fetching users, items, and actions...");
      const [usersData, itemsData, actionsData] = await Promise.all([
        fetchUsers(),
        fetchItems(),
        fetchActions(),
      ]);
      console.log("✅ Users received:", usersData);
      console.log("✅ Items received:", itemsData);
      console.log("✅ Actions received:", actionsData);
      setUsers(usersData);
      setItems(itemsData);
      setActions(actionsData);
    } catch (error) {
      toast.error("Failed to fetch data.");
      console.error("❌ Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddAction = async () => {
    if (!selectedUserId || !selectedItemId) {
      toast.error("Please select a user and an item.");
      return;
    }
  
    setIsLoading(true);
    try {
      await addAction(selectedUserId, selectedItemId, actionType);
  
      // ✅ Fetch fresh users and items to reflect the change instantly
      const [updatedUsers, updatedItems, updatedActions] = await Promise.all([
        fetchUsers(),
        fetchItems(),
        fetchActions(),
      ]);
  
      setUsers(updatedUsers);
      setItems(updatedItems);
      setActions(updatedActions); // Refresh action history as well
  
      // ✅ Reapply filtering after fetching updated data
      if (actionType === "borrow") {
        setFilteredItems(updatedItems.filter((item) => item.status === "available"));
      } else if (actionType === "return") {
        const user = updatedUsers.find((u) => u.id === selectedUserId);
        if (user) {
          setFilteredItems(updatedItems.filter((item) => user.borrowedItems.includes(item.type_name)));
        }
      }
  
      toast.success(`Item successfully ${actionType}ed!`);
      resetForm();
    } catch (error) {
      console.error("❌ Error processing action:", error);
      toast.error(`Failed to ${actionType} item.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleUserChange = (userId: number) => {
    setSelectedUserId(userId);
  
    if (actionType === "return") {
      const user = users.find((u) => u.id === userId);
      if (user) {
        console.log("📦 User Borrowed Items:", user.borrowedItems); // Debugging
        setFilteredItems(items.filter((item) => user.borrowedItems.includes(item.type_name)));
      } else {
        setFilteredItems([]);
      }
    }
  };
  
  
  
  
  const handleDeleteAction = async (actionId: number) => {
    if (!window.confirm("Are you sure you want to delete this action?")) return;
  
    setIsLoading(true);
    try {
      await deleteAction(actionId);
      
      // Remove deleted action from the state without refreshing all data
      setActions((prevActions) => prevActions.filter(action => action.id !== actionId));
  
      toast.success("Action deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting action:", error);
      toast.error("Failed to delete action.");
    } finally {
      setIsLoading(false);
    }
  };
  


  const resetForm = () => {
    setSelectedUserId(null);
    setSelectedItemId(null);
    setActionType("borrow");
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <nav className="admin-nav">
      <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
      <button onClick={() => navigate("/admin/items")}>Manage Items</button>
      <button onClick={() => navigate("/admin/users")}>Manage Users</button>
      <button onClick={() => navigate("/admin/actions")}>View Actions</button>
      </nav>
      <h1>Manage Actions</h1>

      {isLoading && <div className="loading-spinner">Loading...</div>}

      <div className="form-container">
        <h2>Borrow or Return Item</h2>
        <select
          value={selectedUserId || ""}
          onChange={(e) => handleUserChange(Number(e.target.value))} // ✅ Now it filters items
          className="input"
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={selectedItemId || ""}
          onChange={(e) => setSelectedItemId(Number(e.target.value))}
          className="input"
        >
          <option value="">Select Item</option>
          {filteredItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.type_name} ({item.status})
            </option>
          ))}
        </select>




        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="input"
        >
          <option value="borrow">Borrow</option>
          <option value="return">Return</option>
        </select>

        <button onClick={handleAddAction} className="button">
          Submit Action
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Item</th>
            <th>Action</th>
            <th>Timestamp</th>
            <th>Actions</th> {/* New column for delete button */}
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
                <button onClick={() => handleDeleteAction(action.id)} className="button delete-button">
                  ❌ Delete
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
