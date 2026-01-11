import { useState } from 'react';
import { validateHeight, validateWeight } from '../../utils/validation';
import { updateUserProfile } from '../../utils/storage';
import { useSettings } from '../../hooks/useSettings';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { settings } = useSettings();
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inches'>('cm');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate name
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Name is required' }));
      setIsSubmitting(false);
      return;
    }

    // Validate height
    const heightValidation = validateHeight(height, heightUnit);
    if (!heightValidation.valid) {
      setErrors((prev) => ({ ...prev, height: heightValidation.error || '' }));
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

    // Convert height to cm if needed
    let heightInCm = heightValidation.value!;
    if (heightUnit === 'inches') {
      heightInCm = heightInCm * 2.54;
    }

    // Convert weight to kg if needed
    let weightInKg = weightValidation.value!;
    if (settings.unit === 'lbs') {
      weightInKg = weightInKg * 0.453592;
    }

    // Save user profile
    const success = updateUserProfile({
      name: name.trim(),
      height: heightInCm,
      initialWeight: weightInKg,
      heightUnit,
      weightUnit: settings.unit,
      onboardingCompleted: true,
    });

    if (success) {
      onComplete();
    } else {
      setErrors({ submit: 'Failed to save profile. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Welcome to Occam's Protocol
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's get started by setting up your profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.name;
                      return newErrors;
                    });
                  }
                }}
                placeholder="Enter your name"
                className="input"
                required
                autoFocus
              />
              {errors.name && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Height */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="height" className="block text-sm font-medium">
                  Height
                </label>
                <select
                  value={heightUnit}
                  onChange={(e) => {
                    setHeightUnit(e.target.value as 'cm' | 'inches');
                    setHeight('');
                    if (errors.height) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.height;
                        return newErrors;
                      });
                    }
                  }}
                  className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="cm">cm</option>
                  <option value="inches">inches</option>
                </select>
              </div>
              <input
                type="number"
                id="height"
                step="0.1"
                min="0"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  if (errors.height) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.height;
                      return newErrors;
                    });
                  }
                }}
                placeholder={`Enter height in ${heightUnit}`}
                className="input"
                required
              />
              {errors.height && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.height}</p>}
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium mb-2">
                Initial Weight ({settings.unit})
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
              {errors.weight && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.weight}</p>}
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
            {isSubmitting ? 'Setting up...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
