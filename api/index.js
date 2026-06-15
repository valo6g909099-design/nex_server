require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("../routes/users/users");
const productRoutes = require("../routes/products");
const errorHandler = require("../middleware/errorHandler");
const cryptoRoutes = require("../routes/crypto/crypto");
const app = express();
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/crypto", cryptoRoutes);
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});
app.use(errorHandler);
module.exports = app;
