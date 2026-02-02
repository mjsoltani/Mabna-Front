# راهنمای استفاده از shadcn/ui

## ✅ نصب و راه‌اندازی کامل شد!

shadcn/ui با موفقیت به پروژه اضافه شد و آماده استفاده است.

---

## 📦 کامپوننت‌های نصب شده

کامپوننت‌های زیر از shadcn/ui نصب شده‌اند و آماده استفاده هستند:

### 1. Button
```jsx
import { Button } from "@/components/ui/button"

<Button>کلیک کنید</Button>
<Button variant="destructive">حذف</Button>
<Button variant="outline">خطی</Button>
<Button variant="secondary">ثانویه</Button>
<Button variant="ghost">شبح</Button>
<Button size="sm">کوچک</Button>
<Button size="lg">بزرگ</Button>
```

### 2. Card
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>عنوان کارت</CardTitle>
    <CardDescription>توضیحات کارت</CardDescription>
  </CardHeader>
  <CardContent>
    محتوای کارت
  </CardContent>
  <CardFooter>
    <Button>عملیات</Button>
  </CardFooter>
</Card>
```

### 3. Badge
```jsx
import { Badge } from "@/components/ui/badge"

<Badge>پیش‌فرض</Badge>
<Badge variant="secondary">ثانویه</Badge>
<Badge variant="destructive">خطرناک</Badge>
<Badge variant="outline">خطی</Badge>
```

### 4. Input
```jsx
import { Input } from "@/components/ui/input"

<Input type="text" placeholder="نام خود را وارد کنید" />
<Input type="email" placeholder="ایمیل" />
<Input type="password" placeholder="رمز عبور" />
```

### 5. Dialog (Modal)
```jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>باز کردن مودال</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>عنوان مودال</DialogTitle>
      <DialogDescription>
        توضیحات مودال
      </DialogDescription>
    </DialogHeader>
    <div>محتوای مودال</div>
    <DialogFooter>
      <Button>ذخیره</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 6. Progress
```jsx
import { Progress } from "@/components/ui/progress"

<Progress value={65} />
```

---

## 🎨 کامپوننت‌های بیشتر

برای اضافه کردن کامپوننت‌های بیشتر از shadcn/ui، می‌توانید از دستورات زیر استفاده کنید:

```bash
# Alert
npx shadcn@latest add alert

# Avatar
npx shadcn@latest add avatar

# Checkbox
npx shadcn@latest add checkbox

# Select
npx shadcn@latest add select

# Textarea
npx shadcn@latest add textarea

# Tabs
npx shadcn@latest add tabs

# Table
npx shadcn@latest add table

# Dropdown Menu
npx shadcn@latest add dropdown-menu

# Popover
npx shadcn@latest add popover

# Toast (اعلان‌ها)
npx shadcn@latest add toast

# Accordion
npx shadcn@latest add accordion

# Separator
npx shadcn@latest add separator

# Label
npx shadcn@latest add label

# Switch
npx shadcn@latest add switch

# Slider
npx shadcn@latest add slider
```

یا برای دیدن لیست کامل:
```bash
npx shadcn@latest add
```

---

## 📚 مستندات کامل

برای دیدن مستندات کامل و مثال‌های بیشتر:
https://ui.shadcn.com/docs/components

---

## 🎯 نکات مهم

1. **Import Path**: همیشه از `@/components/ui/...` برای import استفاده کنید
2. **Tailwind Classes**: می‌توانید با className کلاس‌های Tailwind اضافه کنید
3. **Customization**: تمام کامپوننت‌ها قابل سفارشی‌سازی هستند
4. **RTL Support**: برای فارسی باید direction: rtl را در CSS اضافه کنید

---

## 🔧 تنظیمات انجام شده

✅ Tailwind CSS نصب شد
✅ PostCSS کانفیگ شد
✅ shadcn/ui متغیرها در index.css اضافه شد
✅ Path alias (@) تنظیم شد
✅ jsconfig.json برای IntelliSense ساخته شد
✅ components.json برای shadcn CLI ساخته شد
✅ کامپوننت‌های پایه نصب شد

---

## 🚀 مثال استفاده در پروژه

### جایگزینی دکمه‌های قدیمی:

**قبل:**
```jsx
<button className="btn-primary" onClick={handleClick}>
  ایجاد
</button>
```

**بعد:**
```jsx
import { Button } from "@/components/ui/button"

<Button onClick={handleClick}>
  ایجاد
</Button>
```

### جایگزینی مودال‌های قدیمی:

**قبل:**
```jsx
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content">
      <h3>عنوان</h3>
      <div>محتوا</div>
    </div>
  </div>
)}
```

**بعد:**
```jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>عنوان</DialogTitle>
    </DialogHeader>
    <div>محتوا</div>
  </DialogContent>
</Dialog>
```

---

## 🎨 تم‌سازی

رنگ‌های پروژه در `src/index.css` تعریف شده‌اند و می‌توانید آن‌ها را تغییر دهید:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  /* ... */
}
```

برای تغییر تم می‌توانید از Theme Generator استفاده کنید:
https://ui.shadcn.com/themes

---

**موفق باشید! 🎉**
