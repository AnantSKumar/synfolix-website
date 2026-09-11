require("dotenv").config(); // Load env vars early, before creating app
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = [process.env.FRONTEND_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
  })
);
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

const adminLeadsRouter = require("./routes/admin/leads");
app.use("/api/admin/leads", adminLeadsRouter);

const requireAuth = require("./middleware/requireAuth");

app.get("/api/admin/whoami", requireAuth, (req, res) => {
  res.json({ id: req.admin.id, email: req.admin.email });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);  // Centralized error handler for all errors

module.exports = app;
