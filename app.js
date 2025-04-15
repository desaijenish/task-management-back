const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");


const auth = require("./routes/authRoutes");
const boards = require("./routes/boardRoutes");
const lists = require("./routes/listRoutes");
const cards = require("./routes/cardRoutes");

connectDB();

const app = express();


app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);


app.use(cors());


app.use("/api/v1/auth", auth);
app.use("/api/v1/boards", boards);
app.use("/api/v1/lists", lists);
app.use("/api/v1/cards", cards);


app.use(errorHandler);

module.exports = app;
