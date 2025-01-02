"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeeting = exports.postMeeting = exports.updateMeeting = exports.getMeetingById = exports.getTotalMeetings = exports.getMeetings = void 0;
const meetingsServices_1 = require("../services/meetingsServices");
const bitacoraValidations_1 = require("../validations/bitacoraValidations");
const getMeetings = async (req, res, next) => {
    try {
        const { PageNumber, meetginOrderCondition, FilterCliente, TipoContacto, Id_Cliente, FilterTipoContacto } = bitacoraValidations_1.getMeetingsQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const meeting = await (0, meetingsServices_1.getMeetingsService)({
            PageNumber,
            sessionId,
            MeetingOrderCondition: meetginOrderCondition,
            FilterTipoContacto: FilterTipoContacto,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente: FilterCliente
        });
        res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getMeetings = getMeetings;
const getTotalMeetings = async (req, res, next) => {
    try {
        const { TipoContacto, Id_Cliente, FilterCliente, FilterTipoContacto } = bitacoraValidations_1.getTotalMeetingsQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const total = await (0, meetingsServices_1.getTotalMeetingsService)({
            sessionId,
            TipoContacto: TipoContacto,
            Id_Cliente: Id_Cliente ?? 0,
            FilterCliente,
            FilterTipoContacto
        });
        res.json(total);
    }
    catch (error) {
        next(error);
    }
};
exports.getTotalMeetings = getTotalMeetings;
const getMeetingById = async (req, res, next) => {
    try {
        const { id } = bitacoraValidations_1.getMeetingByIdParmsSchema.parse(req.params);
        const sessionId = req.sessionRedis;
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
        const { id } = bitacoraValidations_1.getMeetingByIdParmsSchema.parse(req.params);
        const body = bitacoraValidations_1.updateBitacoraBodySchema.parse(req.body.body);
        const sessionId = req.sessionRedis;
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
        const body = bitacoraValidations_1.postBitacoraBodySchema.parse(req.body.body);
        const sessionId = req.sessionRedis;
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
        const { id } = bitacoraValidations_1.getMeetingByIdParmsSchema.parse(req.params);
        const sessionId = req.sessionRedis;
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