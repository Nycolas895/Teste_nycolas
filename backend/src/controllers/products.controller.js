const sql = require("mssql");
const { getPool } = require("../db/sql");

async   function list(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`
        SELECT Id, Description, Barcode, SaleValue,  GrossWeight, NetWeight
         FROM Products
        ORDER BY Id DESC
      `);

    return res.json({ ok: true, data: result.recordset });
  } catch (err) {
    console.error("Products list error:", err);
    return res.status(500).json( { ok: false, message: "Erro ao listar produtos" } ) ;
  }
}

async function getById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
     if (Number.isNaN(id) ) {
      return res.status(400).json({ ok: false, message: "Id inválido" } );
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT TOP 1 Id, Description, Barcode, SaleValue, GrossWeight, NetWeight
        FROM Products
        WHERE Id = @id
       `);

    if (!result.recordset.length) {
      return res.status( 404).json({ ok: false, message: "Produto não encontrado" });
    }

    return res.json({ ok: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Products getById error:", err);
    return res.status(500).json({ ok: false, message: "Erro ao buscar produto" });
  }
}

async function create(req, res) {
  try {
    const { Description, Barcode, SaleValue, GrossWeight, NetWeight } = req.body;
 
    if (!Description || typeof Description !== "string" || Description.length > 60) {
      return  res.status(400).json({ ok: false, message: "Description inválida (máx 60)" });
    }
    if (!Barcode || typeof Barcode !== "string" || Barcode.length > 14) {
      return  res.status(400).json( { ok: false, message: "Barcode inválido (máx 14)" });
    }

    const sale = Number (SaleValue);
    const gross = Number(GrossWeight);
    const net = Number(NetWeight);

     if ([sale, gross, net].some((n) => Number.isNaN(n))) {
      return res.status(400).json({ ok: false, message: "Valores numéricos inválidos" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("Description", sql.VarChar(60), Description)
      .input("Barcode", sql.VarChar(14), Barcode)
      .input("SaleValue", sql.Decimal(10, 2), sale)
      .input("GrossWeight", sql.Decimal(10, 3), gross)
      .input("NetWeight", sql.Decimal(10, 3), net)
      .query(`
        INSERT INTO Products (Description, Barcode, SaleValue, GrossWeight, NetWeight)
        OUTPUT INSERTED.Id
         VALUES (@Description, @Barcode, @SaleValue, @GrossWeight, @NetWeight)
      `);

    const newId = result.recordset[0].Id;
    return res.status(201).json({ ok: true, id: newId });
  } catch (err) {
    console.error("Products create error:", err);
    return res.status(500).json({ ok: false, message: "Erro ao criar produto" });
  }
}

async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: "Id inválido" });
    }

    const { Description, Barcode, SaleValue, GrossWeight, NetWeight } = req.body;

  if (!Description || typeof Description !== "string" || Description.length > 60) {
      return res.status(400).json({ ok: false, message: "Description inválida (máx 60)" });
    }
    if (!Barcode || typeof Barcode !== "string" || Barcode.length > 14) {
      return res.status(400).json({ ok: false, message: "Barcode inválido (máx 14)" });
    }

    const sale = Number(SaleValue);
    const gross = Number(GrossWeight);
    const net = Number(NetWeight);

     if ([sale, gross, net].some((n) => Number.isNaN(n))) {
      return res.status(400).json({ ok: false, message: "Valores numéricos inválidos" });
    }

    const pool = await getPool();

    const exists = await pool
      .request()
      .input("id", sql.Int, id)
       .query("SELECT TOP 1 Id FROM Products WHERE Id=@id");

    if (!exists.recordset.length) {
      return res.status(404).json({ ok: false, message:  "Produto não encontrado" });
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("Description", sql.VarChar(60),  Description)
      .input("Barcode", sql.VarChar(14), Barcode)
      .input("SaleValue", sql.Decimal(10, 2), sale)
       .input("GrossWeight", sql.Decimal(10, 3), gross)
      .input("NetWeight", sql.Decimal(10, 3), net)
      .query(`
        UPDATE Products
      SET Description=@Description,
              Barcode=@Barcode,
            SaleValue=@SaleValue,
            GrossWeight=@GrossWeight,
            NetWeight=@NetWeight
        WHERE Id=@id
      `);

    return res.json({ ok: true });
  } catch (err) {
    console.error("Products update error:", err);
    return res.status(500).json({ ok: false, message: "Erro ao atualizar produto" });
  }
}

 async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: "Id inválido" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Products WHERE Id=@id");

    const affected = result.rowsAffected?.[0] || 0;
    if (affected === 0) {
      return res.status(404).json({ ok: false, message: "Produto não encontrado" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Products delete error:", err);
    return res.status(500).json({ ok: false, message: "Erro ao deletar produto" });
  }
}

module.exports = { list, getById, create, update, remove };