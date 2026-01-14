import { useState } from "react";
import {
  format,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { useSessions } from "../../hooks/useSessions";
import { useScheduledReminders } from "../../hooks/useScheduledReminders";
import { ReminderModal } from "../Modal/ReminderModal";
import { formatDate, isToday } from "../../utils/dateUtils";
import type { ScheduledReminder, Variant } from "../../types";

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedReminder, setSelectedReminder] =
    useState<ScheduledReminder | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const { sessions } = useSessions();
  const {
    getRemindersByDate,
    removeReminder,
    rescheduleReminder,
    scheduleReminder,
  } = useScheduledReminders();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month to calculate offset (Monday = 0, Sunday = 6)
  const firstDayOfWeek = getDay(monthStart);
  // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
  const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const emptyDays = Array(mondayOffset).fill(null);

  const getSessionsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return sessions.filter((s) => s.date === dateStr);
  };

  const getVariantColor = (variant: Variant) => {
    return variant === "A" ? "bg-blue-500" : "bg-green-500";
  };

  const getRemindersForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return getRemindersByDate(dateStr);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = formatDate(date);
    const reminders = getRemindersByDate(dateStr);

    if (reminders.length > 0) {
      // If there's a reminder, open it for editing
      setSelectedReminder(reminders[0]);
      setSelectedDate(null);
    } else {
      // Otherwise, open modal to add new reminder
      setSelectedReminder(null);
      setSelectedDate(dateStr);
    }
    setShowReminderModal(true);
  };

  const handleDeleteReminder = (id: string) => {
    removeReminder(id);
    setShowReminderModal(false);
    setSelectedReminder(null);
    setSelectedDate(null);
  };

  const handleRescheduleReminder = (
    id: string,
    newDate: string,
    newVariant: Variant
  ) => {
    rescheduleReminder(id, newDate, newVariant);
    setShowReminderModal(false);
    setSelectedReminder(null);
    setSelectedDate(null);
  };

  const handleAddReminder = (date: string, variant: Variant) => {
    scheduleReminder(date, variant);
    setShowReminderModal(false);
    setSelectedDate(null);
  };

  const handleCloseModal = () => {
    setShowReminderModal(false);
    setSelectedReminder(null);
    setSelectedDate(null);
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <div className="card mt-4">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="btn btn-secondary text-lg"
            aria-label="Previous month"
          >
            ‹
          </button>
          <h2 className="text-xl font-bold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={nextMonth}
            className="btn btn-secondary text-lg"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {emptyDays.map((_, index) => (
            <div
              key={`empty-${index}`}
              className="aspect-square"
            />
          ))}

          {/* Month days */}
          {monthDays.map((day) => {
            const daySessions = getSessionsForDate(day);
            const dayReminders = getRemindersForDate(day);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const hasReminder = dayReminders.length > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`aspect-square flex flex-col items-center justify-center p-1 rounded-lg relative cursor-pointer transition-colors ${
                  hasReminder
                    ? "bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    : isCurrentDay
                    ? "bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-600 hover:bg-primary-200 dark:hover:bg-primary-900/50"
                    : isCurrentMonth
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                    : "opacity-30"
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isCurrentDay ? "text-primary-700 dark:text-primary-300" : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
                {/* Completed sessions */}
                {daySessions.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {daySessions.map((session, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${getVariantColor(
                          session.variant
                        )}`}
                        title={`${session.variant}: ${session.exercises
                          .map((e) => `${e.name} ${e.weight}${e.unit}`)
                          .join(", ")}`}
                      />
                    ))}
                  </div>
                )}
                {/* Scheduled reminders indicator */}
                {hasReminder && daySessions.length === 0 && (
                  <div className="flex gap-1 mt-1">
                    {dayReminders.map((reminder, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full border-2 ${
                          reminder.variant === "A"
                            ? "border-blue-500 bg-transparent"
                            : "border-green-500 bg-transparent"
                        }`}
                        title={`Scheduled: Workout ${reminder.variant} - Click to edit`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm">Option A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm">Option B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-900/30" />
            <span className="text-sm">Scheduled</span>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        reminder={selectedReminder}
        selectedDate={selectedDate || undefined}
        onClose={handleCloseModal}
        onDelete={handleDeleteReminder}
        onReschedule={handleRescheduleReminder}
        onAdd={handleAddReminder}
      />
    </div>
  );
}
