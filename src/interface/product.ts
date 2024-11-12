export default interface PorductInterface {
    Descripcion: string;
    Id_Familia: number
    Codigo: string;
    Familia: string;
    CodigoPrecio: string;
    Precio: number;
    CodigoExsitencia: string;
    Existencia: number;
    Id_Almacen: number;
    Marca: string;
    Id_Marca: number;
    Id_ListaPrecios: number;
    Cantidad: number;
    Impuesto: number;
    imagen: string;   
    imagenes: Image[]
}

export interface ProductInterfaceBag {
    Codigo: string;
    Id_Marca: number;
    Cantidad: number;
    Existencia: number;

    Descripcion?: string;
    Marca?: string;
    key?: number
}


interface Image {
    url: string;
    id: number;
}
