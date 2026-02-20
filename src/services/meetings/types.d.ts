import type { MeetingOrderConditionType } from "../../interface/meeting"
import type { UserWebSessionInterface } from "../../interface/user"

interface getMeetingsServiceInterface {
    userSession: UserWebSessionInterface,
    PageNumber: number,
    Id_Cliente: number,
    TipoContacto: number,
    MeetingOrderCondition: MeetingOrderConditionType | string,
    FilterCliente: 0 | 1,
    searchTerm?: string
    status: number
    PageSize: number
}

interface getTotalMeetingsServiceInterface {
    userSession: UserWebSessionInterface,
    Id_Cliente: number,
    TipoContacto: number,
    FilterCliente: 0 | 1,
    FilterTipoContacto: 0 | 1
};
