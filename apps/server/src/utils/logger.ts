import pc from "picocolors";

class Logger {
  info(message: string): void {
    console.log(pc.blue(`💡 [INFO] ${message}`));
  }

  success(message: string): void {
    console.log(pc.green(`✅ [SUCCESS] ${message}`));
  }

  warning(message: string): void {
    console.log(pc.yellow(`⚠️ [WARNING] ${message}`));
  }

  error(message: string): void {
    console.error(pc.red(`❌ [ERROR] ${message}`));
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(pc.magenta(`🐛 [DEBUG] ${message}`));
    }
  }
}

export const logger = new Logger();
