import DisplayCards from "@/components/ui/display-cards";
import { Target, TrendingUp, Users } from "lucide-react";

const highlightCards = [
  {
    icon: <Target className="size-6 text-purple-300" />,
    title: "هدف‌محور",
    description: "تمرکز بر نتایج کلیدی",
    date: "OKR Framework",
    iconClassName: "text-purple-500",
    titleClassName: "text-purple-500",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <TrendingUp className="size-6 text-green-300" />,
    title: "رشد مستمر",
    description: "پیشرفت قابل اندازه‌گیری",
    date: "Real-time Tracking",
    iconClassName: "text-green-500",
    titleClassName: "text-green-500",
    className:
      "[grid-area:stack] translate-x-20 translate-y-12 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Users className="size-6 text-blue-300" />,
    title: "همکاری تیمی",
    description: "موفقیت جمعی",
    date: "Team Collaboration",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-500",
    className:
      "[grid-area:stack] translate-x-40 translate-y-24 hover:translate-y-12",
  },
];

function HighlightsDisplay() {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center py-20">
      <div className="w-full max-w-4xl">
        <DisplayCards cards={highlightCards} />
      </div>
    </div>
  );
}

export { HighlightsDisplay };
