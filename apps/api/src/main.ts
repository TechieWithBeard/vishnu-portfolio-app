import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for Angular portfolio shell, React Admin UI, and local dev ports
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix, {
    exclude: ['mcp/sse', 'mcp/messages'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Vishnu Portfolio API is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Available Endpoints: http://localhost:${port}/${globalPrefix}/{profile, experience, projects, writing, demos, skills, health, seed}`
  );
}

bootstrap();
