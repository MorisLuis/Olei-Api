export interface ApplicationServer {
    start: () => Promise<void>;
    stop: () => Promise<void>;
}