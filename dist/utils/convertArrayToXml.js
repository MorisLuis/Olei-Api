"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertArrayToXml = void 0;
const xmlbuilder = __importStar(require("xmlbuilder"));
// Función para convertir un arreglo de objetos o un solo objeto a XML
const convertArrayToXml = (data) => {
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
    }
    catch (error) {
        console.error("Error converting to XML:", error);
        return undefined;
    }
};
exports.convertArrayToXml = convertArrayToXml;
//# sourceMappingURL=convertArrayToXml.js.map