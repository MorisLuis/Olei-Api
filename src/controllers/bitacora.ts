import { NextFunction, Request, Response } from "express";
import { deleteMeetingService, getMeetingByIdService, getMeetingsService, postMeetingService, updateMeetingService } from "../services/meetingsServices";

const getMeetings = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { PageNumber } = req.query;
        const sessionId = req.sessionID;
        const meeting = await getMeetingsService(PageNumber as string, sessionId)
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
        res.json({
            meeting: `Reunion eliminada: ${meeting}`
        });
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