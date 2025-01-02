import { NextFunction, Request, Response } from "express";
import { deleteMeetingService, getMeetingByIdService, getMeetingsService, getTotalMeetingsService, postMeetingService, updateMeetingService } from "../services/meetingsServices";
import MeetingInterface from "../interface/meeting";
import { getMeetingByIdParmsSchema, getMeetingsQuerySchema, getTotalMeetingsQuerySchema, postBitacoraBodySchema, updateBitacoraBodySchema } from "../validations/bitacoraValidations";

const getMeetings = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { PageNumber, meetginOrderCondition, FilterCliente, TipoContacto, Id_Cliente, FilterTipoContacto } = getMeetingsQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;

        const meeting = await getMeetingsService({
            PageNumber,
            sessionId,
            MeetingOrderCondition: meetginOrderCondition,
            FilterTipoContacto: FilterTipoContacto,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente: FilterCliente
        });

        res.json(meeting);
    } catch (error) {
        next(error)
    };

};

const getTotalMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { TipoContacto, Id_Cliente, FilterCliente, FilterTipoContacto } = getTotalMeetingsQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;

        const total = await getTotalMeetingsService({
            sessionId,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente,
            FilterTipoContacto
        });

        res.json(total);

    } catch (error) {
        next(error);
    }
};

const getMeetingById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = getMeetingByIdParmsSchema.parse(req.params);
        const sessionId = req.sessionRedis;
        const meeting = await getMeetingByIdService(id, sessionId);
        res.json(meeting);
    } catch (error) {
        next(error)
    };

};

const updateMeeting = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = getMeetingByIdParmsSchema.parse(req.params);
        const body = updateBitacoraBodySchema.parse(req.body.body) as MeetingInterface;
        const sessionId = req.sessionRedis
        const meeting = await updateMeetingService(id, sessionId, body)
        res.json(meeting);
    } catch (error) {
        next(error)
    };

};

const postMeeting = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const body = postBitacoraBodySchema.parse(req.body.body) as MeetingInterface;

        const sessionId = req.sessionRedis;
        const meeting = await postMeetingService(sessionId, body);
        res.json(meeting);
    } catch (error) {
        next(error)
    };

};

const deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = getMeetingByIdParmsSchema.parse(req.params);
        const sessionId = req.sessionRedis;
        const meeting = await deleteMeetingService(id, sessionId)
        res.json(meeting);

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