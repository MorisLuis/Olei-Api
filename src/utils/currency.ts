export const formatCurrency = (value: number | string): string => {
    // Crear formateador
    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(Number(value)); // $2,500.00
};
