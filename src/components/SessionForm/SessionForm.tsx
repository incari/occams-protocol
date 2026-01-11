import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import { validateWeight, validateDate, validateVariant } from '../../utils/validation';
import { useSessions } from '../../hooks/useSessions';
import { useSettings } from '../../hooks/useSettings';
import { EXERCISES, type Variant } from '../../types';

export function SessionForm() {
  const navigate = useNavigate();
  const { createSession } = useSessions();
  const { settings } = useSettings();
  
  const [date, setDate] = useState(formatDate(new Date()));
  const [variant, setVariant] = useState<Variant>('A');
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exercises = EXERCISES[variant];

  useEffect(() => {
    // Initialize weights with empty strings
    const initialWeights: Record<string, string> = {};
    exercises.forEach((exercise) => {
      initialWeights[exercise] = '';
    });
    setWeights(initialWeights);
    setErrors({});
  }, [variant]);

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

    // Validate variant
    const variantValidation = validateVariant(variant);
    if (!variantValidation.valid) {
      setErrors((prev) => ({ ...prev, variant: variantValidation.error || '' }));
      setIsSubmitting(false);
      return;
    }

    // Validate all weights
    const exerciseList = exercises.map((exercise) => {
      const weightValue = weights[exercise] || '';
      const validation = validateWeight(weightValue);
      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, [exercise]: validation.error || '' }));
        return null;
      }
      return {
        name: exercise,
        weight: validation.value!,
        unit: settings.unit,
      };
    });

    if (exerciseList.some((e) => e === null)) {
      setIsSubmitting(false);
      return;
    }

    // Create session
    const session = createSession({
      date,
      variant,
      exercises: exerciseList.filter((e): e is NonNullable<typeof e> => e !== null),
    });

    if (session) {
      navigate('/history', { state: { message: 'Session logged successfully!' } });
    } else {
      setErrors({ submit: 'Failed to save session. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 mt-4">Log Training Session</h1>

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

        {/* Variant Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Training Variant</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setVariant('A')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                variant === 'A'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="font-semibold mb-2">Option A</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {EXERCISES.A.join(', ')}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setVariant('B')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                variant === 'B'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="font-semibold mb-2">Option B</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {EXERCISES.B.join(', ')}
              </div>
            </button>
          </div>
          {errors.variant && <p className="text-red-600 text-sm mt-1">{errors.variant}</p>}
        </div>

        {/* Weight Inputs */}
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-3">
            Weights ({settings.unit})
          </label>
          {exercises.map((exercise) => (
            <div key={exercise}>
              <label htmlFor={`weight-${exercise}`} className="block text-sm font-medium mb-2">
                {exercise}
              </label>
              <input
                type="number"
                id={`weight-${exercise}`}
                step="0.5"
                min="0"
                value={weights[exercise] || ''}
                onChange={(e) => handleWeightChange(exercise, e.target.value)}
                placeholder={`Enter weight in ${settings.unit}`}
                className="input"
                required
              />
              {errors[exercise] && (
                <p className="text-red-600 text-sm mt-1">{errors[exercise]}</p>
              )}
            </div>
          ))}
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
          {isSubmitting ? 'Saving...' : 'Save Session'}
        </button>
      </form>
    </div>
  );
}
