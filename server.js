const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors());

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Base de datos conectada correctamente");
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario TEXT UNIQUE,
  correo TEXT UNIQUE,
  password TEXT,
  foto TEXT
)
`);

// ==========================
// REGISTRO
// ==========================
app.post("/register", async (req, res) => {
  try {
    const { usuario, correo, password, foto } = req.body;

    if (!usuario || !correo || !password) {
      return res.status(400).json({ message: "Campos incompletos" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (usuario, correo, password, foto) VALUES (?, ?, ?, ?)",
      [usuario, correo, hash, foto || null],
      function (err) {
        if (err) {
          return res.status(400).json({
            message: "Usuario o correo ya existe"
          });
        }

        res.json({ message: "Cuenta creada correctamente" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
});

// ==========================
// LOGIN
// ==========================
app.post("/login", (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: "Campos incompletos" });
  }

  db.get(
    "SELECT * FROM users WHERE correo = ? OR usuario = ?",
    [login, login],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Error del servidor" });
      }

      if (!user) {
        return res.status(400).json({ message: "Esta cuenta no existe." });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ message: "Esta cuenta no existe." });
      }

      res.json({
        usuario: user.usuario,
        correo: user.correo,
        foto: user.foto
      });
    }
  );
});

// ==========================
// RUTA TEST
// ==========================
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente 🚀");
});

// ==========================
// SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});