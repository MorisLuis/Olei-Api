import type { typeTipoDoc } from "../interface/sells"

export const formatTipoDoc = (tipoDoc: typeTipoDoc ) : string => {
    let titleDocument = ''

    if(tipoDoc === 1 ) titleDocument = 'Facturas'
    if(tipoDoc === 2 ) titleDocument = 'Remisión'
    
    return titleDocument
}