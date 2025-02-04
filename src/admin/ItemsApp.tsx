import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { fetchItems, addItem, deleteItem } from "../shared/api/itemsAPI";
import Item from "../shared/utils/Items";
import "react-toastify/dist/ReactToastify.css";
import "./AdminStyles.css";
import { useNavigate } from "react-router-dom";

const ItemsApp: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newTypeName, setNewTypeName] = useState<string>("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      console.log("📡 Fetching items from API...");
      const itemsData = await fetchItems();
      console.log("✅ Items received:", itemsData);
      setItems(itemsData);
    } catch (error) {
      toast.error("Failed to fetch items.");
      console.error("❌ Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBarcode = (typeName: string, quantity: number) => {
    const formattedName = typeName.toUpperCase().slice(0, 2);
    const formattedQty = String(quantity).padStart(3, "0");
    return `${formattedName}${formattedQty}`;
  };

  const handleAddItem = async () => {
    if (!newTypeName.trim()) {
      toast.error("Please enter a type name.");
      return;
    }

    setIsLoading(true);
    try {
      const quantity = items.filter(item => item.type_name === newTypeName).length + 1;
      const barcode = generateBarcode(newTypeName, quantity);

      const newItemData = new Item(0, newTypeName, newTypeName.toUpperCase().slice(0, 2), quantity.toString().padStart(3, "0"), barcode, "available");

      console.log("📡 Adding item:", newItemData);
      const addedItem = await addItem(newItemData);
      setItems((prevItems) => [...prevItems, addedItem]);

      setNewTypeName("");

      toast.success("Item added successfully!");
    } catch (error) {
      toast.error("Failed to add item.");
      console.error("❌ Error adding item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setIsLoading(true);
    try {
      console.log("🗑️ Deleting item with ID:", id);
      await deleteItem(id);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete item.");
      console.error("❌ Error deleting item:", error);
    } finally {
      setIsLoading(false);
    }
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
      <h1>📦 Items Management</h1>
      {isLoading && <div className="loading-spinner">Loading...</div>}

      <div className="form-container" style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%" }}>
        <input
          type="text"
          placeholder="Type Name"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          className="input"
          style={{ flex: "1", maxWidth: "300px" }}
        />
        <button onClick={handleAddItem} className="button">➕ Add Item</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Type Name</th>
            <th>Type Code</th>
            <th>Serial Code</th>
            <th>Barcode</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.type_name}</td>
              <td>{item.type_code}</td>
              <td>{item.serial_code}</td>
              <td>{item.barcode}</td>
              <td>{item.status}</td>
              <td>
                <button onClick={() => handleDeleteItem(item.id)} className="button delete-button">❌ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsApp;

