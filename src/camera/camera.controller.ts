import { Controller, Get, Res } from '@nestjs/common';
import express from 'express';
import { CameraService } from './camera.service';
import { CameraGateway } from './camera.gateway';
import * as path from 'path';
import * as fs from 'fs';

@Controller('kamera')
export class CameraController {
  constructor(
    private readonly cameraService: CameraService,
    private readonly cameraGateway: CameraGateway,
  ) {}

  @Get()
  getCamera(@Res() res: express.Response) {
    // Static HTML dosyasını serve et
    const htmlPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'public',
      'camera.html',
    );

    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }

    // Fallback: Inline HTML
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hikvision Kamera Canlı İzleme</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 30px;
            max-width: 1200px;
            width: 100%;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #333;
            font-size: 32px;
            margin-bottom: 10px;
        }

        .header p {
            color: #666;
            font-size: 16px;
        }

        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 10px;
        }

        .status-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .status-dot.connected {
            background: #28a745;
        }

        .status-dot.disconnected {
            background: #dc3545;
            animation: none;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .video-container {
            position: relative;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .video-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            text-align: center;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .controls {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .btn {
            flex: 1;
            min-width: 150px;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-success {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }

        .btn-success:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
        }

        .btn:active {
            transform: translateY(0);
        }

        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin-top: 20px;
            border-radius: 5px;
        }

        .info-box h3 {
            color: #2196F3;
            margin-bottom: 10px;
        }

        .info-box ul {
            margin-left: 20px;
            color: #333;
        }

        .info-box li {
            margin: 5px 0;
        }

        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .btn {
                min-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📹 Hikvision Kamera Canlı İzleme</h1>
            <p>NestJS - Gerçek Zamanlı Görüntü Sistemi</p>
        </div>

        <div class="status-bar">
            <div class="status-item">
                <span class="status-dot" id="statusDot"></span>
                <span id="statusText">Bağlantı kontrol ediliyor...</span>
            </div>
            <div class="status-item">
                <strong>IP:</strong> <span>192.168.1.64</span>
            </div>
            <div class="status-item">
                <strong>Backend:</strong> <span>NestJS + Python</span>
            </div>
        </div>

        <div class="video-container">
            <img id="videoFeed" src="/kamera/stream" alt="Kamera Görüntüsü" style="display: none;">
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <div>Kamera bağlantısı kuruluyor...</div>
            </div>
        </div>

        <div class="controls">
            <button class="btn btn-primary" onclick="refreshStream()">🔄 Yenile</button>
            <button class="btn btn-success" onclick="takeSnapshot()">📸 Fotoğraf Çek</button>
        </div>

        <div class="info-box">
            <h3>ℹ️ Sistem Bilgisi</h3>
            <ul>
                <li><strong>Backend:</strong> NestJS (Node.js)</li>
                <li><strong>Stream Kaynağı:</strong> Python RTSP Service</li>
                <li><strong>Kamera:</strong> Hikvision IP Camera</li>
                <li><strong>Protokol:</strong> RTSP → HTTP Stream</li>
            </ul>
        </div>
    </div>

    <script>
        // WebSocket bağlantısı
        const socket = io('/camera', {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity
        });

        const videoFeed = document.getElementById('videoFeed');
        const loading = document.getElementById('loading');
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        // Sunucuya bağlandı
        socket.on('connect', () => {
            console.log('✓ WebSocket bağlandı');
            statusDot.className = 'status-dot connected';
            statusText.textContent = '✓ Sunucuya Bağlı';
        });

        // Sunucu bağlantısı kesildi
        socket.on('disconnect', () => {
            console.log('✗ WebSocket kesildi');
            statusDot.className = 'status-dot disconnected';
            statusText.textContent = '✗ Bağlantı Kesildi';
            loading.style.display = 'block';
            videoFeed.style.display = 'none';
        });

        // Frame geldi
        let pendingFrame = null;
        socket.on('frame', (frameData) => {
            // En son frame'i göster, eski frame'i atla
            pendingFrame = frameData;
        });

        // AnimationFrame ile en son frame'i render et
        function updateFrame() {
            if (pendingFrame) {
                videoFeed.src = 'data:image/jpeg;base64,' + pendingFrame;
                videoFeed.style.display = 'block';
                loading.style.display = 'none';
                pendingFrame = null;
            }
            requestAnimationFrame(updateFrame);
        }
        requestAnimationFrame(updateFrame);

        // Kamera durumu
        socket.on('camera_status', (status) => {
            console.log('Kamera durumu:', status);
            if (status.connected) {
                statusText.textContent = '✓ Bağlı ve Aktif';
            } else {
                statusText.textContent = '✗ Python Client Çalışmıyor';
                loading.style.display = 'block';
                videoFeed.style.display = 'none';
            }
        });

        // Fotoğraf çek
        function takeSnapshot() {
            const link = document.createElement('a');
            link.href = '/kamera/snapshot?' + new Date().getTime();
            link.download = 'snapshot_' + new Date().getTime() + '.jpg';
            link.click();
        }

        // Stream yenile
        function refreshStream() {
            location.reload();
        }
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('snapshot')
  async getSnapshot(@Res() res: express.Response) {
    // Son frame'i snapshot olarak al
    const frame = this.cameraGateway.getLatestFrame();

    if (frame) {
      const buffer = Buffer.from(frame, 'base64');
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', 'attachment; filename=snapshot.jpg');
      res.send(buffer);
    } else {
      res.status(503).send('No frame available. Python client is not running.');
    }
  }

  @Get('status')
  async getStatus() {
    // WebSocket üzerinden kamera durumunu al
    return this.cameraGateway.getCameraStatus();
  }

  @Get('latest-frame')
  async getLatestFrame(@Res() res: express.Response) {
    // Son frame'i al (WebSocket'ten)
    const frame = this.cameraGateway.getLatestFrame();

    if (frame) {
      const buffer = Buffer.from(frame, 'base64');
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(buffer);
    } else {
      res.status(503).send('No frame available');
    }
  }
}

