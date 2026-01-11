import { useState } from 'react';
import { useSessions } from '../../hooks/useSessions';
import { formatDateDisplay } from '../../utils/dateUtils';
import type { Variant } from '../../types';

export function SessionList() {
  const { sessions, removeSession } = useSessions();
  const [filter, setFilter] = useState<'all' | 'A' | 'B'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSessions = sessions.filter(
    (s) => filter === 'all' || s.variant === filter
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }
    setDeletingId(id);
    removeSession(id);
    setDeletingId(null);
  };

  const getVariantColor = (variant: Variant) => {
    return variant === 'A' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
  };

  if (sessions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <div className="card mt-4 text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No training sessions yet.</p>
          <a href="/log" className="btn btn-primary inline-block">
            Log Your First Session
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="flex items-center justify-between mb-6 mt-4">
        <h1 className="text-2xl font-bold">Session History</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-secondary text-sm ${filter === 'all' ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('A')}
            className={`btn btn-secondary text-sm ${filter === 'A' ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}
          >
            Option A
          </button>
          <button
            onClick={() => setFilter('B')}
            className={`btn btn-secondary text-sm ${filter === 'B' ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}
          >
            Option B
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div key={session.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getVariantColor(session.variant)}`}>
                    Option {session.variant}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDateDisplay(session.date)}
                  </span>
                </div>
                <div className="space-y-1">
                  {session.exercises.map((exercise, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{exercise.name}:</span>{' '}
                      <span className="text-gray-600 dark:text-gray-400">
                        {exercise.weight} {exercise.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleDelete(session.id)}
                disabled={deletingId === session.id}
                className="btn btn-danger text-sm ml-4"
                aria-label="Delete session"
              >
                {deletingId === session.id ? '...' : '🗑️'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="card mt-4 text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No sessions found for this filter.
          </p>
        </div>
      )}
    </div>
  );
}
