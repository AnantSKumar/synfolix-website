const express = require("express");

const app = express();

app.use(express.json());

const industriesRouter = require("./routes/industries");
app.use("/api/industries", industriesRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
