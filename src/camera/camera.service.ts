import { Injectable } from '@nestjs/common';

@Injectable()
export class CameraService {
  // WebSocket kullanıldığı için artık proxy'ye gerek yok
  // Tüm kamera işlemleri CameraGateway üzerinden yapılıyor
  
  constructor() {
    console.log('CameraService initialized - Using WebSocket mode');
  }
}

