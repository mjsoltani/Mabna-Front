import { useState } from "react";
import { Target, CheckSquare, BarChart3, Users, Lock, Zap } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const features = [
  {
    Icon: Target,
    name: "مدیریت اهداف (OKR)",
    description: "تعریف اهداف استراتژیک و نتایج کلیدی قابل اندازه‌گیری",
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
    ),
    details: {
      title: "مدیریت اهداف (OKR)",
      description:
        "سیستم OKR (Objectives and Key Results) به شما کمک می‌کند تا اهداف استراتژیک خود را به نتایج قابل اندازه‌گیری تبدیل کنید. با مبنا می‌توانید:",
      features: [
        "اهداف بلندمدت و کوتاه‌مدت تعریف کنید",
        "نتایج کلیدی قابل سنجش برای هر هدف مشخص کنید",
        "پیشرفت را به صورت real-time رصد کنید",
        "اهداف را به سطوح مختلف سازمان لینک دهید",
        "گزارش‌های جامع از عملکرد دریافت کنید",
      ],
    },
  },
  {
    Icon: CheckSquare,
    name: "مدیریت وظایف",
    description: "ایجاد و تخصیص وظایف با لینک مستقیم به نتایج کلیدی",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
    ),
    details: {
      title: "مدیریت وظایف پیشرفته",
      description:
        "سیستم مدیریت وظایف مبنا به شما امکان می‌دهد تا کارها را به صورت دقیق پیگیری کنید:",
      features: [
        "ایجاد وظایف و لینک آن‌ها به نتایج کلیدی",
        "تخصیص وظایف به اعضای تیم",
        "تعیین اولویت و ددلاین",
        "ایجاد زیروظایف (Subtasks)",
        "وظایف تکرارشونده (Recurring Tasks)",
        "منشن کردن اعضا در توضیحات",
      ],
    },
  },
  {
    Icon: BarChart3,
    name: "گزارش‌گیری پیشرفته",
    description: "مشاهده پیشرفت اهداف و عملکرد تیم در یک نگاه",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20" />
    ),
    details: {
      title: "داشبورد و گزارش‌گیری",
      description:
        "با داشبورد تحلیلی مبنا، همه چیز را در یک نگاه ببینید:",
      features: [
        "نمودارهای پیشرفت برای هر هدف و KR",
        "آمار عملکرد تیم و افراد",
        "گزارش‌های قابل export",
        "فیلترهای پیشرفته",
        "نمایش timeline پروژه‌ها",
      ],
    },
  },
  {
    Icon: Users,
    name: "همکاری تیمی",
    description: "مدیریت چند سازمان و تعیین نقش‌های مختلف",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
    ),
    details: {
      title: "همکاری تیمی",
      description: "مبنا برای کار تیمی طراحی شده است:",
      features: [
        "ایجاد و مدیریت چندین سازمان",
        "دعوت اعضای جدید",
        "تعیین نقش‌ها (Owner, Admin, Member)",
        "مجوزدهی سطح سازمانی",
        "مشاهده فعالیت‌های تیم",
      ],
    },
  },
  {
    Icon: Lock,
    name: "امنیت بالا",
    description: "احراز هویت JWT و حفاظت کامل از داده‌ها",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20" />
    ),
    details: {
      title: "امنیت و حریم خصوصی",
      description: "امنیت داده‌های شما برای ما اولویت است:",
      features: [
        "احراز هویت با JWT Token",
        "رمزنگاری اطلاعات حساس",
        "مجوزدهی چندسطحی",
        "لاگ تمام فعالیت‌ها",
        "پشتیبان‌گیری خودکار",
      ],
    },
  },
];

function FeaturesBento() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <>
      <BentoGrid className="lg:grid-rows-3 max-w-7xl mx-auto">
        {features.map((feature) => (
          <BentoCard
            key={feature.name}
            {...feature}
            cta="موارد بیشتر"
            onClick={() => setSelectedFeature(feature)}
          />
        ))}
      </BentoGrid>

      <Dialog
        open={!!selectedFeature}
        onOpenChange={() => setSelectedFeature(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              {selectedFeature && (
                <>
                  <selectedFeature.Icon className="h-8 w-8 text-primary" />
                  {selectedFeature.details.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base text-right pt-4">
              {selectedFeature?.details.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <h4 className="font-semibold text-lg mb-3">قابلیت‌ها:</h4>
            <ul className="space-y-2">
              {selectedFeature?.details.features.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { FeaturesBento };
