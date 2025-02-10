"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
// server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ioredis_1 = __importDefault(require("ioredis"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
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
const bitacoraRouter_1 = __importDefault(require("../routes/bitacoraRouter"));
const calendarRouter_1 = __importDefault(require("../routes/calendarRouter"));
const emailRouter_1 = __importDefault(require("../routes/emailRouter"));
const reportsRouter_1 = __importDefault(require("../routes/reportsRouter"));
const almacenesRouter_1 = __importDefault(require("../routes/almacenesRouter"));
const errorHandler_1 = require("../middleware/errorHandler");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || "5001";
        this.redis = null;
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
            almacenes: "/api/almacenes"
        };
        this.connectDB();
        this.configureRedis();
        this.configureSessions();
        this.middlewares();
        this.routes();
        this.errorHandler();
    }
    async connectDB() {
        await (0, connection_1.dbConnectionMain)();
    }
    configureRedis() {
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD
        });
        this.redis.on('connect', () => {
            console.log('Conectado a Redis');
        });
        this.redis.on('error', (err) => {
            console.error('Error de conexión a Redis:', err);
        });
    }
    configureSessions() {
        if (this.redis) {
            const isProduction = process.env.ENVIRONMENT === 'production';
            // Define el TTL y maxAge para móvil y web
            const webMaxAgeInSeconds = 12 * 60 * 60; // 8 horas para la web
            const mobileMaxAgeInSeconds = 365 * 24 * 60 * 60; // 1 año en móvil
            // Define el store de Redis, una sola vez
            const store = new connect_redis_1.default({
                client: this.redis,
                ttl: webMaxAgeInSeconds // Default ttl
            });
            // Configurar express-session una vez para toda la aplicación
            this.app.use((0, express_session_1.default)({
                secret: process.env.REDIS_SECRET,
                name: 'sid',
                store: store,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: isProduction ? 'auto' : false, // true en producción, false en local
                    httpOnly: true,
                    sameSite: isProduction ? 'none' : 'lax', // 'none' para producción, 'lax' para local
                    maxAge: webMaxAgeInSeconds * 1000 // Default maxAge
                }
            }));
            // Middleware personalizado para ajustar el maxAge según el User-Agent
            this.app.use((req, res, next) => {
                const userAgent = req.headers['user-agent'];
                if (userAgent && (userAgent.includes('Mobile') || userAgent.includes('OleiApp'))) {
                    // Si es una app móvil, ajustamos maxAge
                    req.session.cookie.maxAge = mobileMaxAgeInSeconds * 1000;
                }
                next();
            });
        }
        else {
            console.error('Redis no está configurado, las sesiones no se almacenarán en Redis');
        }
    }
    middlewares() {
        const allowedOrigins = [
            'https://www.oleionline.com',
            'http://localhost:3000',
            'http://localhost:3001',
            "https://olei-crm.vercel.app",
            //Demos
            "https://oleiweb-git-demo2-morisluis-projects.vercel.app"
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
            credentials: true
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
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
        this.app.use(this.paths.meetings, bitacoraRouter_1.default);
        this.app.use(this.paths.calendar, calendarRouter_1.default);
        this.app.use(this.paths.email, emailRouter_1.default);
        this.app.use(this.paths.reports, reportsRouter_1.default);
        this.app.use(this.paths.almacenes, almacenesRouter_1.default);
    }
    async closeConnections() {
        if (this.redis) {
            await this.redis.quit();
            console.log('Conexión a Redis cerrada');
        }
        await (0, connection_1.dbConnectionMain)().then(pool => pool.close()).catch(() => { });
        console.log('Conexión a la base de datos cerrada');
    }
    errorHandler() {
        this.app.use(errorHandler_1.errorHandler);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en puerto " + this.port);
        });
    }
}
exports.default = Server;
// Exportar la instancia de Redis
const server = new Server();
exports.redisClient = server.redis;
process.on('SIGINT', async () => {
    console.log('Cerrando conexiones...');
    await server.closeConnections();
    process.exit(0);
});
//# sourceMappingURL=server.js.map