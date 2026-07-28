import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global Prefix ──────────────────────────────
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // ── CORS ───────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  });

  // ── Global Validation Pipe ─────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── WebSocket Adapter ──────────────────────────
  app.useWebSocketAdapter(new IoAdapter(app));

  // ── Swagger Docs (Development only) ───────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Project LMS API')
      .setDescription('School & Coaching Management System API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('teachers', 'Teacher management')
      .addTag('students', 'Student management')
      .addTag('classes', 'Class & Section management')
      .addTag('routines', 'Routine management')
      .addTag('exams', 'Exam management')
      .addTag('results', 'Result & Merit list')
      .addTag('attendance', 'Attendance tracking')
      .addTag('payments', 'Payment management')
      .addTag('notices', 'Notice board')
      .addTag('messages', 'In-app messaging')
      .addTag('reports', 'PDF & Excel reports')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log(
      `📄 Swagger docs: http://localhost:${process.env.PORT || 3001}/docs`,
    );
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
  ╔══════════════════════════════════════╗
  ║       🏫 Project LMS API             ║
  ║   Running on: http://localhost:${port}  ║
  ║   ENV: ${process.env.NODE_ENV || 'development'}              ║
  ╚══════════════════════════════════════╝
  `);
}

bootstrap();
