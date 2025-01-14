import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Admin.css";

interface User {
  id?: number; // Added `id` to handle deletion and updates properly
  name: string;
  permission: string;
  borrowedItems: string;
}

const UsersApp: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({
    name: "",
    permission: "",
    borrowedItems: "none",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch users from the server
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.permission) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const addedUser = await response.json();
      setUsers([...users, addedUser]);
      setNewUser({ name: "", permission: "", borrowedItems: "none" });
      toast.success("User added successfully!");
    } catch {
      toast.error("Failed to add user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== id));
        toast.success("User deleted successfully!");
      } else {
        toast.error("Failed to delete user.");
      }
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (editIndex === null) return;

    const userToUpdate = users[editIndex];
    if (!userToUpdate?.id) {
      toast.error("User ID not found for update.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userToUpdate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const updatedUsers = [...users];
        updatedUsers[editIndex] = updatedUser;
        setUsers(updatedUsers);
        setEditIndex(null);
        setNewUser({ name: "", permission: "", borrowedItems: "none" });
        toast.success("User updated successfully!");
      } else {
        toast.error("Failed to update user.");
      }
    } catch {
      toast.error("Failed to update user.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <h1>Manage Users</h1>

      {isLoading && <div className="loading-spinner">Loading...</div>}

      <div className="form-container">
        <h2>{editIndex === null ? "Add New User" : "Edit User"}</h2>
        <input
          type="text"
          placeholder="User Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="input"
        />
        <select
          value={newUser.permission}
          onChange={(e) => setNewUser({ ...newUser, permission: e.target.value })}
          className="input"
        >
          <option value="">Permission</option>
          <option value="Admin">Admin</option>
          <option value="Developer">Developer</option>
          <option value="User">User</option>
        </select>
        {editIndex === null ? (
          <button onClick={handleAddUser} className="button">
            Add User
          </button>
        ) : (
          <button onClick={handleSaveUser} className="button">
            Save Changes
          </button>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Permission</th>
            <th>Borrowed Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.permission}</td>
              <td>{user.borrowedItems}</td>
              <td>
                <button onClick={() => setEditIndex(index)} className="button">
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id!)}
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

export default UsersApp;
