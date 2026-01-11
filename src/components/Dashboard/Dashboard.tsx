import { useSessions } from '../../hooks/useSessions';
import { useSettings } from '../../hooks/useSettings';
import { useMeasurements } from '../../hooks/useMeasurements';
import { getUserProfile } from '../../utils/storage';
import { formatDateDisplay } from '../../utils/dateUtils';
import { startOfMonth } from 'date-fns';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { sessions } = useSessions();
  const { settings } = useSettings();
  const { getLatestMeasurement } = useMeasurements();
  const userProfile = getUserProfile();

  const totalSessions = sessions.length;
  const thisMonth = sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    const monthStart = startOfMonth(new Date());
    return sessionDate >= monthStart;
  }).length;

  const lastSession = sessions[0]; // Already sorted by date (newest first)

  // Calculate personal records
  const personalRecords: Record<string, number> = {};
  sessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      const key = exercise.name;
      if (!personalRecords[key] || exercise.weight > personalRecords[key]) {
        personalRecords[key] = exercise.weight;
      }
    });
  });

  const stats = [
    { label: 'Total Sessions', value: totalSessions },
    { label: 'This Month', value: thisMonth },
    { label: 'Last Training', value: lastSession ? formatDateDisplay(lastSession.date) : 'Never' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      {userProfile?.name && (
        <div className="mb-4 mt-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome, {userProfile.name}!
          </h1>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 mt-4">Dashboard</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Latest Measurement */}
      {getLatestMeasurement() && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Latest Measurement</h2>
            <Link to="/measurements" className="text-sm text-primary-600 dark:text-primary-400">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Weight</div>
              <div className="font-semibold">
                {getLatestMeasurement()!.weight} {getLatestMeasurement()!.weightUnit}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Body Fat</div>
              <div className="font-semibold">{getLatestMeasurement()!.bodyFat}%</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
              <div className="font-semibold text-sm">
                {formatDateDisplay(getLatestMeasurement()!.date)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <Link to="/log" className="btn btn-primary w-full block text-center">
            Log New Session
          </Link>
          <Link to="/measurements/new" className="btn btn-secondary w-full block text-center">
            Log Body Measurement
          </Link>
          <Link to="/calendar" className="btn btn-secondary w-full block text-center">
            View Calendar
          </Link>
        </div>
      </div>

      {/* Personal Records */}
      {Object.keys(personalRecords).length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Personal Records</h2>
          <div className="space-y-2">
            {Object.entries(personalRecords).map(([exercise, weight]) => (
              <div key={exercise} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <span className="font-medium">{exercise}</span>
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {weight} {settings.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Sessions</h2>
            <Link to="/history" className="text-sm text-primary-600 dark:text-primary-400">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {sessions.slice(0, 3).map((session) => (
              <div key={session.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{formatDateDisplay(session.date)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    session.variant === 'A' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  }`}>
                    Option {session.variant}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {session.exercises.map((e) => e.name).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
