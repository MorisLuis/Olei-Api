import crypto from "crypto";

/**
 * @description Normalizes the device ID by trimming whitespace, converting to uppercase, hashing with SHA-256, and returning the first 20 characters of the hash in uppercase.
 * 
 * Bussiness Rules:
 * This send just the first 20 characters of the hash to the database, so it can be stored and compared consistently.
 * Because in database the device ID is stored as a 20 character string, this function ensures that the device ID is normalized to match that format.
 * 
 * @param deviceId - The device ID to be normalized.
 * @throws {Error} Throws an error if the device ID is not provided or is invalid.
 * @returns {string} The normalized device ID.
 */

export const normalizeDeviceId = (deviceId: string): string => {
    return crypto
        .createHash("sha256")
        .update(deviceId.trim().toUpperCase())
        .digest("hex")
        .slice(0, 20)
        .toUpperCase();
};

//TODO: If this backend is used for web, we should consider using a different normalization method for web clients, 
// as the device ID may not be relevant or applicable in that context.