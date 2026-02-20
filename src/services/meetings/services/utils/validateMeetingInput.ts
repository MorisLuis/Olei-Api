import { ValidationError } from "../../../../errors/CustomError";
import type MeetingInterface from "../../../../interface/meeting";
import { validTipoContacto } from "../../../../interface/meeting";

export const validateMeetingInput = (body: MeetingInterface) : void => {

    if (!validTipoContacto.includes(body.TipoContacto)) {
        throw new ValidationError('Invalid contact type');
    }

    if (!body.Id_Cliente) {
        throw new ValidationError('Client id is required');
    }

    if (!body.Fecha) {
        throw new ValidationError('Date is required');
    }

    if (!body.Hour || !body.HourEnd) {
        throw new ValidationError('Start and end time are required');
    }
};
