import type { AbonoInterface } from "./types";

export interface AbonoRow extends Omit<AbonoInterface, "cliente" | "forma_de_pago"> {
    ClienteNombre: string | null;
    FormaPagoNombre: string | null;
}

export const mapAbono = (row: AbonoRow): AbonoInterface => ({
    Folio: row.Folio,
    Id_Almacen: row.Id_Almacen,
    Id_Cliente: row.Id_Cliente,
    Id_FormaPago: row.Id_FormaPago,
    Importe: row.Importe,
    Fecha: row.Fecha,
    cliente: row.ClienteNombre === null ? null : { Nombre: row.ClienteNombre },
    forma_de_pago: row.FormaPagoNombre === null ? null : { Nombre: row.FormaPagoNombre },
});
