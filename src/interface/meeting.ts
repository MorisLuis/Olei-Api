export default interface MeetingInterface {
    Nombre: string;
    Id_Bitacora: number;
    Id_Almacen?: number;
    Id_Cliente?: number;
    Fecha: Date;
    Hour: string | undefined;
    HourEnd: string | undefined;
    Descripcion: string;
    TipoContacto: 0 | 1 | 2 | 3 | 4;
    Comentarios?: string;
    status: boolean
};

export const validTipoContacto: Array<MeetingInterface['TipoContacto']> = [0, 1, 2, 3, 4];

export type MeetingOrderConditionType = 'Cliente' | 'Fecha' | 'TipoContacto';
export const MeetingOrderCondition : MeetingOrderConditionType[] = ['Cliente' , 'Fecha' , 'TipoContacto']

export type MeetingFilterConditionType = 'Cliente' | 'TipoContacto'
export const MeetingFilterCondition : MeetingFilterConditionType[] = ['Cliente', 'TipoContacto']
