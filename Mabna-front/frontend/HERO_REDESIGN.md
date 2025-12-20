# Hero Section Redesign با shadcn/ui

## ✅ تغییرات انجام شده

### 1. نصب Dependencies
```bash
npm install lucide-react framer-motion
```

Dependencies قبلی که از قبل نصب بودند:
- `@radix-ui/react-slot`
- `class-variance-authority`
- `tailwind-merge`

### 2. کامپوننت‌های جدید

#### `src/components/ui/button.jsx`
کامپوننت Button از shadcn/ui با variants مختلف:
- `default`: دکمه اصلی با رنگ primary
- `outline`: دکمه با border
- `secondary`: دکمه ثانویه
- `ghost`: دکمه بدون background
- `link`: دکمه به صورت لینک

Sizes:
- `sm`: کوچک
- `default`: متوسط
- `lg`: بزرگ
- `icon`: برای آیکون‌ها

#### `src/components/ui/animated-hero.jsx`
Hero Section جدید با انیمیشن framer-motion:
- **انیمیشن متن**: کلمات "هوشمندی، همکاری، زیبایی، اثرگذاری، کامل شدن" به صورت چرخشی نمایش داده می‌شوند
- **Gradient Text**: متن با gradient زیبا
- **دکمه‌های CTA**: دو دکمه برای شروع و ورود
- **آمار**: نمایش آمار پروژه (۴ اسپرینت، ۱۰۰٪ شفافیت، ∞ امکانات)

### 3. آپدیت Landing.jsx

Landing component آپدیت شد:
- Navbar به بالای صفحه منتقل شد (fixed)
- Hero Section قدیمی با کامپوننت جدید `<Hero />` جایگزین شد
- استفاده از Tailwind classes برای styling
- حفظ بقیه sections (Features, Sprints, CTA, Footer)

### 4. آپدیت CSS

Landing.css ساده‌سازی شد:
- حذف استایل‌های قدیمی Hero
- نگه‌داشتن استایل‌های Features, Sprints, CTA, Footer
- استفاده از CSS variables برای رنگ‌ها

## 🎨 ویژگی‌های Hero جدید

### انیمیشن
- کلمات با `framer-motion` animate می‌شوند
- هر 2 ثانیه یک کلمه جدید نمایش داده می‌شود
- انیمیشن spring برای حرکت نرم

### محتوا
```
مبنا برای ما، [هوشمندی/همکاری/زیبایی/اثرگذاری/کامل شدن]
```

### دکمه‌ها
- **شروع کنید**: دکمه اصلی با variant `default`
- **ورود / ثبت‌نام**: دکمه با variant `outline`
- هر دو با آیکون از `lucide-react`

### آمار
- ۴ اسپرینت توسعه
- ۱۰۰٪ شفافیت اهداف
- ∞ امکانات رشد

## 🚀 استفاده

```jsx
import { Hero } from '@/components/ui/animated-hero';

function Landing({ onGetStarted }) {
  return (
    <div>
      <Hero onGetStarted={onGetStarted} />
      {/* بقیه محتوا */}
    </div>
  );
}
```

## 📦 Build

```bash
# Development
npm run dev

# Production Build
npm run build

# Preview
npm run preview
```

## 🎯 بهبودهای آینده

- [ ] اضافه کردن انیمیشن به ورود صفحه
- [ ] بهبود responsive design برای موبایل
- [ ] اضافه کردن parallax effect
- [ ] استفاده از shadcn/ui برای Features cards
- [ ] ریدیزاین Sprints timeline با shadcn components
- [ ] اضافه کردن dark mode

## 📝 نکات

1. **framer-motion**: برای انیمیشن‌های پیشرفته استفاده می‌شود
2. **lucide-react**: کتابخانه آیکون‌های زیبا و سبک
3. **Tailwind CSS**: برای styling سریع و responsive
4. **shadcn/ui**: کامپوننت‌های آماده و قابل سفارشی‌سازی

## 🔗 منابع

- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**تاریخ**: 19 دسامبر 2025
**وضعیت**: ✅ تکمیل شده
