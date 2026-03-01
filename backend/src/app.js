const express = require("express");
const cors =  require("cors");

const authRoutes = require("./routes/auth.routes");
const productsRoutes =  require("./routes/products.routes");
const  clientsRoutes = require("./routes/clients.routes");

const app = express();

app.use(cors());
app.use(express.json());

 app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use( "/products", productsRoutes);
app.use("/clients",  clientsRoutes) ;

module.exports = app;