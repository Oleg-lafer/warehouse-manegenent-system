import axios from "axios";

interface User {
  id: number;
  name: string;
  permission: string;
  borrowed_items: string | null; 
}


const BASE_URL = "http://localhost:5000/api/users";

export const fetchUsers = async (): Promise<any[]> => {
  try {
    // Sending a GET request to the backend to retrieve all users
    const response = await axios.get("http://localhost:5000/api/users");
    return response.data; // Returning the data received from the backend
  } catch (error) {
    console.error("Error fetching users:", error); // Log any error that occurs
    throw new Error("Failed to fetch users."); // Rethrow an error for the caller
  }
};

const usersAPI = {
  fetchUsers: async () => {
    const response = await axios.get(BASE_URL);
    return response.data;
  },

  addUser: async (user: User) => {
    const response = await axios.post(BASE_URL, user);
    return response.data;
  },

  updateUser: async (id: number, user: User) => {
    const response = await axios.put(`${BASE_URL}/${id}`, user);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};

export default usersAPI;
