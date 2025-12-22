// components/ui/activity-card.jsx
"use client";

import { Activity, ArrowUpRight, Plus, Target, CheckCircle2, Paperclip, User, Users, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ActivityCard({
  category = "Activity",
  title = "Today's Progress",
  description = "",
  assignee = null,
  team = null,
  assignees = [],
  teams = [],
  goalsTitle = "نتایج کلیدی",
  metrics = [],
  dailyGoals = [],
  attachmentsCount = 0,
  onAddGoal,
  onToggleGoal,
  onViewDetails,
  onViewAttachments,
  onEdit,
  onDelete,
  className
}) {
  const [isHovering, setIsHovering] = useState(null);

  // پشتیبانی از هر دو فرمت قدیم و جدید
  const displayAssignees = assignees.length > 0 ? assignees : (assignee ? [assignee] : []);
  const displayTeams = teams.length > 0 ? teams : (team ? [team] : []);

  const METRIC_COLORS = {
    Move: "#FF2D55",
    Exercise: "#2CD758",
    Stand: "#007AFF",
  };

  const handleGoalToggle = (goalId) => {
    onToggleGoal?.(goalId);
  };

  return (
    <div
      className={cn(
        "relative h-full rounded-3xl p-6",
        "bg-white dark:bg-black/5",
        "border border-zinc-200 dark:border-zinc-800",
        "hover:border-zinc-300 dark:hover:border-zinc-700",
        "transition-all duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
          <Activity className="w-5 h-5 text-[#FF2D55]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{category}</p>
          {description && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
          {/* نمایش انتساب */}
          {(displayAssignees.length > 0 || displayTeams.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {displayAssignees.map((a, idx) => (
                <span key={a.user_id || idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                  <User className="w-3 h-3" />
                  {a.full_name}
                </span>
              ))}
              {displayTeams.map((t, idx) => (
                <span key={t.id || idx} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-xs">
                  <Users className="w-3 h-3" />
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Rings */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="relative flex flex-col items-center"
            onMouseEnter={() => setIsHovering(metric.label)}
            onMouseLeave={() => setIsHovering(null)}
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800/50" />
              <div
                className={cn(
                  "absolute inset-0 rounded-full border-4 transition-all duration-500",
                  isHovering === metric.label && "scale-105"
                )}
                style={{
                  borderColor: METRIC_COLORS[metric.label] || "#FF2D55",
                  clipPath: `polygon(0 0, 100% 0, 100% ${metric.trend}%, 0 ${metric.trend}%)`,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                  {metric.value}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {metric.unit}
                </span>
              </div>
            </div>
            <span className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {metric.label}
            </span>
            <span className="text-xs text-zinc-500">{metric.trend}%</span>
          </div>
        ))}
      </div>

      {/* Goals Section */}
      <div className="mt-8 space-y-6">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Target className="w-4 h-4" />
              {goalsTitle}
            </h4>
            {onAddGoal && (
              <button
                type="button"
                onClick={onAddGoal}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {dailyGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleGoalToggle(goal.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl",
                  "bg-zinc-50 dark:bg-zinc-900/50",
                  "border border-zinc-200/50 dark:border-zinc-800/50",
                  "hover:border-zinc-300/50 dark:hover:border-zinc-700/50",
                  "transition-all"
                )}
              >
                <CheckCircle2
                  className={cn(
                    "w-5 h-5",
                    goal.isCompleted
                      ? "text-emerald-500"
                      : "text-zinc-400 dark:text-zinc-600"
                  )}
                />
                <span
                  className={cn(
                    "text-sm text-left",
                    goal.isCompleted
                      ? "text-zinc-500 dark:text-zinc-400 line-through"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {goal.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onViewDetails}
                className="inline-flex items-center gap-2 text-sm font-medium
                  text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white
                  transition-colors duration-200"
              >
                مشاهده جزئیات
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20
                    transition-colors duration-200"
                  title="ویرایش"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
                    transition-colors duration-200"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              {onViewAttachments && (
                <button
                  onClick={onViewAttachments}
                  className="inline-flex items-center gap-1.5 text-sm font-medium
                    text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200
                    transition-colors duration-200"
                >
                  <Paperclip className="w-4 h-4" />
                  {attachmentsCount > 0 && (
                    <span className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded-full text-xs">
                      {attachmentsCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
