export type ApiErrorInfo = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
};

export function toApiError(e: any): ApiErrorInfo {
  const isAxios = !!e && !!e.isAxiosError;
  if (isAxios && e.response) {
    const status = e.response.status;
    const data = e.response.data || {};
    const message = data.message || e.message || '요청 처리 중 오류가 발생했습니다.';
    const code = data.code || undefined;
    return { message, status, code, details: data };
  }
  return { message: e?.message || '요청 처리 중 오류가 발생했습니다.' };
}

export function throwApiError(e: any): never {
  const info = toApiError(e);
  // 필요 시 로깅 연동
  throw info;
}

