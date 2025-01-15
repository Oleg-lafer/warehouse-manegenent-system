import React from "react";

interface ConfirmationProps {
  user: string;
  item: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({ user, item, onConfirm, onCancel }) => {
  return (
    <div>
      <h2>Confirm Action</h2>
      <p>User: {user}</p>
      <p>Item: {item}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default Confirmation;
