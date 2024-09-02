"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const userRouter_1 = __importDefault(require("../routes/userRouter"));
const productRouter_1 = __importDefault(require("../routes/productRouter"));
const authRouter_1 = __importDefault(require("../routes/authRouter"));
const searchRouter_1 = __importDefault(require("../routes/searchRouter"));
const tablesRouter_1 = __importDefault(require("../routes/tablesRouter"));
const orderRouter_1 = __importDefault(require("../routes/orderRouter"));
const orderDetailsRouter_1 = __importDefault(require("../routes/orderDetailsRouter"));
const clientRouter_1 = __importDefault(require("../routes/clientRouter"));
const inventoryRouter_1 = __importDefault(require("../routes/inventoryRouter"));
const costosRouter_1 = __importDefault(require("../routes/costosRouter"));
const statisticsRouter_1 = __importDefault(require("../routes/statisticsRouter"));
const typeofmovementsRouter_1 = __importDefault(require("../routes/typeofmovementsRouter"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || "5001";
        this.redis = null;
        this.paths = {
            product: "/api/product",
            user: "/api/user",
            auth: "/api/auth",
            search: "/api/search",
            tables: "/api/tables",
            order: "/api/order",
            orderDetails: "/api/orderDetails",
            client: "/api/client",
            inventory: "/api/inventory",
            costos: "/api/costos",
            statistics: "/api/statistics",
            typeofmovements: "/api/typeofmovements"
        };
        this.connectDB();
        this.configureRedis();
        this.configureSessions();
        this.middlewares();
        this.routes();
        this.errorHandler();
    }
    connectDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, connection_1.dbConnection)();
        });
    }
    configureRedis() {
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseFloat(process.env.REDIS_PORT) || 6379,
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
            const store = new connect_redis_1.default({
                client: this.redis,
                ttl: parseFloat(process.env.REDIS_SESSION_EXPIRATION),
            });
            this.app.use((0, express_session_1.default)({
                secret: process.env.REDIS_SECRET,
                name: 'sid',
                store: store,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: process.env.ENVIRONMENT === "production" ? true : 'auto',
                    httpOnly: true,
                    maxAge: parseFloat(process.env.REDIS_SESSION_EXPIRATION),
                    sameSite: process.env.ENVIRONMENT === "production" ? "none" : 'lax'
                }
            }));
        }
        else {
            console.error('Redis no está configurado, las sesiones no se almacenarán en Redis');
        }
    }
    middlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
    }
    routes() {
        this.app.use(this.paths.product, productRouter_1.default);
        this.app.use(this.paths.user, userRouter_1.default);
        this.app.use(this.paths.auth, authRouter_1.default);
        this.app.use(this.paths.search, searchRouter_1.default);
        this.app.use(this.paths.tables, tablesRouter_1.default);
        this.app.use(this.paths.order, orderRouter_1.default);
        this.app.use(this.paths.orderDetails, orderDetailsRouter_1.default);
        this.app.use(this.paths.client, clientRouter_1.default);
        this.app.use(this.paths.inventory, inventoryRouter_1.default);
        this.app.use(this.paths.costos, costosRouter_1.default);
        this.app.use(this.paths.statistics, statisticsRouter_1.default);
        this.app.use(this.paths.typeofmovements, typeofmovementsRouter_1.default);
    }
    errorHandler() {
        this.app.use((err, req, res, next) => {
            res.status(500).json({ error: 'Ocurrió un error en el servidor', err });
        });
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
//# sourceMappingURL=server.js.map