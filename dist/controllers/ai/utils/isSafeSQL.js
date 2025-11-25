"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSafeSQL = void 0;
function isSafeSQL(sql) {
    const forbidden = [
        "DELETE", "UPDATE", "INSERT", "DROP", "ALTER",
        "TRUNCATE", "CREATE", "EXEC", "MERGE", "GRANT", "REVOKE",
    ];
    const upper = sql.toUpperCase();
    if (!upper.includes("SELECT"))
        return false;
    return !forbidden.some(word => upper.includes(`${word} `) || upper.includes(`${word}(`));
}
exports.isSafeSQL = isSafeSQL;
//# sourceMappingURL=isSafeSQL.js.map