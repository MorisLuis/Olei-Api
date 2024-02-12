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
    Piezas: number;
    Impto: number;
    imagen: [{
        url: string,
        id: number
    }];
}