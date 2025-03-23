import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🔧 NestJS bootstrapping started...');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 8080;
  const host = '0.0.0.0';

  console.log(`📡 Attempting to listen on ${host}:${port}`);
  await app.listen(port, host);
  console.log(`✅ NestJS is running (env PORT: ${process.env.PORT})`);
}
void bootstrap();
