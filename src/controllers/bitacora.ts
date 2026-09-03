import type { NextFunction, Request, Response } from "express";
import { deleteMeetingService, getMeetingByIdService, getMeetingsService, getTotalMeetingsService, updateMeetingService } from "../services/meetings/meetingsServices";
import type MeetingInterface from "../interface/meeting";
import { getMeetingByIdParmsSchema, getMeetingsQuerySchema, getTotalMeetingsQuerySchema, postBitacoraBodySchema, updateBitacoraBodySchema } from "../validations/bitacoraValidations";
import { postMeetingService } from "../services/meetings/services/postMeetingService";

/** @description Returns filtered and paginated CRM meetings with their total count.
 * @client CRM
 * @router GET /api/meetings
 * @request Validated filters, search, ordering, status, and pagination; requires the CRM web tenant session.
 * @response JSON containing `meetings` and `total`; failures are forwarded to `next`.
 */
const getMeetings = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, meetingOrderCondition, FilterCliente, TipoContacto, Id_Cliente, searchTerm, status, PageSize } = getMeetingsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const { meetings, total } = await getMeetingsService({
            PageNumber,
            userSession,
            MeetingOrderCondition: meetingOrderCondition,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente: FilterCliente,
            searchTerm,
            status,
            PageSize
        });

        return res.json({
            meetings,
            total
        });
    } catch (error) {
        return next(error)
    };

};

/** @description Returns the total CRM meetings matching contact and client filters.
 * @client CRM
 * @router GET /api/meetings/total
 * @request Validated query filters; requires the CRM web tenant session.
 * @response JSON containing `total`; failures are forwarded to `next`.
 */
const getTotalMeetings = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { TipoContacto, Id_Cliente, FilterCliente, FilterTipoContacto } = getTotalMeetingsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const total = await getTotalMeetingsService({
            userSession,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente,
            FilterTipoContacto
        });

        return res.json({
            total
        });

    } catch (error) {
        return next(error);
    }
};

/** @description Returns one CRM meeting by identifier.
 * @client CRM
 * @router GET /api/meetings/:id
 * @request Validated `id` route parameter; requires the CRM web tenant session.
 * @response JSON containing `meeting`; failures are forwarded to `next`.
 */
const getMeetingById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { id } = getMeetingByIdParmsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const meeting = await getMeetingByIdService(id, userSession);
        return res.json({
            meeting
        });
    } catch (error) {
        return next(error)
    };

};

/** @description Updates one CRM meeting.
 * @client CRM
 * @router PUT /api/meetings/:id
 * @request Validated `id` route parameter and meeting body; requires the CRM web tenant session.
 * @response JSON with the service result; failures are forwarded to `next`.
 */
const updateMeeting = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { id } = getMeetingByIdParmsSchema.parse(req.params);
        const body = updateBitacoraBodySchema.parse(req.body) as MeetingInterface;
        const userSession = req.sessionWeb
        const meeting = await updateMeetingService(id, userSession, body)
        return res.json(meeting);
    } catch (error) {
        return next(error)
    };

};

/** @description Creates a CRM meeting.
 * @client CRM
 * @router POST /api/meetings
 * @request Validated meeting body; requires the CRM web tenant session.
 * @response HTTP 201 JSON with the created meeting result; failures are forwarded to `next`.
 */
const postMeeting = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const body = postBitacoraBodySchema.parse(req.body) as MeetingInterface;
        const userSession = req.sessionWeb;
        const meeting = await postMeetingService(userSession, body);
        return res.json(meeting);
    } catch (error) {
        return next(error)
    };

};

/** @description Deletes one CRM meeting.
 * @client CRM
 * @router DELETE /api/meetings/:id
 * @request Validated `id` route parameter; requires the CRM web tenant session.
 * @response JSON with the deletion result; failures are forwarded to `next`.
 */
const deleteMeeting = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { id } = getMeetingByIdParmsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const meeting = await deleteMeetingService(id, userSession)
        return res.json(meeting);

    } catch (error) {
        next(error)
    };

};

export {
    getMeetings,
    getTotalMeetings,
    getMeetingById,
    updateMeeting,
    postMeeting,
    deleteMeeting
}
