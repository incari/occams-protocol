import { useEffect, useState } from "react";
import { format, addDays, parseISO } from "date-fns";
import type { Variant } from "../../types";

interface CongratsModalProps {
  isOpen: boolean;
  variant: Variant;
  sessionDate: string; // ISO date string (YYYY-MM-DD)
  onScheduleReminder: (nextDate: string, variant: Variant) => void;
  onSkip: () => void;
}

export function CongratsModal({
  isOpen,
  variant,
  sessionDate,
  onScheduleReminder,
  onSkip,
}: CongratsModalProps) {
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{ id: number; left: number; delay: number; color: string }>
  >([]);

  // Generate confetti on open
  useEffect(() => {
    if (isOpen) {
      const colors = [
        "#10b981",
        "#3b82f6",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
      ];
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setConfettiPieces(pieces);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate next training date (same day next week)
  const sessionDateObj = parseISO(sessionDate);
  const nextTrainingDate = addDays(sessionDateObj, 7);
  const nextTrainingDateStr = format(nextTrainingDate, "yyyy-MM-dd");
  const nextTrainingDisplayDate = format(nextTrainingDate, "EEEE, MMMM d");

  const handleSchedule = () => {
    onScheduleReminder(nextTrainingDateStr, variant);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: `${piece.left}%`,
              top: "-20px",
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700 relative z-10 animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trophy/Celebration Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Great Job!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You crushed your{" "}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              Workout {variant}
            </span>{" "}
            session!
          </p>
        </div>

        {/* Next Training Reminder */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            📅 Schedule Next Training
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Keep the momentum going! Your next{" "}
            <span className="font-semibold">Workout {variant}</span> is
            scheduled for:
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border-2 border-primary-200 dark:border-primary-700">
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {nextTrainingDisplayDate}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Same day, same workout type
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSchedule}
            className="btn btn-primary w-full py-3 text-lg font-semibold"
          >
            ✓ Add to Calendar
          </button>
          <button
            onClick={onSkip}
            className="btn btn-secondary w-full"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}
