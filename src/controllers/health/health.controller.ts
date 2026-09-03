import type { Request, Response } from 'express';

import { errorResponse, successResponse } from '../../helpers/response';
import { isReady } from '../../services/health/health.service';

/**
 * @description Reports whether the API process is alive without checking dependencies.
 * @client Operations
 * @router GET /health/live
 * @response HTTP 200 with `{ status: "ok" }`.
 */
export const getLiveness = (req: Request, res: Response): Response =>
    successResponse(req, res, { status: 'live' });

/**
 * @description Reports whether startup completed and required SQL and Redis dependencies are available.
 * @client Operations
 * @router GET /health/ready
 * @response HTTP 200 when ready or HTTP 503 when unavailable, without exposing dependency details.
 */
export const getReadiness = (req: Request, res: Response): Response => {
    if (!isReady()) return errorResponse(res, 'Service unavailable', 503, 'readiness');
    return successResponse(req, res, { status: 'ready' });
};
