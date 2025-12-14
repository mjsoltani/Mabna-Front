# راهنمای آپدیت سرور - Sprint 4

## 🚀 مراحل آپدیت

### مرحله 1️⃣: وارد سرور شو

```bash
ssh root@193.141.64.139
```

### مرحله 2️⃣: وارد پوشه پروژه شو

```bash
cd /root/mabna-front
```

### مرحله 3️⃣: آپدیت کد از GitHub

```bash
git pull origin main
```

### مرحله 4️⃣: حذف Docker cache (اختیاری ولی توصیه شده)

```bash
docker system prune -a --force
```

### مرحله 5️⃣: Build Docker image جدید

```bash
docker build -t mabna-front:latest .
```

**نکته:** این مرحله ممکن است 2-3 دقیقه طول بکشد

### مرحله 6️⃣: حذف container قدیم

```bash
# متوقف کن
docker stop mabna-front

# حذف کن
docker rm mabna-front
```

### مرحله 7️⃣: اجرای container جدید

```bash
docker run -d \
  --name mabna-front \
  -p 3001:80 \
  -e VITE_API_URL=http://193.141.64.139:3000 \
  --restart unless-stopped \
  mabna-front:latest
```

### مرحله 8️⃣: بررسی وضعیت

```bash
# ببین container اجرا شده یا نه
docker ps | grep mabna-front

# اگر اجرا شده، logs رو ببین
docker logs mabna-front

# اگر مشکل بود
docker logs -f mabna-front
```

---

## ✅ بررسی نهایی

### 1. آیا container اجرا شده؟

```bash
docker ps | grep mabna-front
```

**باید این رو ببینی:**
```
CONTAINER ID   IMAGE                 COMMAND                  STATUS
abc123def456   mabna-front:latest    "serve -s dist -l 80"   Up 2 minutes
```

### 2. آیا Nginx کار می‌کند؟

```bash
curl http://localhost/
```

**باید HTML response بگیری**

### 3. آیا API اتصال برقرار می‌کند؟

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://193.141.64.139:3000/api/dashboard
```

---

## 🔧 اگر مشکل بود

### مشکل 1: Container شروع نمی‌شود

```bash
# Logs رو بررسی کن
docker logs mabna-front

# اگر port اشغال بود
lsof -i :3001

# اگر process دیگری استفاده می‌کند
kill -9 <PID>

# دوباره اجرا کن
docker run -d \
  --name mabna-front \
  -p 3001:80 \
  -e VITE_API_URL=http://193.141.64.139:3000 \
  --restart unless-stopped \
  mabna-front:latest
```

### مشکل 2: Build ناموفق

```bash
# Cache رو پاک کن
docker system prune -a --force

# دوباره build کن
docker build --no-cache -t mabna-front:latest .
```

### مشکل 3: Nginx 502 Bad Gateway

```bash
# Nginx restart کن
sudo systemctl restart nginx

# Nginx status رو ببین
sudo systemctl status nginx

# Nginx logs رو ببین
sudo tail -f /var/log/nginx/error.log
```

### مشکل 4: API اتصال برقرار نمی‌کند

```bash
# Backend اجرا شده یا نه؟
curl http://193.141.64.139:3000/api/health

# اگر جواب نداد، backend رو شروع کن
# (بستگی به نحوه اجرای backend دارد)
```

---

## 📊 دستورات مفید

### مشاهده تمام containers

```bash
docker ps -a
```

### مشاهده logs

```bash
# آخرین 50 خط
docker logs mabna-front

# Real-time logs
docker logs -f mabna-front

# آخرین 100 خط
docker logs --tail 100 mabna-front
```

### متوقف کردن container

```bash
docker stop mabna-front
```

### شروع مجدد container

```bash
docker start mabna-front
```

### حذف container

```bash
docker rm mabna-front
```

### حذف image

```bash
docker rmi mabna-front:latest
```

### بررسی استفاده از منابع

```bash
docker stats mabna-front
```

---

## 🔄 خودکار آپدیت (اختیاری)

اگر می‌خوای هر روز خودکار آپدیت شود:

```bash
# یک script بساز
cat > /root/update-mabna.sh << 'EOF'
#!/bin/bash
cd /root/mabna-front
git pull origin main
docker build -t mabna-front:latest .
docker stop mabna-front
docker rm mabna-front
docker run -d \
  --name mabna-front \
  -p 3001:80 \
  -e VITE_API_URL=http://193.141.64.139:3000 \
  --restart unless-stopped \
  mabna-front:latest
EOF

# اجازه اجرا بده
chmod +x /root/update-mabna.sh

# Cron job اضافه کن (هر روز ساعت 2 صبح)
crontab -e
# این خط رو اضافه کن:
# 0 2 * * * /root/update-mabna.sh >> /var/log/mabna-update.log 2>&1
```

---

## 📝 خلاصه دستورات

```bash
# کل آپدیت در یک دستور
cd /root/mabna-front && \
git pull origin main && \
docker system prune -a --force && \
docker build -t mabna-front:latest . && \
docker stop mabna-front && \
docker rm mabna-front && \
docker run -d \
  --name mabna-front \
  -p 3001:80 \
  -e VITE_API_URL=http://193.141.64.139:3000 \
  --restart unless-stopped \
  mabna-front:latest && \
docker logs mabna-front
```

---

## ✨ نکات مهم

1. **Nginx:** روی پورت 80 اجرا شده و درخواست‌ها رو به 3001 ارسال می‌کند
2. **Docker:** container روی پورت 3001 اجرا می‌شود
3. **API URL:** `http://193.141.64.139:3000`
4. **Restart Policy:** `unless-stopped` - اگر سرور restart شود، container خودکار شروع می‌شود
5. **Build Time:** معمولاً 2-3 دقیقه طول می‌کشد

---

## 🎯 بعد از آپدیت

1. ✅ بررسی کن که container اجرا شده
2. ✅ `http://193.141.64.139` رو در مرورگر باز کن
3. ✅ Login کن و تست کن
4. ✅ تمام فیچرهای جدید رو تست کن:
   - Logout
   - Task types
   - Task deletion
   - Objective edit/delete/report
   - File attachments
   - Comments
   - Notifications

---

**تاریخ:** 14 دسامبر 2025
**نسخه:** Sprint 4
