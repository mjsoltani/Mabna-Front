# 🚀 راهنمای دیپلوی روی سرور

## ✅ کارهای انجام شده (سمت ما)

### 1. **تنظیم API URLs**
- ✅ فایل `config.js` ایجاد شد برای مدیریت متمرکز API URLs
- ✅ تمام فایل‌های JSX آپدیت شدند تا از `API_BASE_URL` استفاده کنند
- ✅ Environment variables تنظیم شدند:
  - `.env.example` - برای development
  - `.env.production` - برای production (API: http://193.141.64.139:3000)

### 2. **Docker Configuration**
- ✅ `Dockerfile` ایجاد شد (multi-stage build)
- ✅ `.dockerignore` ایجاد شد
- ✅ `docker-compose.yml` ایجاد شد

### 3. **Git Push**
- ✅ تمام فایل‌ها به GitHub push شدند
- ✅ Repository: https://github.com/mjsoltani/Mabna-Front.git
- ✅ Branch: main

---

## 📋 کارهایی که تو باید روی سرور انجام بدی

### مرحله 1️⃣: اتصال به سرور

```bash
ssh root@193.141.64.139
```

### مرحله 2️⃣: Clone کردن پروژه

```bash
cd /root
git clone https://github.com/mjsoltani/Mabna-Front.git
cd Mabna-Front
```

### مرحله 3️⃣: Build کردن Docker Image

```bash
docker build -t mabna-front:latest -f frontend/Dockerfile ./frontend
```

**نکته:** این دستور:
- تمام dependencies رو نصب می‌کند
- پروژه رو build می‌کند
- فایل‌های static رو آماده می‌کند

### مرحله 4️⃣: اجرای Container

```bash
docker run -d \
  --name mabna-front \
  -p 80:80 \
  -e VITE_API_URL=http://193.141.64.139:3000 \
  --restart unless-stopped \
  mabna-front:latest
```

**توضیح:**
- `-d`: در background اجرا شود
- `--name mabna-front`: نام container
- `-p 80:80`: port 80 رو expose کن
- `-e VITE_API_URL=...`: API URL رو تنظیم کن
- `--restart unless-stopped`: اگر سرور restart شد، container خودکار شروع شود

### مرحله 5️⃣: بررسی وضعیت

```bash
# ببین container اجرا شده یا نه
docker ps | grep mabna-front

# اگر مشکل بود، logs رو ببین
docker logs mabna-front

# اگر نیاز بود، container رو متوقف کن
docker stop mabna-front

# یا حذف کن
docker rm mabna-front
```

---

## 🌐 دسترسی

بعد از اجرا، پروژه در آدرس زیر در دسترس است:

```
http://193.141.64.139
```

---

## 🔄 آپدیت کردن (بعداً)

اگر بعداً تغییرات جدید اضافه شد:

```bash
# وارد پوشه پروژه شو
cd /root/Mabna-Front

# آپدیت کن
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

---

## ⚠️ نکات مهم

1. **Backend باید اجرا شده باشد**
   - Backend روی پورت 3000 اجرا شود
   - آدرس: http://193.141.64.139:3000

2. **CORS Configuration**
   - Backend باید CORS رو برای frontend فعال کند
   - Origin: http://193.141.64.139

3. **Firewall**
   - پورت 80 باید باز باشد
   - پورت 3000 باید برای backend باز باشد

4. **SSL/HTTPS** (اختیاری)
   - اگر می‌خوای HTTPS استفاده کنی، Nginx reverse proxy رو تنظیم کن

---

## 🐛 حل مشکلات

### مشکل: "Port 80 already in use"

```bash
# ببین کدام process از port 80 استفاده می‌کند
lsof -i :80

# یا container دیگری اجرا شده
docker ps -a

# حذف کن
docker stop <container_id>
docker rm <container_id>
```

### مشکل: "Cannot connect to API"

```bash
# بررسی کن backend اجرا شده یا نه
curl http://193.141.64.139:3000/api/health

# اگر جواب نداد، backend رو شروع کن
```

### مشکل: "Build failed"

```bash
# Cache رو پاک کن
docker build --no-cache -t mabna-front:latest -f frontend/Dockerfile ./frontend
```

---

## 📞 پشتیبانی

اگر مشکلی پیش آمد:
1. Logs رو بررسی کن: `docker logs mabna-front`
2. Container رو restart کن: `docker restart mabna-front`
3. اگر مشکل حل نشد، container رو حذف کن و دوباره اجرا کن

---

**تاریخ:** 13 دسامبر 2025
**وضعیت:** ✅ آماده برای دیپلوی
