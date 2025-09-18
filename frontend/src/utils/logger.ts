// 통합된 로깅 시스템

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
}

class Logger {
  private config: LogConfig;

  constructor() {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
      enableConsole: true,
      enableFile: false
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage('DEBUG', message, data);
      if (this.config.enableConsole) {
        console.log(formatted);
      }
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage('INFO', message, data);
      if (this.config.enableConsole) {
        console.info(formatted);
      }
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage('WARN', message, data);
      if (this.config.enableConsole) {
        console.warn(formatted);
      }
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage('ERROR', message, error);
      if (this.config.enableConsole) {
        console.error(formatted);
      }
    }
  }

  // API 관련 로깅
  apiRequest(url: string, method: string, data?: any): void {
    this.debug(`API 요청: ${method} ${url}`, data);
  }

  apiResponse(url: string, status: number, data?: any): void {
    this.debug(`API 응답: ${status} ${url}`, data);
  }

  apiError(url: string, error: any): void {
    this.error(`API 에러: ${url}`, error);
  }

  // 지도 관련 로깅
  mapAction(action: string, data?: any): void {
    this.debug(`지도 액션: ${action}`, data);
  }

  // 검색 관련 로깅
  searchAction(action: string, query?: string, data?: any): void {
    this.info(`검색 액션: ${action}`, { query, ...data });
  }

  // 경로 관련 로깅
  routeAction(action: string, data?: any): void {
    this.info(`경로 액션: ${action}`, data);
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();

// 편의 함수들
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: any) => logger.error(message, error),
  api: {
    request: (url: string, method: string, data?: any) => logger.apiRequest(url, method, data),
    response: (url: string, status: number, data?: any) => logger.apiResponse(url, status, data),
    error: (url: string, error: any) => logger.apiError(url, error)
  },
  map: (action: string, data?: any) => logger.mapAction(action, data),
  search: (action: string, query?: string, data?: any) => logger.searchAction(action, query, data),
  route: (action: string, data?: any) => logger.routeAction(action, data)
};
