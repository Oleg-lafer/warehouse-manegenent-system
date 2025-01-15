import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { fetchItems, addItem, updateItem, deleteItem } from "../shared/api/itemsAPI";
import Item from "../shared/utils/Items";
import "react-toastify/dist/ReactToastify.css";
import "./Admin.css";

const ItemsApp: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newTypeName, setNewTypeName] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch items from the backend when the component loads
  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await fetchItems();
        setItems(items);
      } catch (error) {
        toast.error("Failed to load items.");
      }
    };

    loadItems();
  }, []);

  // Generate a serial code based on the number of items with the same type_name
  const generateSerialCode = (type_name: string): string => {
    const sameTypeItems = items.filter((item) => item.type_name === type_name);
    return (sameTypeItems.length + 1).toString().padStart(3, "0"); // Ensure 3 digits
  };

  // Handle adding a new item
  const handleAddItem = async () => {
    if (!newTypeName) {
      toast.error("Type name is required.");
      return;
    }

    const typeCode = newTypeName.slice(0, 2).toUpperCase();
    const serialCode = generateSerialCode(newTypeName);
    const newItem = new Item(newTypeName, typeCode, serialCode, `${typeCode}${serialCode}`);

    try {
      const addedItem = await addItem(newItem);
      setItems((prevItems) => [...prevItems, addedItem]);
      setNewTypeName("");
      toast.success("Item added successfully!");
    } catch {
      toast.error("Failed to add item.");
    }
  };

  // Handle editing an item
  const handleEditItem = (index: number) => {
    setEditIndex(index);
    setNewTypeName(items[index]?.type_name || "");
  };

  const handleSaveItem = async () => {
    if (editIndex === null) return;

    const itemToUpdate = items[editIndex];
    const updatedItem = new Item(
      newTypeName,
      itemToUpdate.type_code,
      itemToUpdate.serial_code,
      `${itemToUpdate.type_code}${itemToUpdate.serial_code}`
    );

    try {
      const savedItem = await updateItem(itemToUpdate.type_code, updatedItem);
      const updatedItems = [...items];
      updatedItems[editIndex] = savedItem;
      setItems(updatedItems);
      setEditIndex(null);
      setNewTypeName("");
      toast.success("Item updated successfully!");
    } catch {
      toast.error("Failed to update item.");
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (index: number) => {
    const itemToDelete = items[index];
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete.type_code);
      setItems(items.filter((_, i) => i !== index));
      toast.success("Item deleted successfully!");
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <h1>Manage Items</h1>

      {isLoading && <div className="loading-spinner">Loading...</div>}
      <div className="form-container">
        <h2>{editIndex === null ? "Add New Item" : "Edit Item"}</h2>
        <input
          type="text"
          placeholder="Type Name"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          className="input"
        />
        {editIndex === null ? (
          <button onClick={handleAddItem} className="button">
            Add Item
          </button>
        ) : (
          <button onClick={handleSaveItem} className="button">
            Save Changes
          </button>
        )}
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
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.type_name}</td>
              <td>{item.type_code}</td>
              <td>{item.serial_code}</td>
              <td>{item.barcode}</td>
              <td>{item.status}</td> 
              <td>
                <button onClick={() => handleEditItem(index)} className="button">
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="button"
                  style={{ color: "red" }}
                >
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

export default ItemsApp;
