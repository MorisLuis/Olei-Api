"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyIfIsEAN13 = exports.guessBarcodeType = exports.identifyBarcodeType = void 0;
const codebarTypes_1 = require("./codebarTypes");
const identifyBarcodeType = (codebar) => {
    if (!codebar)
        return null; // Verificación rápida para cadenas undefined o null
    for (let i = codebarTypes_1.barcodes.length - 1; i >= 0; i--) {
        let barcode = codebarTypes_1.barcodes[i];
        let regex = new RegExp(barcode.regex);
        if (regex.test(codebar)) {
            return {
                type: barcode.type,
                id: barcode.id,
                errorMessage: barcode.errorMessage,
                keyboardType: barcode.keyboardType,
                maxLength: barcode.maxLength
            };
        }
    }
    return null;
};
exports.identifyBarcodeType = identifyBarcodeType;
const guessBarcodeType = (code) => {
    if (/^[0-9]{12}$/.test(code)) {
        //UPC-A
        return true;
    }
    else if (/^[0-9]{12,13}$/.test(code)) {
        //EAN-13
        return true;
    }
    return false;
};
exports.guessBarcodeType = guessBarcodeType;
const verifyIfIsEAN13 = (code) => {
    //EAN13
    if (/^[0-9]{13}$/.test(code)) {
        return true;
    }
    return false;
};
exports.verifyIfIsEAN13 = verifyIfIsEAN13;
//# sourceMappingURL=identifyBarcodeType.js.map