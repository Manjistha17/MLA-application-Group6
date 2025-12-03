const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config.json');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5300;
const uri = process.env.MONGODB_URI;
const mongoUri = config.mongoUri;

// Middleware setup
app.use(cors());
app.use(express.json());

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Activity Tracking Service API',
      version: '1.0.0',
      description: 'API documentation for the Activity Tracking Service. This service handles exercise logging, tracking, and activity management.',
      contact: {
        name: 'MLA Fitness App Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:5300',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Exercises',
        description: 'Exercise management endpoints'
      },
      {
        name: 'Activities',
        description: 'Activity and MET data endpoints'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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