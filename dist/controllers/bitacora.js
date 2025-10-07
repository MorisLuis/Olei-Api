"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeeting = exports.postMeeting = exports.updateMeeting = exports.getMeetingById = exports.getTotalMeetings = exports.getMeetings = void 0;
const meetingsServices_1 = require("../services/meetingsServices");
const bitacoraValidations_1 = require("../validations/bitacoraValidations");
const getMeetings = async (req, res, next) => {
    try {
        const { PageNumber, meetingOrderCondition, FilterCliente, TipoContacto, Id_Cliente, searchTerm, status } = bitacoraValidations_1.getMeetingsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { meetings, total } = await (0, meetingsServices_1.getMeetingsService)({
            PageNumber,
            userSession,
            MeetingOrderCondition: meetingOrderCondition,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente: FilterCliente,
            searchTerm,
            status
        });
        return res.json({
            meetings,
            total
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getMeetings = getMeetings;
const getTotalMeetings = async (req, res, next) => {
    try {
        const { TipoContacto, Id_Cliente, FilterCliente, FilterTipoContacto } = bitacoraValidations_1.getTotalMeetingsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const total = await (0, meetingsServices_1.getTotalMeetingsService)({
            userSession,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente,
            FilterTipoContacto
        });
        return res.json({
            total
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getTotalMeetings = getTotalMeetings;
const getMeetingById = async (req, res, next) => {
    try {
        const { id } = bitacoraValidations_1.getMeetingByIdParmsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const meeting = await (0, meetingsServices_1.getMeetingByIdService)(id, userSession);
        return res.json({
            meeting
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getMeetingById = getMeetingById;
const updateMeeting = async (req, res, next) => {
    try {
        const { id } = bitacoraValidations_1.getMeetingByIdParmsSchema.parse(req.params);
        const body = bitacoraValidations_1.updateBitacoraBodySchema.parse(req.body);
        const userSession = req.sessionWeb;
        const meeting = await (0, meetingsServices_1.updateMeetingService)(id, userSession, body);
        return res.json(meeting);
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.updateMeeting = updateMeeting;
const postMeeting = async (req, res, next) => {
    try {
        const body = bitacoraValidations_1.postBitacoraBodySchema.parse(req.body);
        const userSession = req.sessionWeb;
        const meeting = await (0, meetingsServices_1.postMeetingService)(userSession, body);
        return res.json(meeting);
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.postMeeting = postMeeting;
const deleteMeeting = async (req, res, next) => {
    try {
        const { id } = bitacoraValidations_1.getMeetingByIdParmsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const meeting = await (0, meetingsServices_1.deleteMeetingService)(id, userSession);
        return res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.deleteMeeting = deleteMeeting;
//# sourceMappingURL=bitacora.js.map