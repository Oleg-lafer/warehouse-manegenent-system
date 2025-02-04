import axios from "axios";
import User from "../utils/Users";

const BASE_URL = "http://localhost:5000/api/users";

/**
 * Fetch all users from the backend and map them properly to `User` instances.
 */
export const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log("📡 Fetching users from API...");
    const response = await axios.get(BASE_URL);
    
    console.log("✅ API Response (Users):", response.data);

    return response.data.map((user: any) => 
      new User(
        user.id,
        user.name,
        user.permission,
        typeof user.borrowedItems === "string" ? user.borrowedItems.split(",") : [] // ✅ Properly formats borrowedItems as an array
      )
    );    
  
    } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw new Error("Failed to fetch users.");
  }
};

/**
 * Add a new user to the backend.
 */
export const addUser = async (user: User): Promise<User> => {
  try {
    const response = await axios.post(BASE_URL, {
      name: user.name,
      permission: user.permission,
    });
    return new User(response.data.id, response.data.name, response.data.permission, response.data.borrowedItems || []);
  } catch (error) {
    console.error("Error adding user:", error);
    throw new Error("Failed to add user.");
  }
};

/**
 * Update a user on the backend.
 */
export const updateUser = async (id: number, user: User): Promise<User> => {
  try {
    console.log(`📡 Sending update request for user ${id}...`);
    console.log("📦 Data sent:", { name: user.name, permission: user.permission, borrowedItems: user.borrowedItems });

    const response = await axios.put(`http://localhost:5000/api/users/${id}`, {
      name: user.name,
      permission: user.permission,
      borrowedItems: user.borrowedItems,
    });

    console.log("✅ User updated:", response.data);
    return new User(id, user.name, user.permission, user.borrowedItems);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw new Error("Failed to update user.");
  }
};



/**
 * Delete a user from the backend.
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user.");
  }
};

export default { fetchUsers, addUser, updateUser, deleteUser };
