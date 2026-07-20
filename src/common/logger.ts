import { LogLevel } from "./levels";

class Logger {
  private format(level: LogLevel, message: string) {
    const time = new Date().toISOString();
    return `[${time}] [${level}] ${message}`;
  }

  public info(message: string) {
    console.info(this.format(LogLevel.INFO, message) + "\n");
  }

  public debug(message: string) {
    console.debug(this.format(LogLevel.DEBUG, message) + "\n");
  }

  public warn(message: string) {
    console.warn(this.format(LogLevel.WARN, message) + "\n");
  }

  public error(message: string) {
    console.error(this.format(LogLevel.ERROR, message) + "\n");
  }
}

export const logger = new Logger();
