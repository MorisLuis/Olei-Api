import { sanitizeServerSessionUser } from "../../../controllers/auth/utils/sessionResponse";
import { generateAccessToken, generateRefreshToken } from "./token.service";
import type { refreshAppParams, refreshAppResponse } from "./types";

/**
 * @description Refreshes the access token and refresh token for the authenticated user.
 * Return the new access token, refresh token, and sanitized user information in the response.
 * The sanitized user is the session stored in login database and login app.
 * @param params - An object containing the session ID and the user session object.
 * @throws {Error} Throws an error if the session ID or session object is not provided.
 * @returns An object containing the sanitized user information, new access token, and new refresh token.
 * @example
 * const { user, token, refreshToken } = refreshAppService({ sessionId, session });
 * res.json({ user, token, refreshToken });
 */

export const refreshAppService = (params: refreshAppParams): refreshAppResponse => {

    const { sessionId, session } = params;

    const newToken = generateAccessToken(sessionId)
    const newRefreshToken = generateRefreshToken(sessionId);

    return {
        user: sanitizeServerSessionUser(session),
        token: newToken,
        refreshToken: newRefreshToken
    }
}