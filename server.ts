import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database initialization
const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Error initializing database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Create tables
    db.serialize(() => {
      // Items table
      db.run(
        `CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type_name TEXT NOT NULL,
          type_code TEXT NOT NULL,
          serial_code TEXT NOT NULL,
          barcode TEXT NOT NULL
        )`,
        (err) => {
          if (err) {
            console.error("Error creating items table:", err.message);
          } else {
            console.log("Items table is ready!");
          }
        }
      );

      // Users table
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          permission TEXT NOT NULL,
          borrowedItems TEXT
        )`,
        (err) => {
          if (err) {
            console.error("Error creating users table:", err.message);
          } else {
            console.log("Users table is ready!");
          }
        }
      );

      // Actions table
      db.run(
        `CREATE TABLE IF NOT EXISTS actions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL,
          action_type TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(item_id) REFERENCES items(id)
        )`,
        (err) => {
          if (err) {
            console.error("Error creating actions table:", err.message);
          } else {
            console.log("Actions table is ready!");
          }
        }
      );
    });
  }
});

/* --------------------- Items Management --------------------- */

// Fetch all items
app.get("/api/items", (req: Request, res: Response) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) {
      console.error("Error fetching items:", err.message);
      res.status(500).send("Internal server error");
    } else {
      res.json(rows);
    }
  });
});

// Add a new item
app.post("/api/items", (req: Request, res: Response) => {
  const { type_name, type_code, serial_code, barcode } = req.body;

  if (!type_name || !type_code || !serial_code || !barcode) {
    return res.status(400).send("Missing required fields: type_name, type_code, serial_code, barcode");
  }

  db.run(
    "INSERT INTO items (type_name, type_code, serial_code, barcode) VALUES (?, ?, ?, ?)",
    [type_name, type_code, serial_code, barcode],
    function (err) {
      if (err) {
        console.error("Error adding item:", err.message);
        res.status(500).send("Internal server error");
      } else {
        res.status(201).json({ id: this.lastID, type_name, type_code, serial_code, barcode });
      }
    }
  );
});

// Delete an item by type_code
app.delete("/api/items/:type_code", (req: Request, res: Response) => {
  const { type_code } = req.params;

  db.run("DELETE FROM items WHERE type_code = ?", [type_code], function (err) {
    if (err) {
      console.error("Error deleting item:", err.message);
      res.status(500).send("Internal server error");
    } else if (this.changes === 0) {
      res.status(404).send("Item not found");
    } else {
      res.status(204).send();
    }
  });
});

/* --------------------- Users Management --------------------- */

// Fetch all users
app.get("/api/users", (req: Request, res: Response) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      res.status(500).send("Internal server error");
    } else {
      res.json(rows);
    }
  });
});

// Add a new user
app.post("/api/users", (req: Request, res: Response) => {
  const { name, permission, borrowedItems } = req.body;

  if (!name || !permission) {
    return res.status(400).send("Missing required fields: name, permission");
  }

  db.run(
    "INSERT INTO users (name, permission, borrowedItems) VALUES (?, ?, ?)",
    [name, permission, borrowedItems || "None"],
    function (err) {
      if (err) {
        console.error("Error adding user:", err.message);
        res.status(500).send("Internal server error.");
      } else {
        res.status(201).json({ id: this.lastID, name, permission, borrowedItems });
      }
    }
  );
});

// Delete a user by ID
app.delete("/api/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting user:", err.message);
      res.status(500).send("Internal server error.");
    } else if (this.changes === 0) {
      console.log(`No user found with ID: ${id}`);
      res.status(404).send("User not found");
    } else {
      console.log(`Deleted user with ID: ${id}`);
      res.status(204).send();
    }
  });
});

/* --------------------- Actions Management --------------------- */

// Fetch all actions
app.get("/api/actions", (req: Request, res: Response) => {
  db.all("SELECT * FROM actions", [], (err, rows) => {
    if (err) {
      console.error("Error fetching actions:", err.message);
      res.status(500).send("Internal server error");
    } else {
      res.json(rows);
    }
  });
});

// Add a new action
app.post("/api/actions", (req: Request, res: Response) => {
  const { user_id, item_id, action_type } = req.body;

  if (!user_id || !item_id || !action_type) {
    return res.status(400).send("Missing required fields: user_id, item_id, action_type");
  }

  const timestamp = new Date().toISOString();

  db.run(
    "INSERT INTO actions (user_id, item_id, action_type, timestamp) VALUES (?, ?, ?, ?)",
    [user_id, item_id, action_type, timestamp],
    function (err) {
      if (err) {
        console.error("Error adding action:", err.message);
        res.status(500).send("Internal server error");
      } else {
        res.status(201).json({ id: this.lastID, user_id, item_id, action_type, timestamp });
      }
    }
  );
});

// Delete an action by ID
app.delete("/api/actions/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  db.run("DELETE FROM actions WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting action:", err.message);
      res.status(500).send("Internal server error");
    } else if (this.changes === 0) {
      console.log(`No action found with ID: ${id}`);
      res.status(404).send("Action not found");
    } else {
      console.log(`Deleted action with ID: ${id}`);
      res.status(204).send();
    }
  });
});

/* --------------------- Start the Server --------------------- */
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
