import * as xmlbuilder from 'xmlbuilder';

// Definir un tipo genérico para los datos de entrada
type XmlData = Record<string, string | number | boolean | null | undefined>;

// Función para convertir un arreglo de objetos o un solo objeto a XML
export const convertArrayToXml = (data: XmlData | XmlData[]): string | undefined => {
    try {        
        // Crear el nodo raíz 'Root'
        const root = xmlbuilder.create('Root');
    
        // Manejar el caso en el que `data` es un solo objeto
        const dataArray = Array.isArray(data) ? data : [data];

        // Agregar cada objeto del arreglo como un nodo 'Item'
        dataArray.forEach((item) => {
            const itemElement = root.ele('Item');
            Object.entries(item).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    itemElement.ele(key, value.toString());
                }
            });
        });
    
        // Convertir el objeto XML a una cadena con formato
        return root.end({ pretty: true, indent: '    ', newline: '\n' });
    } catch (error) {
        console.error("Error converting to XML:", error);
        return undefined;
    }
};
