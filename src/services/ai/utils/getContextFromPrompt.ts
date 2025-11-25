export function getContextFromPrompt(userPrompt: string) {
    const lower = userPrompt.toLowerCase();

    if (/(venta|factura|ticket)/.test(lower))
        return "💰 Contexto detectado: VENTAS → usa vistas que contengan 'Venta'.";

    if (/(compra|proveedor|pedido)/.test(lower))
        return "💼 Contexto detectado: COMPRAS → usa vistas que contengan 'Compra'.";

    if (/(existencia|stock|inventario)/.test(lower))
        return "📦 Contexto detectado: EXISTENCIAS → usa vistas que contengan 'Existencia'.";

    if (/(cliente)/.test(lower))
        return "👥 Contexto detectado: CLIENTES → usa vistas que contengan 'Cliente'.";

    return "ℹ️ Contexto general: puedes usar cualquier vista disponible.";
}

