export function isSafeSQL(sql: string): boolean {
    const forbidden = [
        "DELETE", "UPDATE", "INSERT", "DROP", "ALTER",
        "TRUNCATE", "CREATE", "EXEC", "MERGE", "GRANT", "REVOKE",
    ];

    const upper = sql.toUpperCase();
    if (!upper.includes("SELECT")) return false;

    return !forbidden.some(word =>
        upper.includes(`${word} `) || upper.includes(`${word}(`)
    );
}
