import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Trash2, X, Plus } from "lucide-react";
import type { ScheduledReminder, Variant } from "../../types";

interface ReminderModalProps {
  isOpen: boolean;
  reminder: ScheduledReminder | null;
  selectedDate?: string; // For adding new reminder
  onClose: () => void;
  onDelete: (id: string) => void;
  onReschedule: (id: string, newDate: string, variant: Variant) => void;
  onAdd?: (date: string, variant: Variant) => void;
}

export function ReminderModal({
  isOpen,
  reminder,
  selectedDate,
  onClose,
  onDelete,
  onReschedule,
  onAdd,
}: ReminderModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newVariant, setNewVariant] = useState<Variant>("A");

  // Determine if we're in "add" mode (no existing reminder)
  const isAddMode = !reminder && !!selectedDate;

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (isAddMode && selectedDate) {
        setNewDate(selectedDate);
        setNewVariant("A");
        setIsEditing(false);
      } else if (reminder) {
        setNewDate(reminder.date);
        setNewVariant(reminder.variant);
        setIsEditing(false);
      }
    }
  }, [isOpen, isAddMode, selectedDate, reminder]);

  if (!isOpen || (!reminder && !selectedDate)) return null;

  const displayDate = reminder
    ? parseISO(reminder.date)
    : parseISO(selectedDate!);
  const formattedDate = format(displayDate, "EEEE, MMMM d, yyyy");

  const handleEdit = () => {
    if (reminder) {
      setNewDate(reminder.date);
      setNewVariant(reminder.variant);
    }
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (newDate && reminder) {
      onReschedule(reminder.id, newDate, newVariant);
      setIsEditing(false);
    }
  };

  const handleAdd = () => {
    if (onAdd && selectedDate) {
      onAdd(selectedDate, newVariant);
    }
  };

  const handleDelete = () => {
    if (reminder) {
      onDelete(reminder.id);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm animate-bounce-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {isAddMode ? (
              <Plus className="w-5 h-5 text-green-500" />
            ) : (
              <Calendar className="w-5 h-5 text-amber-500" />
            )}
            <h2 className="text-lg font-semibold">
              {isAddMode ? "Schedule Training" : "Scheduled Training"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Add Mode - Select workout type */}
          {isAddMode ? (
            <>
              <div className="text-center mb-4">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {formattedDate}
                </p>
                <p className="text-sm text-gray-500">
                  Select a workout type to schedule:
                </p>
              </div>

              <div className="space-y-4 mb-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVariant("A")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      newVariant === "A"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Workout A
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVariant("B")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      newVariant === "B"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Workout B
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Schedule
                </button>
              </div>
            </>
          ) : !isEditing && reminder ? (
            /* View Mode - Show existing reminder */
            <>
              <div className="text-center mb-4">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                    reminder.variant === "A"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  Workout {reminder.variant}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {formattedDate}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Reschedule
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 btn bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Workout Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewVariant("A")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        newVariant === "A"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      Option A
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewVariant("B")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        newVariant === "B"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      Option B
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 btn btn-primary"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
