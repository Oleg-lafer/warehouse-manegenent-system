import axios from "axios";
import Item from "../utils/Items";

const BASE_URL = "http://localhost:5000/api/items";

/**
 * Fetch all items from the backend.
 */
export const fetchItems = async (): Promise<any[]> => {
  try {
    // Sending a GET request to the backend to retrieve all items
    const response = await axios.get("http://localhost:5000/api/items");
    return response.data; // Returning the data received from the backend
  } catch (error) {
    console.error("Error fetching items:", error); // Log any error that occurs
    throw new Error("Failed to fetch items."); // Rethrow an error for the caller
  }
};

/**
 * Add a new item to the backend.
 */
export const addItem = async (item: Item): Promise<Item> => {
  try {
    const response = await axios.post(BASE_URL, item.toJSON());
    return Item.fromRawData(response.data);
  } catch (error) {
    console.error("Error adding item:", error);
    throw new Error("Failed to add item.");
  }
};

/**
 * Update an item on the backend.
 */
export const updateItem = async (type_code: string, item: Item): Promise<Item> => {
  try {
    const response = await axios.put(`${BASE_URL}/${type_code}`, item.toJSON());
    return Item.fromRawData(response.data);
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Failed to update item.");
  }
};

/**
 * Delete an item from the backend.
 */
export const deleteItem = async (type_code: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/${type_code}`);
  } catch (error) {
    console.error("Error deleting item:", error);
    throw new Error("Failed to delete item.");
  }
};
