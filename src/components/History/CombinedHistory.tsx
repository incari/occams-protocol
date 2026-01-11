import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useSessions } from "../../hooks/useSessions";
import { useMeasurements } from "../../hooks/useMeasurements";
import { formatDateDisplay } from "../../utils/dateUtils";
import { WarningModal } from "../Modal/WarningModal";
import type { Variant } from "../../types";

type HistoryItem = {
  id: string;
  date: string;
  type: "session" | "measurement";
  data: any;
};

export function CombinedHistory() {
  const { sessions, removeSession } = useSessions();
  const { measurements, removeMeasurement } = useMeasurements();
  const [filter, setFilter] = useState<"all" | "sessions" | "measurements">(
    "all"
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "session" | "measurement";
  } | null>(null);

  // Combine and sort by date
  const allItems: HistoryItem[] = [
    ...sessions.map((s) => ({
      id: s.id,
      date: s.date,
      type: "session" as const,
      data: s,
    })),
    ...measurements.map((m) => ({
      id: m.id,
      date: m.date,
      type: "measurement" as const,
      data: m,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = allItems.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const handleDelete = (id: string, type: "session" | "measurement") => {
    setItemToDelete({ id, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    setShowDeleteModal(false);
    setDeletingId(itemToDelete.id);
    if (itemToDelete.type === "session") {
      removeSession(itemToDelete.id);
    } else {
      removeMeasurement(itemToDelete.id);
    }
    setDeletingId(null);
    setItemToDelete(null);
  };

  const getVariantColor = (variant: Variant) => {
    return variant === "A"
      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
      : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
  };

  if (allItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`btn btn-secondary text-sm ${
            filter === "all" ? "bg-primary-100 dark:bg-primary-900/30" : ""
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("sessions")}
          className={`btn btn-secondary text-sm ${
            filter === "sessions" ? "bg-primary-100 dark:bg-primary-900/30" : ""
          }`}
        >
          Sessions
        </button>
        <button
          onClick={() => setFilter("measurements")}
          className={`btn btn-secondary text-sm ${
            filter === "measurements"
              ? "bg-primary-100 dark:bg-primary-900/30"
              : ""
          }`}
        >
          Measurements
        </button>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {item.type === "session" ? (
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getVariantColor(
                        item.data.variant
                      )}`}
                    >
                      Option {item.data.variant}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                      Measurement
                    </span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDateDisplay(item.date)}
                  </span>
                </div>

                {item.type === "session" ? (
                  <div className="space-y-1">
                    {item.data.exercises.map((exercise: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-sm"
                      >
                        <span className="font-medium">{exercise.name}:</span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          {exercise.weight} {exercise.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Weight:</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.data.weight} {item.data.weightUnit}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Body Fat:</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.data.bodyFat}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id, item.type)}
                disabled={deletingId === item.id}
                className="btn btn-danger text-sm ml-4"
                aria-label="Delete"
              >
                {deletingId === item.id ? (
                  "..."
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No items found for this filter.
          </p>
        </div>
      )}

      <WarningModal
        isOpen={showDeleteModal}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
