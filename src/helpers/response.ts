import { Response, Request } from "express"
import { InfoSuccessResponse } from "./types"

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

export const successResponse = (
    req: Request,
    res: Response,
    data: any,
    message: string = "Operation successful",
    status: number = 200,
    info?: InfoSuccessResponse | undefined
) => {
    let next, previous
    if (info) {
        next = info.pages.current + 1
        if (next > info.pages.totalPages) {
            next = null
        }

        previous = info.pages.current - 1
        if (previous < 1) {
            previous = 1
        }

        info = {
            ...info,
            pages: {
                ...info.pages,
                next,
                previous,
            },
        }
    }

    return res.status(status).json({
        success: true,
        message,
        data,
        info
    })
}

export const errorResponse = (
    res: Response,
    errorMessage: string,
    status: number = 500,
    resource: string | undefined = undefined
) => {
    return res.status(status).json({
        success: false,
        error: {
            code: status,
            message: errorMessage,
            resource,
        },
    })
}