import type { Request, Response } from 'express';

import { errorResponse, successResponse } from '../../helpers/response';
import { isReady } from '../../services/health/health.service';

export const getLiveness = (req: Request, res: Response): Response =>
    successResponse(req, res, { status: 'live' });

export const getReadiness = (req: Request, res: Response): Response => {
    if (!isReady()) return errorResponse(res, 'Service unavailable', 503, 'readiness');
    return successResponse(req, res, { status: 'ready' });
};
