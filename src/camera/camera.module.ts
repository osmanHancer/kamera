import { Module } from '@nestjs/common';
import { CameraController } from './camera.controller';
import { CameraService } from './camera.service';
import { CameraGateway } from './camera.gateway';

@Module({
  controllers: [CameraController],
  providers: [CameraService, CameraGateway],
  exports: [CameraService, CameraGateway],
})
export class CameraModule {}

