require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("../routes/users/users");
const productRoutes = require("../routes/products");
const errorHandler = require("../middleware/errorHandler");
const cryptoRoutes = require("../routes/crypto/crypto");

const app = express();

const allowedOrigins = [
  "https://nex-client-kappa.vercel.app",
  
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "NeedKey",
      "Cache-Control",
      "Pragma",
    ],
  }),
);


app.options("*", cors());

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
