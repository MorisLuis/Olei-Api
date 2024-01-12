

export default interface InventoryInterface {
    Id_Almacen: number,
    Folio: number,
    Id_TipoMovInv: number,
    Estado: number,
    Fecha: Date,
    Id_AlmacenDest: number,
    SwPendiente: number,
    Descripcion: string,
    Id_Usuario: number,
    SwTr: number,
    FechaRecepcion: number,
    FolioReq: number,
    AlmReq: number

    //PENDING
    Cantidad?: number,
}