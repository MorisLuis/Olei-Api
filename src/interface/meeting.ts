
export default interface MeetingInterface {
    Id_Bitacora: number;
    Id_Almacen: number;
    Id_Cliente: number;
    Fecha: string;
    Descripcion: string;
    TipoContacto: 1 | 2 | 3 | 4;
};
export const validTipoContacto: Array<MeetingInterface['TipoContacto']> = [1, 2, 3, 4];

export type MeetingOrderConditionType = 'Cliente' | 'Fecha' | 'TipoContacto';
export const MeetingOrderCondition : MeetingOrderConditionType[] = ['Cliente' , 'Fecha' , 'TipoContacto']

export type MeetingFilterConditionType = 'Cliente' | 'TipoContacto'
export const MeetingFilterCondition : MeetingFilterConditionType[] = ['Cliente', 'TipoContacto']
