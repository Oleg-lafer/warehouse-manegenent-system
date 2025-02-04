import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Admin.css";
import usersAPI, { updateUser } from "../shared/api/usersAPI";
import User from "../shared/utils/Users";

const UsersApp: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>(new User(0, "", "", []));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await usersAPI.fetchUsers();
      setUsers(usersData);
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
      const addedUser = await usersAPI.addUser(newUser);
      setUsers([...users, addedUser]);
      setNewUser(new User(0, "", "", []));
      toast.success("User added successfully!");
    } catch {
      toast.error("Failed to add user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setIsLoading(true);
    try {
      await usersAPI.deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully!");
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
      console.log(`📡 Updating user ${userToUpdate.id}...`);
  
      const updatedUser = await updateUser(userToUpdate.id, newUser);
  
      // Update state
      const updatedUsers = [...users];
      updatedUsers[editIndex] = updatedUser;
      setUsers(updatedUsers);
  
      setEditIndex(null);
      setNewUser(new User(0, "", "", []));
      toast.success("User updated successfully!");
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
          onChange={(e) =>
            setNewUser(new User(newUser.id, e.target.value, newUser.permission, newUser.borrowedItems))
          }
          className="input"
        />
        <select
          value={newUser.permission}
          onChange={(e) =>
            setNewUser(new User(newUser.id, newUser.name, e.target.value, newUser.borrowedItems))
          }
          className="input"
        >
          <option value="">Select Permission</option>
          <option value="Admin">Admin</option>
          <option value="Developer">Developer</option>
          <option value="User">User</option>
        </select>
        {editIndex === null ? (
          <button onClick={handleAddUser} className="button">Add User</button>
        ) : (
          <button onClick={handleSaveUser} className="button">Save Changes</button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search Users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input"
        style={{ marginBottom: "10px" }}
      />

      <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Permission</th>
                  <th>Borrowed Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.permission}</td>
                    <td>
                      {Array.isArray(user.borrowedItems) && user.borrowedItems.length > 0 ? (
                        <ul>
                          {user.borrowedItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        "No borrowed items"
                      )}
                    </td>
                    <td>
                      <button onClick={() => setEditIndex(index)} className="button">Edit</button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="button delete-button"
                      >
                        ❌ Delete
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