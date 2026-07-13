export interface ErrorResponse extends Error {
  statusCode?: number;
  debugMessage?: string;
}
