import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Production'da specific domain kullan
  },
  namespace: 'camera',
})
export class CameraGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('CameraGateway');
  private latestFrame: string | null = null;
  private cameraConnected = false;
  private clientCount = 0;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientCount++;

    // Yeni client bağlandığında son frame'i gönder
    if (this.latestFrame) {
      client.emit('frame', this.latestFrame);
    }

    // Kamera durumunu gönder
    client.emit('camera_status', {
      connected: this.cameraConnected,
      clients: this.clientCount,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientCount--;
  }

  // Python client'tan frame al
  @SubscribeMessage('upload_frame')
  handleFrameUpload(client: Socket, frame: string) {
    this.latestFrame = frame;
    this.cameraConnected = true;

    // SADECE en son frame'i broadcast et (buffer temizliği)
    // Eski frame'leri atla - canlı akış için kritik!
    this.server.volatile.emit('frame', frame);

    return { success: true };
  }

  // Python client bağlantı durumu
  @SubscribeMessage('camera_connect')
  handleCameraConnect(client: Socket, data: any) {
    this.cameraConnected = true;
    this.logger.log('Camera client connected from: ' + data.location);

    this.server.emit('camera_status', {
      connected: true,
      clients: this.clientCount,
      location: data.location,
    });

    return { success: true };
  }

  @SubscribeMessage('camera_disconnect')
  handleCameraDisconnect() {
    this.cameraConnected = false;
    this.latestFrame = null;

    this.server.emit('camera_status', {
      connected: false,
      clients: this.clientCount,
    });
  }

  // Son frame'i al
  getLatestFrame(): string | null {
    return this.latestFrame;
  }

  // Kamera durumu
  getCameraStatus() {
    return {
      connected: this.cameraConnected,
      hasFrame: !!this.latestFrame,
      clients: this.clientCount,
    };
  }
}

