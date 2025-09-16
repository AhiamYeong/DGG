import { useCallback } from 'react';
import { useApiState } from './useApiState';

/**
 * 비동기 작업을 위한 공통 훅
 */
export function useAsyncOperation<T, P extends any[] = []>(
  asyncFunction: (...args: P) => Promise<T>
) {
  const apiState = useApiState<T>();

  const execute = useCallback(async (...args: P) => {
    try {
      apiState.setLoading(true);
      apiState.clearError();
      
      const result = await asyncFunction(...args);
      apiState.setData(result);
      
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      apiState.setError(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      apiState.setLoading(false);
    }
  }, [asyncFunction, apiState]);

  return {
    ...apiState,
    execute,
  };
}
