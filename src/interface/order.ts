import ProductInterface from "./product";

export default interface OrderInterface {
    products: ProductInterface[],
    Cantidad: number,
    Subtotal: number,
    Impuesto: number,
    Total: number,
    Folio: string,
    Fecha: string,
    Entregado: boolean
}
