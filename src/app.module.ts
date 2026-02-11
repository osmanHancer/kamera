import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CameraModule } from './camera/camera.module';

@Module({
  imports: [CameraModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
