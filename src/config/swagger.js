import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the options for swagger-jsdoc
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dubai Listings API',
      version: '1.0.0',
      description: 'API documentation for Dubai Listings application',
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Scan all route files
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../routes/**/*.js')],
};

// Initialize swagger-jsdoc
let specs;
try {
  specs = swaggerJsdoc(options);
  // eslint-disable-next-line no-console
  console.log('Swagger specs generated successfully');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Error generating Swagger specs:', error);
  throw error;
}

// Create a router for Swagger endpoints
const swaggerRouter = express.Router();

// Serve Swagger UI
swaggerRouter.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

// Serve Swagger JSON
swaggerRouter.get('/swagger.json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  } catch (error) {
    console.error('Error sending Swagger JSON:', error);
    res.status(500).json({ error: 'Failed to generate Swagger documentation' });
  }
});

/**
 * Setup Swagger UI and JSON endpoint
 * @param {import('express').Application} app - Express application
 */
export const setupSwagger = app => {
  // eslint-disable-next-line no-console
  console.log('Setting up Swagger middleware...');

  // Mount the Swagger router at /api-docs
  app.use('/api-docs', swaggerRouter);

  // eslint-disable-next-line no-console
  console.log(`📚 Swagger UI available at http://localhost:${process.env.PORT || 8000}/api-docs`);
  // eslint-disable-next-line no-console
  console.log(
    `📚 Swagger JSON available at http://localhost:${process.env.PORT || 8000}/api-docs/swagger.json`
  );
};

// Export specs for testing or other use cases
export const swaggerSpecs = specs;

// Default export for backward compatibility
const swaggerDocs = app => setupSwagger(app);

export default swaggerDocs;
