const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

server.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});