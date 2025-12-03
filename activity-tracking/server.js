const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config.json');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5300;
const uri = process.env.MONGODB_URI;
const mongoUri = config.mongoUri;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MLA Fitness App - Activity Tracking API',
      version: '1.0.0',
      description: 'API documentation for Activity Tracking Service',
      contact: {
        name: 'MLA Application Group 6'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(mongoUri, { useNewUrlParser: true })
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch((error) => console.error("MongoDB connection error:", error));

const connection = mongoose.connection;

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