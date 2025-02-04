import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
const port = process.env.PORT || 5000;

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
          barcode TEXT NOT NULL,
          status TEXT DEFAULT 'available'
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
  const query = `
    SELECT items.*,
           CASE
             WHEN EXISTS (
               SELECT 1
               FROM actions
               WHERE actions.item_id = items.id
                 AND actions.action_type = 'borrow'
                 AND NOT EXISTS (
                   SELECT 1
                   FROM actions AS return_actions
                   WHERE return_actions.item_id = items.id
                     AND return_actions.action_type = 'return'
                     AND return_actions.timestamp > actions.timestamp
                 )
             ) THEN 'borrowed'
             ELSE 'available'
           END AS status
    FROM items
  `;

  db.all(query, [], (err, rows) => {
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
    return res.status(400).send("Missing required fields.");
  }

  const defaultStatus = "available"; // Default status

  db.run(
    "INSERT INTO items (type_name, type_code, serial_code, barcode, status) VALUES (?, ?, ?, ?, ?)",
    [type_name, type_code, serial_code, barcode, defaultStatus],
    function (err) {
      if (err) {
        console.error("Error adding item:", err.message);
        res.status(500).send("Internal server error");
      } else {
        res.status(201).json({
          id: this.lastID,
          type_name,
          type_code,
          serial_code,
          barcode,
          status: defaultStatus,
        });
      }
    }
  );
});

app.put("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    console.log(`🔍 SQL: UPDATE items SET status = '${status}' WHERE id = ${id}`);

    await db.run("UPDATE items SET status = ? WHERE id = ?", [status, id]);

    res.json({ message: `✅ Item ${id} updated to status ${status}` });
  } catch (error) {
    console.error("❌ Error updating item status:", error);
    res.status(500).json({ error: "Failed to update item status." });
  }
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
  const query = `
    SELECT 
      users.id, 
      users.name, 
      users.permission, 
      GROUP_CONCAT(items.type_name) AS borrowed_items
    FROM users
    LEFT JOIN actions ON users.id = actions.user_id AND actions.action_type = 'borrow'
    LEFT JOIN items ON actions.item_id = items.id
    GROUP BY users.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching users with borrowed items:", err.message);
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

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, permission, borrowedItems } = req.body;

  try {
    console.log(`📡 Updating user ${id}...`);

    // Ensure borrowedItems is a string (for SQLite) or JSON (for other DBs)
    const borrowedItemsValue = Array.isArray(borrowedItems) ? borrowedItems.join(",") : borrowedItems;

    await db.run(
      "UPDATE users SET name = ?, permission = ?, borrowedItems = ? WHERE id = ?",
      [name, permission, borrowedItemsValue, id]
    );

    console.log(`✅ User ${id} updated successfully.`);
    res.json({ message: `User ${id} updated successfully.` });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ error: "Failed to update user." });
  }
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
  const query = `
    SELECT actions.id, actions.action_type, actions.timestamp,
           users.name AS user_name,
           items.type_name AS item_name
    FROM actions
    JOIN users ON actions.user_id = users.id
    JOIN items ON actions.item_id = items.id
  `;

  db.all(query, [], (err, rows) => {
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
    return res.status(400).send("Missing required fields.");
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
        console.log(`✅ Action ${action_type} recorded for item ${item_id}`);
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

/* --------------------- Barcod Management --------------------- */

app.post("/api/items/scan", (req: Request, res: Response) => {
  const { barcode } = req.body;

  if (!barcode) {
    return res.status(400).json({ message: "Barcode is required." });
  }

  // בדיקה אם הפריט זמין
  db.get(
    "SELECT * FROM items WHERE barcode = ? AND status = 'available'",
    [barcode],
    (err, row) => {
      if (err) {
        console.error("Error scanning barcode:", err.message);
        return res.status(500).json({ message: "Internal server error." });
      }

      if (!row) {
        return res.status(404).json({ message: "Item not available or not found." });
      }

      // עדכון סטטוס הפריט ל"מושאל"
      db.run(
        "UPDATE items SET status = 'borrowed' WHERE barcode = ?",
        [barcode],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating item status:", updateErr.message);
            return res.status(500).json({ message: "Failed to update item status." });
          }

          res.status(200).json({ message: `Item with barcode ${barcode} borrowed successfully.` });
        }
      );
    }
  );
});


/* --------------------- Start the Server --------------------- */
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
