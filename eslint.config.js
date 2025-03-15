import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    js.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            globals: {
                process: "readonly", // ✅ Para evitar el error de 'process' no definido
                setInterval: "readonly", // ✅ Agregar setInterval como global
                describe: "readonly",  // Agregar para Jest
                it: "readonly",        // Agregar para Jest
                test: "readonly",      // Agregar para Jest
                expect: "readonly",    // Agregar para Jest
            }
        },
        settings: {
            node: true // ✅ Especifica que el entorno es Node.js
        },
        plugins: {
            "@typescript-eslint": ts
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "warn"
        }
    }
];
