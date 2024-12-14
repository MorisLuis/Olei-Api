"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeeting = exports.postMeeting = exports.updateMeeting = exports.getMeetingById = exports.getMeetings = void 0;
const meetingsServices_1 = require("../services/meetingsServices");
const meeting_1 = require("../interface/meeting");
const getMeetings = async (req, res, next) => {
    try {
        const { PageNumber, meetginOrderCondition, meetingFilterCondition, TipoContacto, Id_Cliente } = req.query;
        const sessionId = req.sessionID;
        let orderCondition;
        if (typeof meetginOrderCondition === 'string' && meeting_1.MeetingOrderCondition.includes(meetginOrderCondition)) {
            orderCondition = meetginOrderCondition;
        }
        else {
            orderCondition = "";
        }
        let filterCondtion;
        if (typeof meetingFilterCondition === 'string' && meeting_1.MeetingFilterCondition.includes(meetingFilterCondition)) {
            filterCondtion = meetingFilterCondition;
        }
        else {
            filterCondtion = "";
        }
        const meeting = await (0, meetingsServices_1.getMeetingsService)({
            PageNumber: Number(PageNumber),
            sessionId,
            MeetingOrderCondition: orderCondition,
            MeetingFilterCondition: filterCondtion,
            TipoContacto: TipoContacto ? Number(TipoContacto) : 0,
            Id_Cliente: Number(Id_Cliente)
        });
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
        res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.deleteMeeting = deleteMeeting;
//# sourceMappingURL=bitacora.js.map