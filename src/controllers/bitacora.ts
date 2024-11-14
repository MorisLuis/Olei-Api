import { NextFunction, Request, Response } from "express";
import { deleteMeetingService, getMeetingByIdService, getMeetingsService, postMeetingService, updateMeetingService } from "../services/meetingsServices";
import { MeetingFilterCondition, MeetingFilterConditionType, MeetingOrderCondition, MeetingOrderConditionType } from "../interface/meeting";

const getMeetings = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { PageNumber, meetginOrderCondition, meetingFilterCondition, TipoContacto, Id_Cliente } = req.query;
        const sessionId = req.sessionID;


        let orderCondition: MeetingOrderConditionType | string;
        if (typeof meetginOrderCondition === 'string' && MeetingOrderCondition.includes(meetginOrderCondition as MeetingOrderConditionType)) {
            orderCondition = meetginOrderCondition;
        } else {
            orderCondition = ""
        }

        let filterCondtion: MeetingFilterConditionType | string;
        if (typeof meetingFilterCondition === 'string' && MeetingFilterCondition.includes(meetingFilterCondition as MeetingFilterConditionType)) {
            filterCondtion = meetingFilterCondition;
        } else {
            filterCondtion = ""
        }
    
        const meeting = await getMeetingsService({
            PageNumber: Number(PageNumber),
            sessionId,
            MeetingOrderCondition: orderCondition,
            MeetingFilterCondition: filterCondtion,
            TipoContacto: TipoContacto ? Number(TipoContacto) : 0,
            Id_Cliente: Number(Id_Cliente)
        });

        res.json(meeting);
    } catch (error) {
        next(error)
    };

};

const getMeetingById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = req.params;
        const sessionId = req.sessionID;
        const meeting = await getMeetingByIdService(id, sessionId);
        res.json(meeting);
    } catch (error) {
        next(error)
    };

};

const updateMeeting = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = req.params;
        const body = req.body
        const sessionId = req.sessionID
        const meeting = await updateMeetingService(id, sessionId, body)
        res.json(meeting);
    } catch (error) {
        next(error)
    };

};

const postMeeting = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const body = req.body
        const sessionId = req.sessionID;
        const meeting = await postMeetingService(sessionId, body)
        res.json(meeting);
    } catch (error) {
        next(error)
    };

};

const deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = req.params;
        const sessionId = req.sessionID;
        const meeting = await deleteMeetingService(id, sessionId)
        res.json(meeting);

    } catch (error) {
        next(error)
    };

};

export {
    getMeetings,
    getMeetingById,
    updateMeeting,
    postMeeting,
    deleteMeeting
}