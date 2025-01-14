import axios from "axios";

interface User {
  id?: number;
  name: string;
  email: string;
  // Add other fields as necessary
}

const BASE_URL = "http://localhost:5000/api/users";

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
