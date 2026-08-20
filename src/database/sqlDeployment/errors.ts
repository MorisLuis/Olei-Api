const SENSITIVE_CONNECTION_VALUE = /(password|pwd|user(?:name)?|uid)\s*[:=]\s*("[^"]*"|'[^']*'|[^;,\s}]+)/gi;


/** 
 * @description Redacts sensitive connection information from deployment error messages. 
 * @example
 *  const error = new Error("Connection failed: password=secret; user=admin");
 *  const redactedMessage = getDeploymentErrorMessage(error);
 *  console.log(redactedMessage); // Output: "Connection failed: password=<redacted>; user=<redacted>"
 * @param {unknown} error - The error object to extract the message from.
 * @returns {string} The redacted error message.
*/
export const getDeploymentErrorMessage = (error: unknown): string => {
    const message = error instanceof Error ? error.message : 'Unknown deployment error';

    return message.replace(SENSITIVE_CONNECTION_VALUE, '$1=<redacted>');
};
