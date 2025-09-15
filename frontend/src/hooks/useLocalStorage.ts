import { useState, useEffect } from 'react'

/**
 * 로컬 스토리지를 React 상태로 관리하는 커스텀 훅
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  // 초기값을 가져오는 함수
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`로컬 스토리지에서 ${key} 읽기 실패:`, error)
      return initialValue
    }
  })

  // 값을 설정하는 함수
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`로컬 스토리지에 ${key} 저장 실패:`, error)
    }
  }

  return [storedValue, setValue]
}
