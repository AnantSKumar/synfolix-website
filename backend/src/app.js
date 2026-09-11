const express = require("express");

const app = express();

app.use(express.json());

const industriesRouter = require("./routes/industries");
app.use("/api/industries", industriesRouter);

const productsRouter = require("./routes/products");
app.use("/api/products", productsRouter);

const leadsRouter = require("./routes/leads");
app.use("/api/leads", leadsRouter);

const adminAuthRouter = require("./routes/admin/auth");
app.use("/api/admin", adminAuthRouter);

const adminProductsRouter = require("./routes/admin/products");
app.use("/api/admin/products", adminProductsRouter);

const adminIndustriesRouter = require("./routes/admin/industries");
app.use("/api/admin/industries", adminIndustriesRouter);

const requireAuth = require("./middleware/requireAuth");

app.get("/api/admin/whoami", requireAuth, (req, res) => {
  res.json({ id: req.admin.id, email: req.admin.email });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
