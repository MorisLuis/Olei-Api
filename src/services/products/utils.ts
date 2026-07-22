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