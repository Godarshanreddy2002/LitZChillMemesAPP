export default class Logger {
    private static instance: Logger;
 
    private constructor() {} // Prevent instantiation
 
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
 
    //  Helper function to get caller location (file path & line number)
    private static getCallerLocation(): string {
        const stack = new Error().stack;
        if (stack) {
            const stackLines = stack.split("\n");
            const callerInfo = stackLines[2] ? stackLines[2].trim() : "Unknown location";
            return callerInfo;
        }
        return "Unknown location";
    }
 
    log(message: string) {
        const callerLocation = Logger.getCallerLocation();
        console.log(`[LOG] [${new Date().toISOString()}] ${callerLocation} - ${message}`);
    }
 
    warn(message: string) {
        const callerLocation = Logger.getCallerLocation();
        console.warn(`[WARN] [${new Date().toISOString()}] ${callerLocation} - ${message}`);
    }
 
    error(message: string) {
        const callerLocation = Logger.getCallerLocation();
        console.error(`[ERROR] [${new Date().toISOString()}] ${callerLocation} - ${message}`);
    }
 
    info(message: string) {
        const callerLocation = Logger.getCallerLocation();
        console.info(`[INFO] [${new Date().toISOString()}] ${callerLocation} - ${message}`);
    }
}
 