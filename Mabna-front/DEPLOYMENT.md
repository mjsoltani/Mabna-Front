# دستورات دیپلوی پروژه Mabna

## 📋 پیش‌نیازها

- Docker نصب شده باشد
- Docker Compose نصب شده باشد
- دسترسی SSH به سرور

## 🚀 مراحل دیپلوی

### 1️⃣ روی سرور (193.141.64.139)

```bash
# وارد سرور شو
ssh root@193.141.64.139

# پروژه رو clone کن
cd /root
git clone https://github.com/mjsoltani/Mabna-Front.git
cd Mabna-Front

# اگر قبلاً clone شده بود، آپدیت کن
git pull origin main

# Docker image رو build کن
docker build -t mabna-front:latest -f frontend/Dockerfile ./frontend

# Container رو اجرا کن
docker run -d \
  --name mabna-front \
  -p 80:80 \
  -e VITE_API_URL=http://193.141.64.139:3000 \
  --restart unless-stopped \
  mabna-front:latest
```

### 2️⃣ یا با Docker Compose

```bash
cd /root/Mabna-Front/frontend

# Build و run کن
docker-compose up -d

# Logs رو ببین
docker-compose logs -f
```

## 🔍 بررسی وضعیت

```bash
# Container اجرا شده یا نه
docker ps | grep mabna-front

# Logs رو ببین
docker logs mabna-front

# Container رو متوقف کن
docker stop mabna-front

# Container رو شروع کن
docker start mabna-front

# Container رو حذف کن
docker rm mabna-front
```

## 🔄 آپدیت کردن

```bash
# پروژه رو آپدیت کن
cd /root/Mabna-Front
git pull origin main

# Image رو دوباره build کن
docker build -t mabna-front:latest -f frontend/Dockerfile ./frontend

# Container قدیم رو حذف کن
docker stop mabna-front
docker rm mabna-front

# Container جدید رو اجرا کن
docker run -d \
  --name mabna-front \
  -p 80:80 \
  -e VITE_API_URL=http://193.141.64.139:3000 \
  --restart unless-stopped \
  mabna-front:latest
```

## 📝 متغیرهای محیطی

- `VITE_API_URL`: آدرس API backend (پیش‌فرض: http://193.141.64.139:3000)

## 🌐 دسترسی

بعد از دیپلوی، پروژه در آدرس زیر در دسترس است:

```
http://193.141.64.139
```

## 🐛 حل مشکلات

### Container شروع نمی‌شود

```bash
# Logs رو بررسی کن
docker logs mabna-front

# اگر port 80 اشغال بود
docker ps -a
docker stop <container_id>
docker rm <container_id>
```

### API اتصال برقرار نمی‌کند

- بررسی کن که backend روی `http://193.141.64.139:3000` اجرا شده باشد
- Firewall رو بررسی کن
- CORS settings رو بررسی کن

### Build ناموفق

```bash
# Cache رو پاک کن
docker build --no-cache -t mabna-front:latest -f frontend/Dockerfile ./frontend
```

## 📊 نظارت

```bash
# CPU و Memory استفاده
docker stats mabna-front

# Container details
docker inspect mabna-front
```

---

**نکات مهم:**
- Backend باید روی پورت 3000 اجرا شده باشد
- Frontend روی پورت 80 اجرا می‌شود
- تمام درخواست‌های API به `http://193.141.64.139:3000` ارسال می‌شوند
