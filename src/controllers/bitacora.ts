import { NextFunction, Request, Response } from "express";
import { deleteMeetingService, getMeetingByIdService, getMeetingsService, getTotalMeetingsService, postMeetingService, updateMeetingService } from "../services/meetingsServices";
import MeetingInterface from "../interface/meeting";
import { getMeetingByIdParmsSchema, getMeetingsQuerySchema, getTotalMeetingsQuerySchema, postBitacoraBodySchema, updateBitacoraBodySchema } from "../validations/bitacoraValidations";

const getMeetings = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, meetingOrderCondition, FilterCliente, TipoContacto, Id_Cliente, FilterTipoContacto } = getMeetingsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const meetings = await getMeetingsService({
            PageNumber,
            userSession,
            MeetingOrderCondition: meetingOrderCondition,
            FilterTipoContacto: FilterTipoContacto,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente: FilterCliente
        });

        return res.json({
            meetings
        });
    } catch (error) {
        return next(error)
    };

};

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