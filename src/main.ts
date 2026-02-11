import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS ayarları (WebSocket için gerekli)
  app.enableCors({
    origin: '*', // Tüm originlere izin ver (production'da daha spesifik olmalı)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  
  console.log('');
  console.log('================================================');
  console.log('🚀 Kamera Servisi Başlatıldı!');
  console.log('================================================');
  console.log(`🌐 HTTP Server: http://localhost:${port}`);
  console.log(`📹 Kamera Sayfası: http://localhost:${port}/kamera`);
  console.log(`🔌 WebSocket: ws://localhost:${port}/camera`);
  console.log('================================================');
  console.log('');
}
bootstrap();
