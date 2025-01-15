import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

const UserApp: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // Fetch users and items on component load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, itemsData] = await Promise.all([fetchUsers(), fetchItems()]);
        setUsers(usersData);
        setItems(itemsData);
      } catch (error) {
        toast.error("Failed to fetch data.");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleBorrowItem = async () => {
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
          action_type: "borrow",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to borrow item.");
      }

      // Refresh items after borrowing
      const updatedItems = await fetchItems();
      setItems(updatedItems);

      toast.success("Item borrowed successfully!");
      setSelectedUserId(null);
      setSelectedItemId(null);
    } catch (error) {
      console.error("Error borrowing item:", error);
      toast.error("Failed to borrow item.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <h1>User Borrowing Interface</h1>

      {/* User Selection */}
      <div>
        <h3>Select User</h3>
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
      </div>

      {/* Item Selection */}
      <div style={{ marginTop: "20px" }}>
        <h3>Select Item</h3>
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
      </div>

      {/* Borrow Button */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleBorrowItem} className="button">
          Borrow Item
        </button>
      </div>
    </div>
  );
};

export default UserApp;
