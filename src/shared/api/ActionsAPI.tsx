import axios from "axios";
import Action from "../utils/Actions";

const BASE_URL = "http://localhost:5000/api/actions";

/**
 * Fetch all actions from the backend and properly map them into `Action` instances.
 */
export const fetchActions = async (): Promise<Action[]> => {
  try {
    console.log("📡 Fetching actions from API...");
    const response = await axios.get(BASE_URL);
    
    console.log("✅ API Response (Actions):", response.data);

    return response.data.map(
      (action: any) =>
        new Action(action.id, action.user_name, action.item_name, action.action_type, action.timestamp)
    );
  } catch (error) {
    console.error("❌ Error fetching actions:", error);
    throw new Error("Failed to fetch actions.");
  }
};


/**
 * Add a new action to the backend.
 */
export const addAction = async (user_id: number, item_id: number, action_type: string): Promise<Action> => {
  try {
    console.log("📡 Sending Action to API:", { user_id, item_id, action_type });
    const response = await axios.post(BASE_URL, { user_id, item_id, action_type });
    
    return new Action(
      response.data.id,
      response.data.user_name || "Unknown User", // Ensure correct mapping
      response.data.item_name || "Unknown Item",
      response.data.action_type,
      response.data.timestamp
    );
  } catch (error) {
    console.error("❌ Error adding action:", error);
    throw new Error("Failed to add action.");
  }
};



/**
 * Update an action on the backend.
 */
export const updateAction = async (action_type: string, action: Action): Promise<Action> => {
  try {
    const response = await axios.put(`${BASE_URL}/${action_type}`, action.toJSON());
    return new Action(response.data.id, response.data.user_name, response.data.item_name, response.data.action_type, response.data.timestamp);
  } catch (error) {
    console.error("Error updating action:", error);
    throw new Error("Failed to update action.");
  }
};

/**
 * Delete an action from the backend.
 */
export const deleteAction = async (actionId: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/${actionId}`);
    console.log(`✅ Action ${actionId} deleted successfully.`);
  } catch (error) {
    console.error(`❌ Error deleting action ${actionId}:`, error);
    throw new Error("Failed to delete action.");
  }
};

