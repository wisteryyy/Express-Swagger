import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express Drizzle API',
      version: '2.0.0',
      description: 'Express API с Drizzle ORM, Users, enum-типами и Bearer авторизацией',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите токен в формате: Bearer <token>',
        },
      },

      schemas: {
        // Пользователь
        User: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            name:      { type: 'string',  example: 'Иван Иванов' },
            email:     { type: 'string',  example: 'ivan@example.com' },
            role:      { type: 'string',  enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string',  example: '2024-01-01T00:00:00.000Z' },
          },
        },

        // Тело запроса — регистрация
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', example: 'Иван Иванов' },
            email:    { type: 'string', example: 'ivan@example.com' },
            password: { type: 'string', example: 'password123' },
            role:     { type: 'string', enum: ['user', 'admin'], example: 'user' },
          },
        },

        // Тело запроса — логин
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'ivan@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },

        // Успешный ответ с токеном
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            token:   { type: 'string',  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user:    { $ref: '#/components/schemas/User' },
          },
        },

        // Ответ с ошибкой
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string',  example: 'Invalid email or password' },
          },
        },
      },
    },

    // Применить Bearer глобально ко всем роутам
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export default swaggerJsdoc(options);