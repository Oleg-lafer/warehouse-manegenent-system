import React, { useState } from "react";

interface BarcodeScannerProps {
  onScan: (itemId: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const [barcode, setBarcode] = useState<string>("");

  const handleScan = () => {
    // המרת ברקוד לדסימלי
    const decimalBarcode = parseInt(barcode, 2).toString();
    fetch(`http://localhost:5000/api/items/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcode: decimalBarcode }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Item not available.");
        return response.json();
      })
      .then((data) => {
        onScan(data.item_id); // שליחה לקומפוננטה האב
      })
      .catch((error) => console.error("Error scanning barcode:", error));
  };

  return (
    <div>
      <h2>Scan Item</h2>
      <input
        type="text"
        placeholder="Scan barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
      <button onClick={handleScan}>Scan</button>
    </div>
  );
};

export default BarcodeScanner;
