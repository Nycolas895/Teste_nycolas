require("dotenv").config();
const app = require("./app");

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`servidor rodando`);
});