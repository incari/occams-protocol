import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMeasurements } from '../../hooks/useMeasurements';
import { formatDateDisplay } from '../../utils/dateUtils';

export function MeasurementList() {
  const { measurements, removeMeasurement } = useMeasurements();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) {
      return;
    }
    setDeletingId(id);
    removeMeasurement(id);
    setDeletingId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (measurements.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <div className="card mt-4 text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No measurements logged yet.</p>
          <Link to="/measurements/new" className="btn btn-primary inline-block">
            Log Your First Measurement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="flex items-center justify-between mb-6 mt-4">
        <h1 className="text-2xl font-bold">Body Measurements</h1>
        <Link to="/measurements/new" className="btn btn-primary">
          + Add
        </Link>
      </div>

      <div className="space-y-4">
        {measurements.map((measurement) => {
          const isExpanded = expandedId === measurement.id;
          return (
            <div key={measurement.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-lg">
                      {formatDateDisplay(measurement.date)}
                    </h3>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Weight</div>
                      <div className="font-semibold">
                        {measurement.weight} {measurement.weightUnit}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Body Fat</div>
                      <div className="font-semibold">{measurement.bodyFat}%</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Left Arm</div>
                          <div className="font-medium">
                            {measurement.measurements.leftArm} {measurement.measurementUnit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Right Arm</div>
                          <div className="font-medium">
                            {measurement.measurements.rightArm} {measurement.measurementUnit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Left Leg</div>
                          <div className="font-medium">
                            {measurement.measurements.leftLeg} {measurement.measurementUnit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Right Leg</div>
                          <div className="font-medium">
                            {measurement.measurements.rightLeg} {measurement.measurementUnit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Waist</div>
                          <div className="font-medium">
                            {measurement.measurements.waist} {measurement.measurementUnit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hip</div>
                          <div className="font-medium">
                            {measurement.measurements.hip} {measurement.measurementUnit}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => toggleExpand(measurement.id)}
                    className="btn btn-secondary text-sm"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                  <button
                    onClick={() => handleDelete(measurement.id)}
                    disabled={deletingId === measurement.id}
                    className="btn btn-danger text-sm"
                    aria-label="Delete measurement"
                  >
                    {deletingId === measurement.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
