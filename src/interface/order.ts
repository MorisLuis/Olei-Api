
export default interface OrderInterface {
    Cantidad: number,
    Subtotal: number,
    Total: number,

    Fecha?: string,
    Entregado?: boolean,
    Cliente?: string,
    Vendedor?: string,
    Folio?: string
    TipoDoc?: number
}
