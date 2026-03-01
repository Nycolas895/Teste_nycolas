const sql = require("mssql");
 const { getPool } = require("../db/sql");

async function list(req, res) {
  try {
    const pool = await getPool();
     const result = await pool.request().query("SELECT * FROM dbo.Clients");
    res.json(result.recordset) ;
  } catch (err) {
     console.error("Clients list error:", err);
    res.status(500).json({ ok: false });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool
       .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM dbo.Clients  WHERE Id=@id");

     if (result.recordset.length === 0) {
      return res.status(404).json({ ok: false });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Clients get error:", err);
     res.status(500).json({ ok: false });
  }
}

async function create(req, res) {
  try {
    const { Name, TradeName, Document, Address } = req.body;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("Name", sql.VarChar(60), Name)
       .input("TradeName", sql.VarChar(100), TradeName)
      .input("Document", sql.VarChar(20), Document)
      .input("Address", sql.VarChar(200), Address)
      .query(`
        INSERT INTO dbo.Clients (Name, TradeName, Document, Address)
        OUTPUT INSERTED.Id
        VALUES (@Name, @TradeName, @Document, @Address)
      `);

    res.status(201).json ({ ok: true, id: result.recordset[0].Id });
  } catch (err) {
    console.error("Clients  create error:", err);
     res.status(500).json({ ok: false });
  }
}

async  function update(req, res) {
  try {
    const { id } = req.params;
    const { Name, TradeName, Document, Address } = req.body;

    const pool = await getPool();

    await pool
      .request()
      .input("id", sql.Int, id)
        .input("Name", sql.VarChar(60), Name)
      .input("TradeName", sql.VarChar(100), TradeName)
      .input("Document", sql.VarChar(20), Document)
      .input("Address", sql.VarChar(200), Address)
      .query(`
        UPDATE dbo.Clients
        SET Name=@Name,
            TradeName=@TradeName,
            Document=@Document,
            Address=@Address
        WHERE Id=@id
      `);

    res.json({ ok: true });
  } catch (err) {
    console.error("Clients update error:", err);
    res.status(500).json({ ok: false });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM dbo.Clients WHERE Id=@id");

    res.json({ ok: true });
  } catch (err) {
    console.error("Clients delete error:", err);
    res.status(500).json({ ok: false });
  }
}

module.exports = { list, getById, create, update, remove };