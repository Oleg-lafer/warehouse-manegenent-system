import axios from "axios";
import Item from "../utils/Items";

const BASE_URL = "http://localhost:5000/api/items";

/**
 * Fetch all items from the backend.
 */
export const fetchItems = async (): Promise<Item[]> => {
  try {
    console.log("📡 Fetching items from API...");
    const response = await axios.get(BASE_URL);
    
    // Debug log to confirm API data is being received
    console.log("✅ API Response:", response.data);

    return response.data.map((item: any) => new Item(item.id, item.type_name, item.type_code, item.serial_code, item.barcode, item.status));
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    throw new Error("Failed to fetch items.");
  }
};

/**
 * Add a new item to the backend.
 */
export const addItem = async (item: Item): Promise<Item> => {
  try {
    const { id, ...itemWithoutId } = item;
    const response = await axios.post(BASE_URL, itemWithoutId);
    return response.data;
  } catch (error) {
    console.error("Error adding item:", error);
    throw new Error("Failed to add item.");
  }
};

export const updateItemStatus = async (id: number, status: string): Promise<void> => {
  try {
    console.log(`📡 Updating item ${id} status to ${status}...`);

    await axios.put(`http://localhost:5000/api/items/${id}`, { status });

    console.log(`✅ Item ${id} status updated to ${status}`);
  } catch (error) {
    console.error("❌ Error updating item status:", error);
    throw new Error("Failed to update item status.");
  }
};



/**
 * Delete an item from the backend.
 */
export const deleteItem = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting item:", error);
    throw new Error("Failed to delete item.");
  }
};