import { useState, useCallback } from 'react';

// API 상태 관리 공통 훅
interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiActions<T> {
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * API 상태 관리를 위한 공통 훅
 */
export function useApiState<T>(initialData: T | null = null): ApiState<T> & ApiActions<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    setData,
    setLoading,
    setError,
    clearError,
    reset,
  };
}
