
export interface getCalendarTaskByDayServiceInterface {
    userSession: UserWebSessionInterface;
    Day: string;
    Id_Cliente: number | null
    PageNumber: number
    limit: number
}

export interface TaskOfDay {
    id: string;
    title: string;
    start: string;
    end: string;
    tableType: string;
    idCliente: number;
    descripcion: string;
    folio: string;
    extendedProps: {
        Id_Bitacora: number | null;
    };
}


export interface getCalendarTaskByDayAndClientResponse {
    tasks: TaskOfDay[];
    TotalBitacora: number;
    TotalVentas: number;
}