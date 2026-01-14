import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { WarningModal } from "../Modal/WarningModal";
import { formatDate } from "../../utils/dateUtils";
import {
  validateWeight,
  validateDate,
  validateVariant,
} from "../../utils/validation";
import { useSessions } from "../../hooks/useSessions";
import { useSettings } from "../../hooks/useSettings";
import { EXERCISES, type Variant } from "../../types";

export function SessionEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { sessions, loading, editSession } = useSessions();
  const { settings } = useSettings();

  const [date, setDate] = useState(formatDate(new Date()));
  const [variant, setVariant] = useState<Variant>("A");
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [reps, setReps] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showClearDraftModal, setShowClearDraftModal] = useState(false);

  const exercises = EXERCISES[variant];
  const draftKey = `session-edit-draft-${id}`;

  // Load session data
  useEffect(() => {
    // Wait for sessions to load
    if (loading) return;

    if (!id) {
      setNotFound(true);
      return;
    }

    const session = sessions.find((s) => s.id === id);
    if (!session) {
      setNotFound(true);
      return;
    }

    // Check if there's a draft for this session
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setDate(draft.date || session.date);
        setVariant(draft.variant || session.variant);
        setWeights(draft.weights || {});
        setReps(draft.reps || {});
        setHasDraft(true);
        return; // Use draft instead of original session data
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }

    // Load original session data if no draft
    setDate(session.date);
    setVariant(session.variant);

    const initialWeights: Record<string, string> = {};
    const initialReps: Record<string, string> = {};

    session.exercises.forEach((exercise) => {
      initialWeights[exercise.name] = exercise.weight.toString();
      if (exercise.reps) {
        initialReps[exercise.name] = exercise.reps.toString();
      }
    });

    setWeights(initialWeights);
    setReps(initialReps);
  }, [id, sessions, draftKey, loading]);

  // Initialize weights when variant changes
  useEffect(() => {
    const initialWeights: Record<string, string> = {};
    const initialReps: Record<string, string> = {};
    exercises.forEach((exercise) => {
      if (!weights[exercise]) {
        initialWeights[exercise] = "";
      } else {
        initialWeights[exercise] = weights[exercise];
      }
      if (exercise.toLowerCase().includes("kettlebell")) {
        initialReps[exercise] = reps[exercise] || "";
      }
    });
    setWeights((prev) => ({ ...prev, ...initialWeights }));
    setReps((prev) => ({ ...prev, ...initialReps }));
  }, [variant]);

  // Save draft to localStorage
  const saveDraft = () => {
    if (!id) return;
    const draft = {
      date,
      variant,
      weights,
      reps,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setHasDraft(true);
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    if (!id) return;
    localStorage.removeItem(draftKey);
    setHasDraft(false);
  };

  // Auto-save draft when weights or reps change
  useEffect(() => {
    if (!id) return;
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
  }, [weights, reps, date, variant, id]);

  const handleWeightChange = (exercise: string, value: string) => {
    setWeights((prev) => ({ ...prev, [exercise]: value }));
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
    if (errors[`${exercise}-reps`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${exercise}-reps`];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!id) return;

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

    // Update session
    const success = editSession(id, {
      date,
      variant,
      exercises: exerciseList,
    });

    if (success) {
      // Clear draft after successful save
      clearDraft();
      navigate("/history", {
        state: { message: "Session updated successfully!" },
      });
    } else {
      setErrors({ submit: "Failed to update session. Please try again." });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
        <div className="card mt-4 text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
        <div className="card mt-4 text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Session not found.</p>
          <button
            onClick={() => navigate("/history")}
            className="btn btn-primary mt-4"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 mt-4">Edit Training Session</h1>

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
            Workout Variant
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

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex-1"
          >
            {isSubmitting ? "Updating..." : "Update Session"}
          </button>
        </div>

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
        message="Are you sure you want to clear the draft? This will reload the original session data."
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={() => {
          clearDraft();
          // Reload original session data
          const session = sessions.find((s) => s.id === id);
          if (session) {
            setDate(session.date);
            setVariant(session.variant);
            const initialWeights: Record<string, string> = {};
            const initialReps: Record<string, string> = {};
            session.exercises.forEach((exercise) => {
              initialWeights[exercise.name] = exercise.weight.toString();
              if (exercise.reps) {
                initialReps[exercise.name] = exercise.reps.toString();
              }
            });
            setWeights(initialWeights);
            setReps(initialReps);
          }
          setShowClearDraftModal(false);
        }}
        onCancel={() => setShowClearDraftModal(false)}
      />
    </div>
  );
}
