import { useState, useEffect, useCallback } from 'react';
import type { Measurement } from '../types';
import { getMeasurements, addMeasurement, updateMeasurement, deleteMeasurement } from '../utils/storage';

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMeasurements(getMeasurements().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
    setLoading(false);
  }, []);

  const createMeasurement = useCallback((measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMeasurement: Measurement = {
      ...measurement,
      id: `measurement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (addMeasurement(newMeasurement)) {
      setMeasurements((prev) => [...prev, newMeasurement].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      return newMeasurement;
    }
    return null;
  }, []);

  const editMeasurement = useCallback((id: string, updates: Partial<Measurement>) => {
    if (updateMeasurement(id, updates)) {
      setMeasurements((prev) =>
        prev
          .map((m) => (m.id === id ? { ...m, ...updates } : m))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      return true;
    }
    return false;
  }, []);

  const removeMeasurement = useCallback((id: string) => {
    if (deleteMeasurement(id)) {
      setMeasurements((prev) => prev.filter((m) => m.id !== id));
      return true;
    }
    return false;
  }, []);

  const getMeasurementByDate = useCallback((date: string) => {
    return measurements.find((m) => m.date === date);
  }, [measurements]);

  const getLatestMeasurement = useCallback(() => {
    return measurements.length > 0 ? measurements[0] : null;
  }, [measurements]);

  return {
    measurements,
    loading,
    createMeasurement,
    editMeasurement,
    removeMeasurement,
    getMeasurementByDate,
    getLatestMeasurement,
  };
}
