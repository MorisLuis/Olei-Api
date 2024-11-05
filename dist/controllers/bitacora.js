"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeeting = exports.postMeeting = exports.updateMeeting = exports.getMeetingById = exports.getMeetings = void 0;
const meetingsServices_1 = require("../services/meetingsServices");
const getMeetings = async (req, res, next) => {
    try {
        const { PageNumber } = req.query;
        const sessionId = req.sessionID;
        const meeting = await (0, meetingsServices_1.getMeetingsService)(PageNumber, sessionId);
        res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getMeetings = getMeetings;
const getMeetingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sessionId = req.sessionID;
        const meeting = await (0, meetingsServices_1.getMeetingByIdService)(id, sessionId);
        res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getMeetingById = getMeetingById;
const updateMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const sessionId = req.sessionID;
        const meeting = await (0, meetingsServices_1.updateMeetingService)(id, sessionId, body);
        res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.updateMeeting = updateMeeting;
const postMeeting = async (req, res, next) => {
    try {
        const body = req.body;
        const sessionId = req.sessionID;
        const meeting = await (0, meetingsServices_1.postMeetingService)(sessionId, body);
        res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.postMeeting = postMeeting;
const deleteMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sessionId = req.sessionID;
        const meeting = await (0, meetingsServices_1.deleteMeetingService)(id, sessionId);
        res.json({
            meeting: `Reunion eliminada: ${meeting}`
        });
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.deleteMeeting = deleteMeeting;
//# sourceMappingURL=bitacora.js.map