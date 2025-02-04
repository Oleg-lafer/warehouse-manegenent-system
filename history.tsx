import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { fetchItems, addItem, deleteItem } from "../shared/api/itemsAPI";
import Item from "../shared/utils/Items";
import "react-toastify/dist/ReactToastify.css";
import "./Admin.css";

const ItemsApp: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Item>(new Item(0, "", "", "", "", "available"));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  

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

  // Generate barcode (only when adding a new item)
  const generateBarcode = (typeName: string, quantity: number) => {
    const formattedName = typeName.toUpperCase().slice(0, 2); // Max 2 letters
    const formattedQty = String(quantity).padStart(3, "0"); // 3-digit format
    return `${formattedName}${formattedQty}`;
  };

  const handleAddItem = async () => {
    if (!newItem.type_name) {
      toast.error("Please enter a type name.");
      return;
    }

    setIsLoading(true);
    try {
        // Adding new item
        const quantity = items.filter(item => item.type_name === newItem.type_name).length + 1;
        const barcode = generateBarcode(newItem.type_name, quantity);

        const newItemData = new Item(0, newItem.type_name, newItem.type_name.toUpperCase().slice(0, 2), quantity.toString().padStart(3, "0"), barcode, "available");

        console.log("📡 Adding item:", newItemData);
        const addedItem = await addItem(newItemData);
        setItems([...items, addedItem]);
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
      <h1>Automated Warehouse System</h1>
      {isLoading && <div className="loading-spinner">Loading...</div>}

      {/* Add New Item Section */}
      <div className="form-container">
        <input
          type="text"
          placeholder="Type Name"
          value={newItem.type_name}
          onChange={(e) =>
            setNewItem(
              new Item(
                newItem.id,
                e.target.value,
                newItem.type_code,
                newItem.serial_code,
                newItem.barcode,
                newItem.status
              )
            )
          }
          className="input"
        />
      </div>

      {/* Items Table */}
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
