
export default interface MeetingInterface {
    Id_Bitacora: number;
    Id_Almacen: number;
    Id_Cliente: number;
    Fecha: string;
    Descripcion: string;
    TipoContacto: number;
};

export type MeetingOrderCondition = 'Cliente' | 'Fecha' | 'TipoContacto';

export type MeetingFilterCondition = 'Cliente' | 'TipoContacto'