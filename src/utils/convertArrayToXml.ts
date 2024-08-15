import * as xmlbuilder from 'xmlbuilder';

// Función para convertir un arreglo de objetos o un solo objeto a XML
export const convertArrayToXml = (data: any | any[]): string => {

    try {        
        // Crear el nodo raíz 'Root'
        const root = xmlbuilder.create('Root');
    
        // Manejar el caso en el que `data` es un solo objeto
        if (!Array.isArray(data)) {
            data = [data];
        }
    
        // Agregar cada objeto del arreglo como un nodo 'Item'
        data.forEach((item: any) => {
            const itemElement = root.ele('Item');
            for (const [key, value] of Object.entries(item)) {
                //@ts-ignore
                itemElement.ele(key, value);
            }
        });
    
        // Convertir el objeto XML a una cadena con formato
        return root.end({ pretty: true, indent: '        ', newline: '\n' });
    } catch (error: any) {
        console.log({error})
        return error
    }

};
