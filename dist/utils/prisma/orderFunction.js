"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrder = void 0;
function buildOrder(order, defaultField) {
    if (order?.field && order?.direction) {
        if (order.field.includes('.')) {
            // ejemplo: "cliente.Nombre"
            const [relation, field] = order.field.split('.');
            return {
                [relation]: {
                    [field]: order.direction,
                },
            };
        }
        return { [order.field]: order.direction };
    }
    return { [defaultField]: 'asc' };
}
exports.buildOrder = buildOrder;
//# sourceMappingURL=orderFunction.js.map