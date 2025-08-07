"use strict";
// server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("../database/connection");
// Rutas
const productRouter_1 = __importDefault(require("../routes/productRouter"));
const authRouter_1 = __importDefault(require("../routes/authRouter"));
const searchRouter_1 = __importDefault(require("../routes/searchRouter"));
const tablesRouter_1 = __importDefault(require("../routes/tablesRouter"));
const orderRouter_1 = __importDefault(require("../routes/orderRouter"));
const clientRouter_1 = __importDefault(require("../routes/clientRouter"));
const inventoryRouter_1 = __importDefault(require("../routes/inventoryRouter"));
const costosRouter_1 = __importDefault(require("../routes/costosRouter"));
const typeofmovementsRouter_1 = __importDefault(require("../routes/typeofmovementsRouter"));
const utilsRouter_1 = __importDefault(require("../routes/utilsRouter"));
const errorsRouter_1 = __importDefault(require("../routes/errorsRouter"));
const sellsRouter_1 = __importDefault(require("../routes/sellsRouter"));
const meetingRouter_1 = __importDefault(require("../routes/meetingRouter"));
const calendarRouter_1 = __importDefault(require("../routes/calendarRouter"));
const emailRouter_1 = __importDefault(require("../routes/emailRouter"));
const reportsRouter_1 = __importDefault(require("../routes/reportsRouter"));
const almacenesRouter_1 = __importDefault(require("../routes/almacenesRouter"));
const statisticsRouter_1 = __importDefault(require("../routes/statisticsRouter"));
const errorHandler_1 = require("../middleware/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser")); // Asegúrate de importar cookie-parser
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || "5001";
        this.paths = {
            product: "/api/product",
            auth: "/api/auth",
            search: "/api/search",
            tables: "/api/tables",
            order: "/api/order",
            client: "/api/client",
            inventory: "/api/inventory",
            costos: "/api/costos",
            typeofmovements: "/api/typeofmovements",
            utils: "/api/utils",
            errors: "/api/errors",
            sells: "/api/sells",
            meetings: "/api/meetings",
            calendar: "/api/calendar",
            email: "/api/email",
            reports: "/api/reports",
            almacenes: "/api/almacenes",
            statistics: "/api/statistics"
        };
        void this.connectDB();
        this.middlewares();
        this.routes();
        this.errorHandler();
    }
    async connectDB() {
        await (0, connection_1.dbConnectionMain)();
    }
    middlewares() {
        const allowedOrigins = [
            'https://www.oleionline.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://olei-crm.vercel.app',
            // Demos
            'https://oleiweb-git-demo2-morisluis-projects.vercel.app'
        ];
        const corsOptions = {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use((0, cookie_parser_1.default)());
    }
    routes() {
        this.app.use(this.paths.product, productRouter_1.default);
        this.app.use(this.paths.auth, authRouter_1.default);
        this.app.use(this.paths.search, searchRouter_1.default);
        this.app.use(this.paths.tables, tablesRouter_1.default);
        this.app.use(this.paths.order, orderRouter_1.default);
        this.app.use(this.paths.client, clientRouter_1.default);
        this.app.use(this.paths.inventory, inventoryRouter_1.default);
        this.app.use(this.paths.costos, costosRouter_1.default);
        this.app.use(this.paths.typeofmovements, typeofmovementsRouter_1.default);
        this.app.use(this.paths.errors, errorsRouter_1.default);
        this.app.use(this.paths.utils, utilsRouter_1.default);
        this.app.use(this.paths.sells, sellsRouter_1.default);
        this.app.use(this.paths.meetings, meetingRouter_1.default);
        this.app.use(this.paths.calendar, calendarRouter_1.default);
        this.app.use(this.paths.email, emailRouter_1.default);
        this.app.use(this.paths.reports, reportsRouter_1.default);
        this.app.use(this.paths.almacenes, almacenesRouter_1.default);
        this.app.use(this.paths.statistics, statisticsRouter_1.default);
    }
    async closeConnections() {
        await (0, connection_1.dbConnectionMain)().then(pool => pool.close()).catch(() => { });
        console.log('Conexión a la base de datos cerrada');
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("✅ Servidor corriendo en puerto " + this.port);
        });
    }
    errorHandler() {
        this.app.use(errorHandler_1.errorHandler);
    }
}
exports.default = Server;
// Exportar la instancia de Redis
const server = new Server();
// Listener para cerrar conexiones con SIGINT
process.on('SIGINT', async () => {
    console.log('❌ Cerrando conexiones...');
    await server.closeConnections();
    process.exit(0);
});
// Listeners globales para errores inesperados
process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Promise Rejection:', reason);
    process.exit(1);
});
//# sourceMappingURL=server.js.map