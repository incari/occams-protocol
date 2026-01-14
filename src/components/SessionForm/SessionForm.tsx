import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { WarningModal } from "../Modal/WarningModal";
import { CongratsModal } from "../Modal/CongratsModal";
import { formatDate } from "../../utils/dateUtils";
import {
  validateWeight,
  validateDate,
  validateVariant,
} from "../../utils/validation";
import { useSessions } from "../../hooks/useSessions";
import { useSettings } from "../../hooks/useSettings";
import { useScheduledReminders } from "../../hooks/useScheduledReminders";
import { EXERCISES, type Variant } from "../../types";

const DRAFT_KEY = "session-draft";

export function SessionForm() {
  const navigate = useNavigate();
  const { createSession } = useSessions();
  const { settings } = useSettings();
  const { scheduleReminder } = useScheduledReminders();

  const [date, setDate] = useState(formatDate(new Date()));
  const [variant, setVariant] = useState<Variant>("A");
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [reps, setReps] = useState<Record<string, string>>({}); // For exercises that need reps (like Kettlebells)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showClearDraftModal, setShowClearDraftModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [savedSessionDate, setSavedSessionDate] = useState("");
  const [savedVariant, setSavedVariant] = useState<Variant>("A");

  const exercises = EXERCISES[variant];

  // Track if draft was loaded
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setDate(draft.date || formatDate(new Date()));
        setVariant(draft.variant || "A");
        setWeights(draft.weights || {});
        setReps(draft.reps || {});
        setHasDraft(true);
        setDraftLoaded(true);
      } catch (error) {
        console.error("Error loading draft:", error);
        setDraftLoaded(true);
      }
    } else {
      setDraftLoaded(true);
    }
  }, []);

  // Initialize weights and reps when variant changes, but only after draft is loaded
  useEffect(() => {
    if (!draftLoaded) return;

    // Check if there's already data for the current exercises (from draft)
    const currentExercises = exercises;
    const hasExistingData = currentExercises.some(
      (ex) => weights[ex] && weights[ex] !== ""
    );

    // Only initialize if no existing data
    if (!hasExistingData) {
      const initialWeights: Record<string, string> = {};
      const initialReps: Record<string, string> = {};
      currentExercises.forEach((exercise) => {
        initialWeights[exercise] = "";
        if (exercise.toLowerCase().includes("kettlebell")) {
          initialReps[exercise] = "";
        }
      });
      setWeights(initialWeights);
      setReps(initialReps);
    }
    setErrors({});
  }, [variant, draftLoaded]);

  const handleWeightChange = (exercise: string, value: string) => {
    setWeights((prev) => ({ ...prev, [exercise]: value }));
    // Clear error when user starts typing
    if (errors[exercise]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[exercise];
        return newErrors;
      });
    }
  };

  const handleRepsChange = (exercise: string, value: string) => {
    setReps((prev) => ({ ...prev, [exercise]: value }));
    // Clear error when user starts typing
    if (errors[`${exercise}-reps`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${exercise}-reps`];
        return newErrors;
      });
    }
  };

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      date,
      variant,
      weights,
      reps,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setHasDraft(true);
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  // Auto-save draft when weights or reps change
  useEffect(() => {
    // Only auto-save if there's at least one weight or rep entered
    const hasData =
      Object.values(weights).some((w) => w !== "") ||
      Object.values(reps).some((r) => r !== "");
    if (hasData) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 1000); // Auto-save after 1 second of inactivity
      return () => clearTimeout(timeoutId);
    }
  }, [weights, reps, date, variant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate date
    const dateValidation = validateDate(date);
    if (!dateValidation.valid) {
      setErrors((prev) => ({ ...prev, date: dateValidation.error || "" }));
      setIsSubmitting(false);
      return;
    }

    // Validate variant
    const variantValidation = validateVariant(variant);
    if (!variantValidation.valid) {
      setErrors((prev) => ({
        ...prev,
        variant: variantValidation.error || "",
      }));
      setIsSubmitting(false);
      return;
    }

    // Validate all weights and reps - only validate filled fields
    const exerciseList: Array<{
      name: string;
      weight: number;
      unit: "kg" | "lbs";
      reps?: number;
    }> = [];
    let hasErrors = false;

    for (const exercise of exercises) {
      const weightValue = weights[exercise] || "";

      // Skip empty fields - they are optional
      if (!weightValue.trim()) {
        continue;
      }

      const validation = validateWeight(weightValue);
      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, [exercise]: validation.error || "" }));
        hasErrors = true;
        continue;
      }

      // Check if this exercise needs reps (Kettlebells)
      const needsReps = exercise.toLowerCase().includes("kettlebell");
      let repsValue: number | undefined;

      if (needsReps) {
        const repsString = reps[exercise] || "";
        if (repsString.trim()) {
          if (isNaN(Number(repsString)) || Number(repsString) <= 0) {
            setErrors((prev) => ({
              ...prev,
              [`${exercise}-reps`]: "Please enter a valid number of swings",
            }));
            hasErrors = true;
            continue;
          }
          repsValue = Number(repsString);
        }
      }

      exerciseList.push({
        name: exercise,
        weight: validation.value!,
        unit: settings.unit,
        ...(repsValue !== undefined && { reps: repsValue }),
      });
    }

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    // Need at least one exercise to save
    if (exerciseList.length === 0) {
      setErrors((prev) => ({
        ...prev,
        submit: "Please fill in at least one exercise",
      }));
      setIsSubmitting(false);
      return;
    }

    // Create session
    const session = createSession({
      date,
      variant,
      exercises: exerciseList,
    });

    if (session) {
      // Clear draft after successful save
      clearDraft();
      // Store session info and show congrats modal
      setSavedSessionDate(date);
      setSavedVariant(variant);
      setShowCongratsModal(true);
      setIsSubmitting(false);
    } else {
      setErrors({ submit: "Failed to save session. Please try again." });
      setIsSubmitting(false);
    }
  };

  const handleScheduleReminder = (nextDate: string, nextVariant: Variant) => {
    scheduleReminder(nextDate, nextVariant);
    navigate("/calendar", {
      state: { message: "Training scheduled! See you next week! 💪" },
    });
  };

  const handleSkipReminder = () => {
    navigate("/history", {
      state: { message: "Session logged successfully!" },
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 mt-4">Log Training Session</h1>

      {hasDraft && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📝 Draft restored. Your progress is being saved automatically.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Date Selection */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium mb-2"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.date;
                  return newErrors;
                });
              }
            }}
            className="input"
            required
          />
          {errors.date && (
            <p className="text-red-600 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Variant Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Training Variant
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setVariant("A")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                variant === "A"
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <div className="font-semibold mb-2">Option A</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {EXERCISES.A.join(", ")}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setVariant("B")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                variant === "B"
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <div className="font-semibold mb-2">Option B</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {EXERCISES.B.join(", ")}
              </div>
            </button>
          </div>
          {errors.variant && (
            <p className="text-red-600 text-sm mt-1">{errors.variant}</p>
          )}
        </div>

        {/* Weight Inputs */}
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-3">
            Weights ({settings.unit})
          </label>
          {exercises.map((exercise) => {
            const needsReps = exercise.toLowerCase().includes("kettlebell");
            return (
              <div
                key={exercise}
                className="space-y-3"
              >
                <label
                  htmlFor={`weight-${exercise}`}
                  className="block text-sm font-medium mb-2"
                >
                  {exercise}
                </label>
                <div className={needsReps ? "grid grid-cols-2 gap-4" : ""}>
                  <div>
                    <label
                      htmlFor={`weight-${exercise}`}
                      className="block text-xs text-gray-600 dark:text-gray-400 mb-1"
                    >
                      Weight ({settings.unit})
                    </label>
                    <input
                      type="number"
                      id={`weight-${exercise}`}
                      step="0.5"
                      min="0"
                      value={weights[exercise] || ""}
                      onChange={(e) =>
                        handleWeightChange(exercise, e.target.value)
                      }
                      placeholder={`Weight in ${settings.unit}`}
                      className="input"
                    />
                    {errors[exercise] && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors[exercise]}
                      </p>
                    )}
                  </div>
                  {needsReps && (
                    <div>
                      <label
                        htmlFor={`reps-${exercise}`}
                        className="block text-xs text-gray-600 dark:text-gray-400 mb-1"
                      >
                        Swings (first try)
                      </label>
                      <input
                        type="number"
                        id={`reps-${exercise}`}
                        step="1"
                        min="1"
                        value={reps[exercise] || ""}
                        onChange={(e) =>
                          handleRepsChange(exercise, e.target.value)
                        }
                        placeholder="Number of swings"
                        className="input"
                      />
                      {errors[`${exercise}-reps`] && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`${exercise}-reps`]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? "Saving..." : "Save Session"}
        </button>

        {hasDraft && (
          <button
            type="button"
            onClick={() => setShowClearDraftModal(true)}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Draft
          </button>
        )}
      </form>

      <WarningModal
        isOpen={showClearDraftModal}
        title="Clear Draft"
        message="Are you sure you want to clear the draft? This will reset all fields."
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={() => {
          clearDraft();
          setWeights({});
          setReps({});
          setDate(formatDate(new Date()));
          setVariant("A");
          setShowClearDraftModal(false);
        }}
        onCancel={() => setShowClearDraftModal(false)}
      />

      <CongratsModal
        isOpen={showCongratsModal}
        variant={savedVariant}
        sessionDate={savedSessionDate}
        onScheduleReminder={handleScheduleReminder}
        onSkip={handleSkipReminder}
      />
    </div>
  );
}
