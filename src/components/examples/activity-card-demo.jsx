// components/examples/activity-card-demo.jsx
import { ActivityCard } from "@/components/ui/activity-card";
import { useState } from "react";

const INITIAL_METRICS = [
  { label: "شاخص‌های کلیدی", value: "5", trend: 85, unit: "عدد" },
  { label: "تکمیل شده", value: "3", trend: 60, unit: "عدد" },
  { label: "پیشرفت", value: "75", trend: 75, unit: "%" },
];

const INITIAL_GOALS = [
  { id: "1", title: "افزایش فروش 20%", isCompleted: true },
  { id: "2", title: "کاهش هزینه‌ها 15%", isCompleted: false },
  { id: "3", title: "بهبود رضایت مشتری", isCompleted: true },
];

export function ActivityCardDemo() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);

  const handleToggleGoal = (goalId) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, isCompleted: !goal.isCompleted }
          : goal
      )
    );
  };

  const handleAddGoal = () => {
    const newGoal = {
      id: `goal-${goals.length + 1}`,
      title: `هدف جدید ${goals.length + 1}`,
      isCompleted: false,
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const handleViewDetails = () => {
    console.log("مشاهده جزئیات");
    alert("نمایش گزارش کامل هدف");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">
          نمونه کارت فعالیت
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* کارت اول */}
          <ActivityCard
            category="Q1 2024"
            title="رشد کسب‌وکار"
            metrics={metrics}
            dailyGoals={goals}
            onAddGoal={handleAddGoal}
            onToggleGoal={handleToggleGoal}
            onViewDetails={handleViewDetails}
          />

          {/* کارت دوم */}
          <ActivityCard
            category="Q2 2024"
            title="بهبود محصول"
            metrics={[
              { label: "ویژگی‌ها", value: "12", trend: 90, unit: "عدد" },
              { label: "رفع باگ", value: "45", trend: 95, unit: "عدد" },
              { label: "کیفیت", value: "88", trend: 88, unit: "%" },
            ]}
            dailyGoals={[
              { id: "4", title: "طراحی UI جدید", isCompleted: true },
              { id: "5", title: "بهینه‌سازی سرعت", isCompleted: false },
            ]}
            onAddGoal={handleAddGoal}
            onToggleGoal={handleToggleGoal}
            onViewDetails={handleViewDetails}
          />

          {/* کارت سوم */}
          <ActivityCard
            category="Q3 2024"
            title="توسعه تیم"
            metrics={[
              { label: "اعضا", value: "8", trend: 100, unit: "نفر" },
              { label: "آموزش", value: "24", trend: 80, unit: "ساعت" },
              { label: "رضایت", value: "92", trend: 92, unit: "%" },
            ]}
            dailyGoals={[
              { id: "6", title: "استخدام توسعه‌دهنده", isCompleted: true },
              { id: "7", title: "برگزاری کارگاه", isCompleted: true },
              { id: "8", title: "ارزیابی عملکرد", isCompleted: false },
            ]}
            onAddGoal={handleAddGoal}
            onToggleGoal={handleToggleGoal}
            onViewDetails={handleViewDetails}
          />
        </div>

        {/* راهنمای استفاده */}
        <div className="mt-12 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            راهنمای استفاده
          </h2>
          <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
            <li>• روی حلقه‌های پیشرفت hover کنید تا انیمیشن را ببینید</li>
            <li>• روی اهداف کلیک کنید تا وضعیت آن‌ها تغییر کند</li>
            <li>• دکمه + را برای افزودن هدف جدید استفاده کنید</li>
            <li>• دکمه "View Activity Details" را برای مشاهده گزارش کلیک کنید</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
