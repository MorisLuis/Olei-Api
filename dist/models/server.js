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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("../database/connection");
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
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || "5001";
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
            statistics: "/api/statistics"
        };
        //Connect to database
        this.connectDB();
        // Middlewares
        this.middlewares();
        // Routes of the app
        this.routes();
        // Error handling middleware
        this.errorHandler();
    }
    connectDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, connection_1.dbConnection)();
        });
    }
    middlewares() {
        // CORS
        this.app.use((0, cors_1.default)());
        // Lectura y parseo del body
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
    }
    ;
    errorHandler() {
        // Error handling middleware
        /* this.app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
            res.status(500).json({ error: 'Ocurrió un error en el servidor', err });
        }); */
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en puerto " + this.port);
        });
    }
    ;
}
exports.default = Server;
//# sourceMappingURL=server.js.map