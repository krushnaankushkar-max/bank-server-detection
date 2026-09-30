import { AgentType, SystemLog } from '../types/dpi';

export class LogManager {
  private logs: SystemLog[] = [];
  private listeners: ((log: SystemLog) => void)[] = [];
  private readonly maxLogs = 500;

  public addLog(entry: Omit<SystemLog, 'id' | 'timestamp'>): SystemLog {
    const now = new Date();
    // Format timestamp nicely like 00:00:01
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}.${ms}`;

    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: formattedTime,
      ...entry,
    };

    this.logs.unshift(newLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.listeners.forEach((fn) => fn(newLog));
    return newLog;
  }

  public getLogs(): SystemLog[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
  }

  public subscribe(listener: (log: SystemLog) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
