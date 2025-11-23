"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
/**
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param data - Data to be sent in the response
 * @param message - Optional message to be sent in the response
 * @param status - Optional HTTP status code (default is 200)
 * @param info - Optional pagination information
 * @returns
 * A JSON response with the following structure:
 * {
 *   success: true,
 *   message: string,
 *   data: any,
 *   info?: {
 *     totalItems: number,
 *     itemsPerPage: number,
 *     pages: {
 *       current: number,
 *       totalPages: number,
 *       next: number | null,
 *       previous: number | null
 *     }
 *   },
 *   lang: string
 * }
 */
const successResponse = (req, res, data, message = "Operation successful", status = 200, info) => {
    let next, previous;
    if (info) {
        next = info.pages.current + 1;
        if (next > info.pages.totalPages) {
            next = null;
        }
        previous = info.pages.current - 1;
        if (previous < 1) {
            previous = 1;
        }
        info = {
            ...info,
            pages: {
                ...info.pages,
                next,
                previous,
            },
        };
    }
    return res.status(status).json({
        success: true,
        message,
        data,
        info
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, errorMessage, status = 500, resource = undefined) => {
    return res.status(status).json({
        success: false,
        error: {
            code: status,
            message: errorMessage,
            resource,
        },
    });
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=response.js.map