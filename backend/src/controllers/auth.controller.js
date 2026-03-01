const sql = require("mssql");
const jwt = require("jsonwebtoken");
const { getPool } = require("../db/sql");

async function login(req, res) {
  try {
    const { username, password } = req.body;

     if (!username || !password) {
      return res.status(400).json({
        ok: false,
        message: "Username e password são obrgatórios",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("username", sql.VarChar(50), username)
      .input("password", sql.VarChar(50), password)
      .query(
        "SELECT TOP 1 Id, Usernme  FROM Users WHERE Username=@username AND Password=@password"
      );

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({
        ok: false,
        message: "Usuário ou senha inválidos",
      });
    }

     const user = result.recordset[0];

     if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não definido no .env");
      return res.status(500).json({
        ok: false,
        message: "configuração do servidor  incompleta",
      });
    }

     const token = jwt.sign(
      { id: user.Id, username: user.Username },
      process.env.JWT_SECRET,
      { expiresIn: "2h"  }
    );

    return res.json({ ok: true, token });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({
      ok: false,
      message:   "Erro interno no login",
  });
  }
}

module.exports  = { login };