# 📹 Hikvision Kamera - NestJS Entegrasyonu

Bu proje, Hikvision IP kamerasından alınan görüntüyü NestJS üzerinden web'de gösterir.

## 🏗️ Mimari

```
┌─────────────┐     RTSP      ┌─────────────┐     HTTP      ┌──────────┐
│  Hikvision  │ ────────────> │   Python    │ ───────────> │  NestJS  │
│   Kamera    │   Video+Ses   │   Service   │   Proxy      │  Server  │
└─────────────┘               └─────────────┘              └──────────┘
                                                                  │
                                                                  │ HTTP
                                                                  ▼
                                                            ┌──────────┐
                                                            │ Browser  │
                                                            │ /kamera  │
                                                            └──────────┘
```

## 📦 Kurulum

### 1. Python Servisini Başlatın

```bash
cd C:\Users\ohanc\OneDrive\Masaüstü\KameraServices
python app.py
```

Python servisi `http://localhost:5000` adresinde çalışacak.

### 2. NestJS Servisini Başlatın

```bash
cd kamera
npm run start:dev
```

NestJS servisi `http://localhost:3000` adresinde çalışacak.

## 🌐 Kullanım

Tarayıcınızda açın:

```
http://localhost:3000/kamera
```

## 🎯 Endpoints

### `GET /kamera`
Kamera görüntüleme sayfası (HTML)

### `GET /kamera/stream`
Canlı video stream (Python servisinden proxy)

### `GET /kamera/snapshot`
Anlık fotoğraf (JPEG)

### `GET /kamera/status`
Python servisi ve kamera durumu (JSON)

## 🔧 Nasıl Çalışıyor?

1. **Python Service (app.py):**
   - Hikvision kameradan RTSP ile görüntü alır
   - HTTP stream olarak sunar (port 5000)

2. **NestJS Service:**
   - Python servisine HTTP istekleri yapar
   - Video stream'ini tarayıcıya aktarır (proxy)
   - Modern web arayüzü sunar

3. **Browser:**
   - NestJS'den video stream'ini görüntüler
   - Real-time kamera izleme

## 📁 Proje Yapısı

```
kamera/
├── src/
│   ├── camera/
│   │   ├── camera.controller.ts  # /kamera endpoints
│   │   ├── camera.service.ts     # Python proxy logic
│   │   └── camera.module.ts      # Camera modülü
│   ├── app.module.ts             # Ana modül
│   └── main.ts                   # Bootstrap
├── package.json
└── README_KAMERA.md
```

## ⚙️ Yapılandırma

`camera.service.ts` dosyasında Python servis URL'ini değiştirebilirsiniz:

```typescript
private readonly PYTHON_SERVICE_URL = 'http://localhost:5000';
```

## 🐛 Sorun Giderme

### "Python servisi çalışmıyor" hatası:

1. Python servisini başlatın:
   ```bash
   cd C:\Users\ohanc\OneDrive\Masaüstü\KameraServices
   python app.py
   ```

2. Python servisinin çalıştığını kontrol edin:
   ```bash
   curl http://localhost:5000/status
   ```

### Video görüntülenmiyor:

1. Kamera bağlantısını kontrol edin (192.168.1.64)
2. Python servisinin loglarını kontrol edin
3. Tarayıcı console'u kontrol edin (F12)

## ✨ Özellikler

- ✅ Canlı video akışı
- ✅ Anlık fotoğraf çekme
- ✅ Otomatik durum kontrolü
- ✅ Modern responsive UI
- ✅ Python servisi health check
- ✅ Error handling
- ✅ Stream yenileme

## 🚀 Production

Production için:

1. Python servisini arka planda çalıştırın
2. NestJS'i build edin:
   ```bash
   npm run build
   npm run start:prod
   ```

3. Nginx ile reverse proxy yapın (opsiyonel)

## 📝 Notlar

- Python servisi **mutlaka** çalışıyor olmalı
- Kamera IP: 192.168.1.64
- Python port: 5000
- NestJS port: 3000

