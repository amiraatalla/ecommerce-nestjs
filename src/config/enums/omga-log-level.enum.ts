/**
 * Ogma's eight different logging levels.
 */
 export enum OgmaLogLevel {
    /** No logs are displayed through Ogma. console.log will still work */
    OFF = 'OFF',
    /** For when you just want to type fun stuff but don't really want people to see it (usually). Colored with Magenta */
    SILLY = 'SILLY',
    /** great for long strings of errors and things going on. Colored with Green */
    VERBOSE = 'VERBOSE',
    /** Just like the name implies, debugging! Colored with Blue */
    DEBUG = 'DEBUG',
    /** For normal logging, nothing special here. Colored with Cyan. */
    INFO = 'INFO',
    /** For errors about things that may be a problem. Colored with Yellow. */
    WARN = 'WARN',
    /** For errors about things that are a problem. Colored with Red. */
    ERROR = 'ERROR',
    /** Yeah, you should call someone at 3AM if this log ever shows up. Colored with Red. */
    FATAL = 'FATAL',
}
