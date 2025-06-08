#!/usr/bin/env node

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dubai Listings API',
      version: '1.0.0',
      description: 'API documentation for Dubai Listings real estate platform',
      contact: {
        name: 'API Support',
        email: 'support@dubailistings.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.dubailistings.com/v1',
        description: 'Production server',
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
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions
  apis: [
    path.join(__dirname, '../src/routes/*.js'),
    path.join(__dirname, '../src/models/*.js'),
  ],
};

// Initialize swagger-jsdoc
const specs = swaggerJsdoc(options);

// Write the specs to a file
const outputFile = path.join(__dirname, '../docs/swagger.json');
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(specs, null, 2));

console.log(`Swagger documentation generated at ${outputFile}`);

export default specs;
