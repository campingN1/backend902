const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* 🔥 CORS CONFIGURADO */
app.use(cors({
  origin: [
    "https://somos902.github.io"
  ],
  methods: ["GET", "POST"],
  credentials: false
}));

app.use(express.json());

/* 🔥 BASE DE DATOS */
const db = new sqlite3.Database("./database.db");

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email TEXT UNIQUE,
  password TEXT
)
`);

/* 🔥 SIGNUP */
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
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
          email: row.email
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