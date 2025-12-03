/**
 * Simple logging utility for the Polymarket bot
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {
    private logLevel: LogLevel;
    private logToFile: boolean;
    private logFile?: string;

    constructor(logLevel: LogLevel = LogLevel.INFO, logToFile: boolean = false) {
        this.logLevel = logLevel;
        this.logToFile = logToFile;
        
        if (logToFile) {
            const fs = require('fs');
            const path = require('path');
            const logDir = path.join(__dirname, '..', 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            this.logFile = path.join(logDir, `bot-${new Date().toISOString().split('T')[0]}.log`);
        }
    }

    private writeLog(level: string, message: string, data?: any): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
        
        if (this.logToFile && this.logFile) {
            const fs = require('fs');
            fs.appendFileSync(this.logFile, logMessage + '\n');
        }
        
        // Always log to console
        console.log(logMessage);
    }

    debug(message: string, data?: any): void {
        if (this.logLevel <= LogLevel.DEBUG) {
            this.writeLog('DEBUG', message, data);
        }
    }

    info(message: string, data?: any): void {
        if (this.logLevel <= LogLevel.INFO) {
            this.writeLog('INFO', message, data);
        }
    }

    warn(message: string, data?: any): void {
        if (this.logLevel <= LogLevel.WARN) {
            this.writeLog('WARN', message, data);
        }
    }

    error(message: string, error?: any): void {
        if (this.logLevel <= LogLevel.ERROR) {
            const errorData = error instanceof Error 
                ? { message: error.message, stack: error.stack }
                : error;
            this.writeLog('ERROR', message, errorData);
        }
    }
}

// Default logger instance
export const logger = new Logger(
    process.env.LOG_LEVEL === 'DEBUG' ? LogLevel.DEBUG :
    process.env.LOG_LEVEL === 'WARN' ? LogLevel.WARN :
    process.env.LOG_LEVEL === 'ERROR' ? LogLevel.ERROR :
    LogLevel.INFO,
    process.env.LOG_TO_FILE === 'true'
);

