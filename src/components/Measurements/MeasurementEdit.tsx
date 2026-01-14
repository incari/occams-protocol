import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../../utils/dateUtils";
import {
  validateWeight,
  validateBodyFat,
  validateMeasurement,
  validateDate,
} from "../../utils/validation";
import { useMeasurements } from "../../hooks/useMeasurements";
import { useSettings } from "../../hooks/useSettings";
import type { BodyMeasurements } from "../../types";

export function MeasurementEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { measurements, loading, editMeasurement } = useMeasurements();
  const { settings } = useSettings();

  const [date, setDate] = useState(formatDate(new Date()));
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [measurementValues, setMeasurementValues] = useState<
    Record<keyof BodyMeasurements, string>
  >({
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
  const [notFound, setNotFound] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const measurementUnit = settings.unit === "kg" ? "cm" : "inches";
  const draftKey = `measurement-edit-draft-${id}`;

  // Load measurement data
  useEffect(() => {
    // Wait for measurements to load
    if (loading) return;

    if (!id) {
      setNotFound(true);
      return;
    }

    const measurement = measurements.find((m) => m.id === id);
    if (!measurement) {
      setNotFound(true);
      return;
    }

    // Check if there's a draft for this measurement
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setDate(draft.date || measurement.date);
        setWeight(draft.weight || measurement.weight.toString());
        setBodyFat(draft.bodyFat || measurement.bodyFat.toString());
        setMeasurementValues(
          draft.measurementValues || {
            leftArm: measurement.measurements.leftArm.toString(),
            rightArm: measurement.measurements.rightArm.toString(),
            leftLeg: measurement.measurements.leftLeg.toString(),
            rightLeg: measurement.measurements.rightLeg.toString(),
            waist: measurement.measurements.waist.toString(),
            hip: measurement.measurements.hip.toString(),
            chestWidth: measurement.measurements.chestWidth?.toString() || "",
          }
        );
        setHasDraft(true);
        return; // Use draft instead of original measurement data
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }

    // Load original measurement data if no draft
    setDate(measurement.date);
    setWeight(measurement.weight.toString());
    setBodyFat(measurement.bodyFat.toString());
    setMeasurementValues({
      leftArm: measurement.measurements.leftArm.toString(),
      rightArm: measurement.measurements.rightArm.toString(),
      leftLeg: measurement.measurements.leftLeg.toString(),
      rightLeg: measurement.measurements.rightLeg.toString(),
      waist: measurement.measurements.waist.toString(),
      hip: measurement.measurements.hip.toString(),
      chestWidth: measurement.measurements.chestWidth?.toString() || "",
    } as any);
  }, [id, measurements, draftKey, loading]);

  const handleMeasurementChange = (
    field: keyof BodyMeasurements,
    value: string
  ) => {
    setMeasurementValues((prev) => ({ ...prev, [field]: value }));
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
    if (!id) return;
    const draft = {
      date,
      weight,
      bodyFat,
      measurementValues,
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

  // Auto-save draft when values change
  useEffect(() => {
    if (!id) return;
    // Only auto-save if there's at least some data entered
    const hasData =
      weight !== "" ||
      bodyFat !== "" ||
      Object.values(measurementValues).some((v) => v !== "");
    if (hasData) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 1000); // Auto-save after 1 second of inactivity
      return () => clearTimeout(timeoutId);
    }
  }, [weight, bodyFat, measurementValues, date, id]);

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
    const validationFields: Array<{
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

    let hasError = false;
    const bodyMeasurements: Partial<BodyMeasurements> = {};
    let hasAtLeastOneField =
      weightValue !== undefined || bodyFatValue !== undefined;

    for (const field of validationFields) {
      const value = measurementValues[field.key];
      // Skip empty fields
      if (!value || !String(value).trim()) {
        continue;
      }
      hasAtLeastOneField = true;
      const validation = validateMeasurement(
        value,
        measurementUnit,
        field.label
      );
      if (!validation.valid) {
        setErrors((prev) => ({
          ...prev,
          [field.key]: validation.error || "",
        }));
        hasError = true;
      } else {
        bodyMeasurements[field.key] = validation.value!;
      }
    }

    if (hasError) {
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

    // Update measurement
    const success = editMeasurement(id, {
      date,
      weight: weightValue ?? 0,
      bodyFat: bodyFatValue ?? 0,
      measurements: {
        leftArm: bodyMeasurements.leftArm ?? 0,
        rightArm: bodyMeasurements.rightArm ?? 0,
        leftLeg: bodyMeasurements.leftLeg ?? 0,
        rightLeg: bodyMeasurements.rightLeg ?? 0,
        waist: bodyMeasurements.waist ?? 0,
        hip: bodyMeasurements.hip ?? 0,
        chestWidth: bodyMeasurements.chestWidth ?? 0,
      },
      measurementUnit,
      weightUnit: settings.unit,
    });

    if (success) {
      // Clear draft after successful save
      clearDraft();
      navigate("/measurements", {
        state: { message: "Measurement updated successfully!" },
      });
    } else {
      setErrors({ submit: "Failed to update measurement. Please try again." });
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
          <p className="text-gray-500 dark:text-gray-400">
            Measurement not found.
          </p>
          <button
            onClick={() => navigate("/measurements")}
            className="btn btn-primary mt-4"
          >
            Back to Measurements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 mt-4">Edit Body Measurement</h1>

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

        {/* Weight and Body Fat */}
        <div className="grid grid-cols-2 gap-4">
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
              placeholder={`Weight in ${settings.unit}`}
              className="input"
            />
            {errors.weight && (
              <p className="text-red-600 text-sm mt-1">{errors.weight}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="bodyFat"
              className="block text-sm font-medium mb-2"
            >
              Body Fat (%)
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
              placeholder="Body fat percentage"
              className="input"
            />
            {errors.bodyFat && (
              <p className="text-red-600 text-sm mt-1">{errors.bodyFat}</p>
            )}
          </div>
        </div>

        {/* Body Measurements */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Body Measurements ({measurementUnit})
          </label>
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
                value={measurementValues.leftArm}
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
                value={measurementValues.rightArm}
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
                value={measurementValues.leftLeg}
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
                value={measurementValues.rightLeg}
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
                value={measurementValues.waist}
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
                value={measurementValues.hip}
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
                value={measurementValues.chestWidth}
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

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/measurements")}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex-1"
          >
            {isSubmitting ? "Updating..." : "Update Measurement"}
          </button>
        </div>
      </form>
    </div>
  );
}
