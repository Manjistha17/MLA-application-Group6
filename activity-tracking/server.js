const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config.json');
const promClient = require('prom-client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5300;
// const uri = process.env.MONGODB_URI;
const mongoUri = config.mongoUri;

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestCount = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Middleware setup
app.use(cors());
app.use(express.json());

// Prometheus middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    httpRequestCount.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
  });
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// MongoDB connection
mongoose
  .connect(mongoUri, { useNewUrlParser: true })
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch((error) => console.error("MongoDB connection error:", error));

const connection = mongoose.connection;

const initActivityMets = require('./init_activity_mets');

// Initialize static activity METs
connection.once('open', async () => {
  console.log("MongoDB connected. Initializing activity METs...");
  await initActivityMets();  // safe insert
});


// Event listener for MongoDB connection errors
connection.on('error', (error) => {
  console.error("MongoDB connection error:", error);
});

// Routes
const exercisesRouter = require('./routes/exercises');
app.use('/exercises', exercisesRouter);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

module.exports = app;  