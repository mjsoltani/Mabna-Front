# راهنمای Deploy فرانت برای تیم توسعه

## 🚀 Deploy روی سرور Production

### مرحله 1: Pull کردن آخرین تغییرات

```bash
cd /path/to/Mabna-Front
git pull origin main
```

### مرحله 2: Build کردن Docker Image

```bash
cd frontend
docker build -t mabna-front:latest .
```

### مرحله 3: Stop و Remove کردن Container قدیمی

```bash
# پیدا کردن container فعلی
docker ps | grep mabna-front

# متوقف کردن container قدیمی
docker stop mabna-front

# حذف container قدیمی
docker rm mabna-front
```

### مرحله 4: اجرای Container جدید

```bash
docker run -d \
  --name mabna-front \
  -p 3001:80 \
  --restart unless-stopped \
  mabna-front:latest
```

**توضیحات:**
- `-d`: اجرا در background
- `--name mabna-front`: نام container
- `-p 3001:80`: map کردن پورت 80 container به پورت 3001 host
- `--restart unless-stopped`: restart خودکار در صورت crash

### مرحله 5: بررسی وضعیت

```bash
# چک کردن container
docker ps | grep mabna-front

# دیدن logs
docker logs mabna-front

# دیدن logs به صورت real-time
docker logs -f mabna-front
```

---

## 🔧 حل مشکلات رایج

### خطا: Port Already in Use

اگر این خطا رو دیدید:
```
Error: address already in use
```

**راه حل:**

```bash
# پیدا کردن container که پورت رو استفاده می‌کنه
docker ps -a | grep 3001

# یا
lsof -i :3001

# حذف تمام containers روی این پورت
docker stop $(docker ps -q --filter "publish=3001")
docker rm $(docker ps -aq --filter "publish=3001")

# دوباره run کنید
docker run -d --name mabna-front -p 3001:80 mabna-front:latest
```

### خطا: Container Name Already Exists

```bash
# حذف container با همین اسم
docker rm -f mabna-front

# دوباره run کنید
docker run -d --name mabna-front -p 3001:80 mabna-front:latest
```

### خطا: Build Failed

```bash
# پاک کردن cache و دوباره build
docker build --no-cache -t mabna-front:latest .
```

---

## 🔄 Deploy سریع (یک خط)

```bash
cd frontend && \
git pull origin main && \
docker build -t mabna-front:latest . && \
docker stop mabna-front 2>/dev/null || true && \
docker rm mabna-front 2>/dev/null || true && \
docker run -d --name mabna-front -p 3001:80 --restart unless-stopped mabna-front:latest && \
docker logs -f mabna-front
```

این دستور:
1. Pull می‌کنه
2. Build می‌کنه
3. Container قدیمی رو stop و remove می‌کنه
4. Container جدید رو run می‌کنه
5. Logs رو نمایش می‌ده

---

## 📦 استفاده از Docker Compose (پیشنهادی)

اگر `docker-compose.yml` دارید:

```bash
cd frontend
docker-compose down
docker-compose up -d --build
docker-compose logs -f
```

---

## 🧹 پاکسازی (Cleanup)

### حذف Images قدیمی

```bash
# دیدن تمام images
docker images | grep mabna-front

# حذف images بدون tag
docker image prune -f

# حذف تمام images استفاده نشده
docker system prune -a
```

### حذف Containers متوقف شده

```bash
docker container prune -f
```

---

## 🔍 دیباگ و بررسی

### ورود به Container

```bash
docker exec -it mabna-front sh
```

### بررسی فایل‌های داخل Container

```bash
docker exec mabna-front ls -la /usr/share/nginx/html
```

### تست کردن از داخل سرور

```bash
curl http://localhost:3001
```

### بررسی استفاده از منابع

```bash
docker stats mabna-front
```

---

## 📝 Checklist قبل از Deploy

- [ ] تغییرات رو commit و push کردید
- [ ] `.env.production` رو چک کردید
- [ ] API URL ها درست هستند
- [ ] Build بدون خطا انجام شد
- [ ] Container قدیمی رو stop کردید
- [ ] پورت مورد نظر آزاد است
- [ ] بعد از deploy تست کردید

---

## 🌐 دسترسی به اپلیکیشن

بعد از deploy موفق:

- **Local:** http://localhost:3001
- **Production:** http://193.141.64.139:3001

---

## 🆘 در صورت مشکل

1. **چک کردن logs:**
   ```bash
   docker logs mabna-front
   ```

2. **Restart کردن:**
   ```bash
   docker restart mabna-front
   ```

3. **Deploy از اول:**
   ```bash
   docker stop mabna-front
   docker rm mabna-front
   docker rmi mabna-front:latest
   # سپس از مرحله 2 شروع کنید
   ```

4. **تماس با تیم DevOps** 😊

---

## 📚 منابع مفید

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks)

---

**آخرین بروزرسانی:** 2025-12-16
**نگهدارنده:** تیم DevOps
