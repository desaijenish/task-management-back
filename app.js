const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route files
const auth = require('./routes/authRoutes');
const boards = require('./routes/boardRoutes');
const lists = require('./routes/listRoutes');
const cards = require('./routes/cardRoutes');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/boards', boards);
app.use('/api/v1/lists', lists);
app.use('/api/v1/cards', cards);

// Error handler middleware
app.use(errorHandler);

module.exports = app;