import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import { validateWeight, validateDate, validateBodyFat, validateMeasurement } from '../../utils/validation';
import { useMeasurements } from '../../hooks/useMeasurements';
import { useSettings } from '../../hooks/useSettings';
import type { BodyMeasurements } from '../../types';

export function MeasurementForm() {
  const navigate = useNavigate();
  const { createMeasurement, getLatestMeasurement } = useMeasurements();
  const { settings } = useSettings();
  
  const [date, setDate] = useState(formatDate(new Date()));
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState<'cm' | 'inches'>('cm');
  const [measurements, setMeasurements] = useState<BodyMeasurements>({
    leftArm: '',
    rightArm: '',
    leftLeg: '',
    rightLeg: '',
    waist: '',
    hip: '',
  } as any);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load previous measurement for reference (optional - user can edit)
  useEffect(() => {
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
      } as any);
    }
  }, []);

  const handleMeasurementChange = (field: keyof BodyMeasurements, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate date
    const dateValidation = validateDate(date);
    if (!dateValidation.valid) {
      setErrors((prev) => ({ ...prev, date: dateValidation.error || '' }));
      setIsSubmitting(false);
      return;
    }

    // Validate weight
    const weightValidation = validateWeight(weight);
    if (!weightValidation.valid) {
      setErrors((prev) => ({ ...prev, weight: weightValidation.error || '' }));
      setIsSubmitting(false);
      return;
    }

    // Validate body fat
    const bodyFatValidation = validateBodyFat(bodyFat);
    if (!bodyFatValidation.valid) {
      setErrors((prev) => ({ ...prev, bodyFat: bodyFatValidation.error || '' }));
      setIsSubmitting(false);
      return;
    }

    // Validate all measurements
    const measurementFields: Array<{ key: keyof BodyMeasurements; label: string }> = [
      { key: 'leftArm', label: 'Left Arm' },
      { key: 'rightArm', label: 'Right Arm' },
      { key: 'leftLeg', label: 'Left Leg' },
      { key: 'rightLeg', label: 'Right Leg' },
      { key: 'waist', label: 'Waist' },
      { key: 'hip', label: 'Hip' },
    ];

    const validatedMeasurements: Partial<BodyMeasurements> = {};
    let hasErrors = false;

    for (const { key, label } of measurementFields) {
      const value = measurements[key];
      const validation = validateMeasurement(value, measurementUnit, label);
      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, [key]: validation.error || '' }));
        hasErrors = true;
      } else {
        validatedMeasurements[key] = validation.value!;
      }
    }

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    // Create measurement
    const measurement = createMeasurement({
      date,
      weight: weightValidation.value!,
      bodyFat: bodyFatValidation.value!,
      measurements: validatedMeasurements as BodyMeasurements,
      measurementUnit,
      weightUnit: settings.unit,
    });

    if (measurement) {
      navigate('/measurements', { state: { message: 'Measurement logged successfully!' } });
    } else {
      setErrors({ submit: 'Failed to save measurement. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 mt-4">Log Body Measurement</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-2">
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
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>

        {/* Basic Info Section */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium mb-2">
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
                required
              />
              {errors.weight && <p className="text-red-600 text-sm mt-1">{errors.weight}</p>}
            </div>

            {/* Body Fat */}
            <div>
              <label htmlFor="bodyFat" className="block text-sm font-medium mb-2">
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
                required
              />
              {errors.bodyFat && <p className="text-red-600 text-sm mt-1">{errors.bodyFat}</p>}
            </div>
          </div>
        </div>

        {/* Body Measurements Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Body Measurements</h2>
            <select
              value={measurementUnit}
              onChange={(e) => setMeasurementUnit(e.target.value as 'cm' | 'inches')}
              className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="cm">cm</option>
              <option value="inches">inches</option>
            </select>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="leftArm" className="block text-sm font-medium mb-2">
                  Left Arm
                </label>
                <input
                  type="number"
                  id="leftArm"
                  step="0.1"
                  min="0"
                  value={measurements.leftArm}
                  onChange={(e) => handleMeasurementChange('leftArm', e.target.value)}
                  placeholder={`Left arm in ${measurementUnit}`}
                  className="input"
                  required
                />
                {errors.leftArm && <p className="text-red-600 text-sm mt-1">{errors.leftArm}</p>}
              </div>

              <div>
                <label htmlFor="rightArm" className="block text-sm font-medium mb-2">
                  Right Arm
                </label>
                <input
                  type="number"
                  id="rightArm"
                  step="0.1"
                  min="0"
                  value={measurements.rightArm}
                  onChange={(e) => handleMeasurementChange('rightArm', e.target.value)}
                  placeholder={`Right arm in ${measurementUnit}`}
                  className="input"
                  required
                />
                {errors.rightArm && <p className="text-red-600 text-sm mt-1">{errors.rightArm}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="leftLeg" className="block text-sm font-medium mb-2">
                  Left Leg
                </label>
                <input
                  type="number"
                  id="leftLeg"
                  step="0.1"
                  min="0"
                  value={measurements.leftLeg}
                  onChange={(e) => handleMeasurementChange('leftLeg', e.target.value)}
                  placeholder={`Left leg in ${measurementUnit}`}
                  className="input"
                  required
                />
                {errors.leftLeg && <p className="text-red-600 text-sm mt-1">{errors.leftLeg}</p>}
              </div>

              <div>
                <label htmlFor="rightLeg" className="block text-sm font-medium mb-2">
                  Right Leg
                </label>
                <input
                  type="number"
                  id="rightLeg"
                  step="0.1"
                  min="0"
                  value={measurements.rightLeg}
                  onChange={(e) => handleMeasurementChange('rightLeg', e.target.value)}
                  placeholder={`Right leg in ${measurementUnit}`}
                  className="input"
                  required
                />
                {errors.rightLeg && <p className="text-red-600 text-sm mt-1">{errors.rightLeg}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="waist" className="block text-sm font-medium mb-2">
                Waist
              </label>
              <input
                type="number"
                id="waist"
                step="0.1"
                min="0"
                value={measurements.waist}
                onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                placeholder={`Waist in ${measurementUnit}`}
                className="input"
                required
              />
              {errors.waist && <p className="text-red-600 text-sm mt-1">{errors.waist}</p>}
            </div>

            <div>
              <label htmlFor="hip" className="block text-sm font-medium mb-2">
                Hip
              </label>
              <input
                type="number"
                id="hip"
                step="0.1"
                min="0"
                value={measurements.hip}
                onChange={(e) => handleMeasurementChange('hip', e.target.value)}
                placeholder={`Hip in ${measurementUnit}`}
                className="input"
                required
              />
              {errors.hip && <p className="text-red-600 text-sm mt-1">{errors.hip}</p>}
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
          {isSubmitting ? 'Saving...' : 'Save Measurement'}
        </button>
      </form>
    </div>
  );
}
