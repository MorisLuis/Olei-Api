import { barcodes } from './codebarTypes';

interface BarcodeType {
    type: string;
    id: number;
    errorMessage: string;
    keyboardType: string;
    maxLength: number;
}

export const identifyBarcodeType = (codebar?: string): BarcodeType | null => {
    if (!codebar) return null; // Verificación rápida para cadenas undefined o null

    for (let i = barcodes.length - 1; i >= 0; i--) {
        let barcode = barcodes[i];
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

export const guessBarcodeType = (code: string) : boolean => {

    if (/^[0-9]{12}$/.test(code)) {
        //UPC-A
        return true;
    } else if (/^[0-9]{12,13}$/.test(code)) {
        //EAN-13
        return true;
    }

    return false;
};

export const verifyIfIsEAN13 = (code: string)  : boolean=> {

    //EAN13
    if (/^[0-9]{13}$/.test(code)) {
        return true;
    }

    return false;
};