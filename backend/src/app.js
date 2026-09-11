const express = require("express");

const app = express();

app.use(express.json());

const industriesRouter = require("./routes/industries");
app.use("/api/industries", industriesRouter);

const productsRouter = require("./routes/products");
app.use("/api/products", productsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
