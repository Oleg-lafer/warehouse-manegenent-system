import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Admin.css";

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

const ActionsApp: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [actionType, setActionType] = useState<string>("borrow");

  // Fetch users and items on component load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, itemsResponse] = await Promise.all([
          fetch("http://localhost:5000/api/users"),
          fetch("http://localhost:5000/api/items"),
        ]);
        const usersData = await usersResponse.json();
        const itemsData = await itemsResponse.json();

        setUsers(usersData);
        setItems(itemsData.filter((item: Item) => item.status !== "borrowed")); // Show only available items
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle adding an action
  const handleAddAction = async () => {
    if (!selectedUserName || !selectedItemName) {
      toast.error("Please select a user and an item.");
      return;
    }

    // Find the user and item
    const user = users.find((u) => u.name.toLowerCase() === selectedUserName.toLowerCase());
    const item = items.find((i) => i.type_name.toLowerCase() === selectedItemName.toLowerCase());

    if (!user) {
      toast.error("User not found.");
      return;
    }
    if (!item) {
      toast.error("Item not found.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: user.name, // Send user name
          item_name: item.type_name, // Send item name
          action_type: actionType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add action.");
      }

      // Refresh items after adding action
      const updatedItemsResponse = await fetch("http://localhost:5000/api/items");
      const updatedItems = await updatedItemsResponse.json();
      setItems(updatedItems.filter((item: Item) => item.status !== "borrowed"));

      toast.success("Action added successfully!");
      setSelectedUserName("");
      setSelectedItemName("");
      setActionType("borrow");
    } catch (error) {
      console.error("Error adding action:", error);
      toast.error("Failed to add action.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <h1>Manage Actions</h1>

      <div className="form-container">
        <h3>Add New Action</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="User Name"
            value={selectedUserName}
            onChange={(e) => setSelectedUserName(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Item Name"
            value={selectedItemName}
            onChange={(e) => setSelectedItemName(e.target.value)}
            className="input"
          />
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="input"
          >
            <option value="borrow">Borrow</option>
            <option value="return">Return</option>
          </select>

          <button onClick={handleAddAction} className="button">
            Add Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionsApp;
