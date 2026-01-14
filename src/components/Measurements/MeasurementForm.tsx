import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { WarningModal } from "../Modal/WarningModal";
import { formatDate } from "../../utils/dateUtils";
import {
  validateWeight,
  validateDate,
  validateBodyFat,
  validateMeasurement,
} from "../../utils/validation";
import { useMeasurements } from "../../hooks/useMeasurements";
import { useSettings } from "../../hooks/useSettings";
import type { BodyMeasurements } from "../../types";

const DRAFT_KEY = "measurement-draft";

export function MeasurementForm() {
  const navigate = useNavigate();
  const { createMeasurement, getLatestMeasurement } = useMeasurements();
  const { settings } = useSettings();

  const [date, setDate] = useState(formatDate(new Date()));
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState<"cm" | "inches">("cm");
  const [measurements, setMeasurements] = useState<BodyMeasurements>({
    leftArm: "",
    rightArm: "",
    leftLeg: "",
    rightLeg: "",
    waist: "",
    hip: "",
    chestWidth: "",
  } as any);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showClearDraftModal, setShowClearDraftModal] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setDate(draft.date || formatDate(new Date()));
        setWeight(draft.weight || "");
        setBodyFat(draft.bodyFat || "");
        setMeasurementUnit(draft.measurementUnit || "cm");
        setMeasurements(
          draft.measurements || {
            leftArm: "",
            rightArm: "",
            leftLeg: "",
            rightLeg: "",
            waist: "",
            hip: "",
            chestWidth: "",
          }
        );
        setHasDraft(true);
        return; // Don't load latest measurement if draft exists
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }

    // Load previous measurement for reference only if no draft
    const latest = getLatestMeasurement();
    if (latest && !weight) {
      // Only pre-fill if form is empty
      setWeight(latest.weight.toString());
      setBodyFat(latest.bodyFat.toString());
      setMeasurementUnit(latest.measurementUnit);
      setMeasurements({
        leftArm: latest.measurements.leftArm.toString(),
        rightArm: latest.measurements.rightArm.toString(),
        leftLeg: latest.measurements.leftLeg.toString(),
        rightLeg: latest.measurements.rightLeg.toString(),
        waist: latest.measurements.waist.toString(),
        hip: latest.measurements.hip.toString(),
        chestWidth: latest.measurements.chestWidth?.toString() || "",
      } as any);
    }
  }, []);

  const handleMeasurementChange = (
    field: keyof BodyMeasurements,
    value: string
  ) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      date,
      weight,
      bodyFat,
      measurementUnit,
      measurements,
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

  // Auto-save draft when values change
  useEffect(() => {
    // Only auto-save if there's at least some data entered
    const hasData =
      weight !== "" ||
      bodyFat !== "" ||
      Object.values(measurements).some((v) => v !== "");
    if (hasData) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 1000); // Auto-save after 1 second of inactivity
      return () => clearTimeout(timeoutId);
    }
  }, [weight, bodyFat, measurements, measurementUnit, date]);

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

    // Validate weight - only if filled
    let weightValue: number | undefined;
    if (weight.trim()) {
      const weightValidation = validateWeight(weight);
      if (!weightValidation.valid) {
        setErrors((prev) => ({
          ...prev,
          weight: weightValidation.error || "",
        }));
        setIsSubmitting(false);
        return;
      }
      weightValue = weightValidation.value;
    }

    // Validate body fat - only if filled
    let bodyFatValue: number | undefined;
    if (bodyFat.trim()) {
      const bodyFatValidation = validateBodyFat(bodyFat);
      if (!bodyFatValidation.valid) {
        setErrors((prev) => ({
          ...prev,
          bodyFat: bodyFatValidation.error || "",
        }));
        setIsSubmitting(false);
        return;
      }
      bodyFatValue = bodyFatValidation.value;
    }

    // Validate all measurements - only if filled
    const measurementFields: Array<{
      key: keyof BodyMeasurements;
      label: string;
    }> = [
      { key: "leftArm", label: "Left Arm" },
      { key: "rightArm", label: "Right Arm" },
      { key: "leftLeg", label: "Left Leg" },
      { key: "rightLeg", label: "Right Leg" },
      { key: "waist", label: "Waist" },
      { key: "hip", label: "Hip" },
      { key: "chestWidth", label: "Chest Width" },
    ];

    const validatedMeasurements: Partial<BodyMeasurements> = {};
    let hasErrors = false;
    let hasAtLeastOneField =
      weightValue !== undefined || bodyFatValue !== undefined;

    for (const { key, label } of measurementFields) {
      const value = measurements[key];
      // Skip empty fields
      if (!value || !String(value).trim()) {
        continue;
      }
      hasAtLeastOneField = true;
      const validation = validateMeasurement(value, measurementUnit, label);
      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, [key]: validation.error || "" }));
        hasErrors = true;
      } else {
        validatedMeasurements[key] = validation.value!;
      }
    }

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    // Need at least one field to save
    if (!hasAtLeastOneField) {
      setErrors((prev) => ({
        ...prev,
        submit: "Please fill in at least one field",
      }));
      setIsSubmitting(false);
      return;
    }

    // Create measurement
    const measurement = createMeasurement({
      date,
      weight: weightValue ?? 0,
      bodyFat: bodyFatValue ?? 0,
      measurements: {
        leftArm: validatedMeasurements.leftArm ?? 0,
        rightArm: validatedMeasurements.rightArm ?? 0,
        leftLeg: validatedMeasurements.leftLeg ?? 0,
        rightLeg: validatedMeasurements.rightLeg ?? 0,
        waist: validatedMeasurements.waist ?? 0,
        hip: validatedMeasurements.hip ?? 0,
        chestWidth: validatedMeasurements.chestWidth ?? 0,
      },
      measurementUnit,
      weightUnit: settings.unit,
    });

    if (measurement) {
      // Clear draft after successful save
      clearDraft();
      navigate("/measurements", {
        state: { message: "Measurement logged successfully!" },
      });
    } else {
      setErrors({ submit: "Failed to save measurement. Please try again." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 mt-4">Log Body Measurement</h1>

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

        {/* Basic Info Section */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            {/* Weight */}
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium mb-2"
              >
                Weight ({settings.unit})
              </label>
              <input
                type="number"
                id="weight"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  if (errors.weight) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.weight;
                      return newErrors;
                    });
                  }
                }}
                placeholder={`Enter weight in ${settings.unit}`}
                className="input"
              />
              {errors.weight && (
                <p className="text-red-600 text-sm mt-1">{errors.weight}</p>
              )}
            </div>

            {/* Body Fat */}
            <div>
              <label
                htmlFor="bodyFat"
                className="block text-sm font-medium mb-2"
              >
                Body Fat Percentage (%)
              </label>
              <input
                type="number"
                id="bodyFat"
                step="0.1"
                min="0"
                max="100"
                value={bodyFat}
                onChange={(e) => {
                  setBodyFat(e.target.value);
                  if (errors.bodyFat) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.bodyFat;
                      return newErrors;
                    });
                  }
                }}
                placeholder="Enter body fat percentage"
                className="input"
              />
              {errors.bodyFat && (
                <p className="text-red-600 text-sm mt-1">{errors.bodyFat}</p>
              )}
            </div>
          </div>
        </div>

        {/* Body Measurements Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Body Measurements</h2>
            <select
              value={measurementUnit}
              onChange={(e) =>
                setMeasurementUnit(e.target.value as "cm" | "inches")
              }
              className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="cm">cm</option>
              <option value="inches">inches</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="leftArm"
                  className="block text-sm font-medium mb-2"
                >
                  Left Arm
                </label>
                <input
                  type="number"
                  id="leftArm"
                  step="0.1"
                  min="0"
                  value={measurements.leftArm}
                  onChange={(e) =>
                    handleMeasurementChange("leftArm", e.target.value)
                  }
                  placeholder={`Left arm in ${measurementUnit}`}
                  className="input"
                />
                {errors.leftArm && (
                  <p className="text-red-600 text-sm mt-1">{errors.leftArm}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rightArm"
                  className="block text-sm font-medium mb-2"
                >
                  Right Arm
                </label>
                <input
                  type="number"
                  id="rightArm"
                  step="0.1"
                  min="0"
                  value={measurements.rightArm}
                  onChange={(e) =>
                    handleMeasurementChange("rightArm", e.target.value)
                  }
                  placeholder={`Right arm in ${measurementUnit}`}
                  className="input"
                />
                {errors.rightArm && (
                  <p className="text-red-600 text-sm mt-1">{errors.rightArm}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="leftLeg"
                  className="block text-sm font-medium mb-2"
                >
                  Left Leg
                </label>
                <input
                  type="number"
                  id="leftLeg"
                  step="0.1"
                  min="0"
                  value={measurements.leftLeg}
                  onChange={(e) =>
                    handleMeasurementChange("leftLeg", e.target.value)
                  }
                  placeholder={`Left leg in ${measurementUnit}`}
                  className="input"
                />
                {errors.leftLeg && (
                  <p className="text-red-600 text-sm mt-1">{errors.leftLeg}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rightLeg"
                  className="block text-sm font-medium mb-2"
                >
                  Right Leg
                </label>
                <input
                  type="number"
                  id="rightLeg"
                  step="0.1"
                  min="0"
                  value={measurements.rightLeg}
                  onChange={(e) =>
                    handleMeasurementChange("rightLeg", e.target.value)
                  }
                  placeholder={`Right leg in ${measurementUnit}`}
                  className="input"
                />
                {errors.rightLeg && (
                  <p className="text-red-600 text-sm mt-1">{errors.rightLeg}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="waist"
                className="block text-sm font-medium mb-2"
              >
                Waist
              </label>
              <input
                type="number"
                id="waist"
                step="0.1"
                min="0"
                value={measurements.waist}
                onChange={(e) =>
                  handleMeasurementChange("waist", e.target.value)
                }
                placeholder={`Waist in ${measurementUnit}`}
                className="input"
              />
              {errors.waist && (
                <p className="text-red-600 text-sm mt-1">{errors.waist}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="hip"
                className="block text-sm font-medium mb-2"
              >
                Hip
              </label>
              <input
                type="number"
                id="hip"
                step="0.1"
                min="0"
                value={measurements.hip}
                onChange={(e) => handleMeasurementChange("hip", e.target.value)}
                placeholder={`Hip in ${measurementUnit}`}
                className="input"
              />
              {errors.hip && (
                <p className="text-red-600 text-sm mt-1">{errors.hip}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="chestWidth"
                className="block text-sm font-medium mb-2"
              >
                Chest Width
              </label>
              <input
                type="number"
                id="chestWidth"
                step="0.1"
                min="0"
                value={measurements.chestWidth}
                onChange={(e) =>
                  handleMeasurementChange("chestWidth", e.target.value)
                }
                placeholder={`Chest width in ${measurementUnit}`}
                className="input"
              />
              {errors.chestWidth && (
                <p className="text-red-600 text-sm mt-1">{errors.chestWidth}</p>
              )}
            </div>
          </div>
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
          {isSubmitting ? "Saving..." : "Save Measurement"}
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
          setWeight("");
          setBodyFat("");
          setMeasurements({
            leftArm: "",
            rightArm: "",
            leftLeg: "",
            rightLeg: "",
            waist: "",
            hip: "",
            chestWidth: "",
          } as unknown as BodyMeasurements);
          setDate(formatDate(new Date()));
          setShowClearDraftModal(false);
        }}
        onCancel={() => setShowClearDraftModal(false)}
      />
    </div>
  );
}
