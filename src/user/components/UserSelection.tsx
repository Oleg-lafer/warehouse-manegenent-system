import React, { useEffect, useState } from "react";

interface UserSelectionProps {
  onSelect: (userId: string) => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({ onSelect }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h2>Select User</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <button onClick={() => onSelect(user.id)}>{user.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSelection;
