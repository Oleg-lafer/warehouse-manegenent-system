import React, { useState } from "react";
import ItemsApp from "./admin/ItemsApp";
import UsersApp from "./admin/UsersApp";
import ActionsApp from "./admin/ActionsApp";


function App() {
  const [activePage, setActivePage] = useState("Items"); // דף פעיל

  const renderPage = () => {
    switch (activePage) {
      case "Items":
        return <ItemsApp />;
      case "Users":
        return <UsersApp />;
      case "Actions":
        return <ActionsApp />;
      default:
        return <ItemsApp />;
    }
  };

  return (
    <div>
      <h1>Automated Warehouse System</h1>
      {/* תפריט ניווט */}
      <nav style={{ display: "flex", gap: "20px", padding: "10px", backgroundColor: "#f4f4f4" }}>
        <button className="button" onClick={() => setActivePage("Items")}>
          Items
        </button>
        <button className="button" onClick={() => setActivePage("Users")}>
          Users
        </button>
        <button className="button" onClick={() => setActivePage("Actions")}>
          Actions
        </button>
      </nav>

      {/* תוכן הדף */}
      <div>{renderPage()}</div>
    </div>
  );
}

export default App;
