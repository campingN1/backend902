const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["https://somos902.github.io"],
  methods: ["GET", "POST"],
  credentials: false
}));

app.use(express.json({ limit: "10mb" }));

const db = new sqlite3.Database("./database.db");

/* 🔥 CREAR TABLA SI NO EXISTE */
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email TEXT UNIQUE,
  password TEXT
)
`);

/* 🔥 AGREGAR COLUMNA FOTO SI NO EXISTE */
db.all("PRAGMA table_info(users);", (err, columns) => {
  if (err) return console.log(err);

  const hasFoto = columns.some(col => col.name === "foto");

  if (!hasFoto) {
    db.run("ALTER TABLE users ADD COLUMN foto TEXT", err => {
      if (err) {
        console.log("Columna foto ya existe o error:", err.message);
      } else {
        console.log("Columna foto agregada correctamente");
      }
    });
  }
});

/* 🔥 SIGNUP */
app.post("/signup", (req, res) => {
  const { username, email, password, foto } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  db.run(
    "INSERT INTO users (username, email, password, foto) VALUES (?, ?, ?, ?)",
    [username, email, password, foto || null],
    function (err) {
      if (err) {
        return res.status(400).json({ message: "Correo ya registrado" });
      }

      res.json({ message: "Cuenta creada correctamente" });
    }
  );
});

/* 🔥 LOGIN */
app.post("/login", (req, res) => {
  const { login, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?",
    [login, login, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Error del servidor" });
      }

      if (!row) {
        return res.status(401).json({ message: "Cuenta no encontrada" });
      }

      res.json({
        message: "Login exitoso",
        user: {
          id: row.id,
          username: row.username,
          email: row.email,
          foto: row.foto
        }
      });
    }
  );
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.listen(PORT, () => {
  console.log("Servidor activo en puerto " + PORT);
});