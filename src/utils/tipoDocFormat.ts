import type { typeTipoDoc } from "../interface/sells"

export const formatTipoDoc = (tipoDoc: typeTipoDoc ) : string => {
    let titleDocument = ''

    if(tipoDoc === 1 ) titleDocument = 'Facturas'
    if(tipoDoc === 2 ) titleDocument = 'Remisión'
    if(tipoDoc === 3 ) titleDocument = 'Pedidos'
    if(tipoDoc === 4 ) titleDocument = 'Cotización'
    if(tipoDoc === 6 ) titleDocument = 'Otros'

    return titleDocument
}