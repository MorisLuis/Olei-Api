// server.ts

import type { Application } from "express";
import express from "express";
import type { CorsOptions } from 'cors';
import cors from 'cors';
import { dbConnectionMain } from "../database/connection";

// Rutas
import productRouter from "../routes/productRouter";
import authRouter from "../routes/authRouter";
import searchRouter from "../routes/searchRouter";
import tablesRouter from "../routes/tablesRouter";
import orderRouter from "../routes/orderRouter";
import clientRouter from "../routes/clientRouter";
import inventoryRouter from "../routes/inventoryRouter";
import costosRouter from "../routes/costosRouter";
import typeofmovementsRouter from "../routes/typeofmovementsRouter";
import utilsRouter from "../routes/utilsRouter";
import errorsRouter from "../routes/errorsRouter";
import sellsRouter from "../routes/sellsRouter";
import meetingsRouter from "../routes/meetingRouter";
import calendarRouter from "../routes/calendarRouter";
import emailRouter from "../routes/emailRouter";
import reportsRouter from "../routes/reportsRouter";
import almacenesRouter from "../routes/almacenesRouter";
import statisticsRouter from "../routes/statisticsRouter";
import abonosRouter from "../routes/abonosRouter";
import aiRouter from "../routes/aiRouter";
import informesiaRouter from "../routes/informesiaRouter";

import { errorHandler } from "../middleware/errorHandler";
import cookieParser from 'cookie-parser';  // Asegúrate de importar cookie-parser

class Server {
    public app: Application;
    private port: string;

    private paths: {
        product: string,
        auth: string,
        search: string,
        tables: string,
        order: string,
        client: string,
        inventory: string,
        costos: string,
        typeofmovements: string,
        utils: string,
        errors: string,
        sells: string,
        meetings: string,
        calendar: string,
        email: string,
        reports: string
        almacenes: string,
        statistics: string,
        abonos: string,
        aiRouter: string
        informesia: string
    };

    constructor() {
        this.app = express();
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
            statistics: "/api/statistics",
            abonos: "/api/abonos",
            aiRouter: "/api/ai",
            informesia: "/api/informesia"
        };

        void this.connectDB();
        this.middlewares();
        this.routes();

        this.errorHandler();
    }

    private async connectDB() {
        await dbConnectionMain();
    }



    private middlewares(): void {
        const allowedOrigins: string[] = [
            'https://www.oleicrm.com',
            'https://www.oleionline.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://olei-crm.vercel.app',
            // Demos
            'https://oleiweb-git-demo2-morisluis-projects.vercel.app'
        ];

        const corsOptions: CorsOptions = {
            origin: (origin: string | undefined, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        };

        this.app.use(cors(corsOptions));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        this.app.use(cookieParser());
    }


    private routes() {
        this.app.use(this.paths.product, productRouter);
        this.app.use(this.paths.auth, authRouter);
        this.app.use(this.paths.search, searchRouter);
        this.app.use(this.paths.tables, tablesRouter);
        this.app.use(this.paths.order, orderRouter);
        this.app.use(this.paths.client, clientRouter);
        this.app.use(this.paths.inventory, inventoryRouter);
        this.app.use(this.paths.costos, costosRouter);
        this.app.use(this.paths.typeofmovements, typeofmovementsRouter);
        this.app.use(this.paths.errors, errorsRouter);
        this.app.use(this.paths.utils, utilsRouter);
        this.app.use(this.paths.sells, sellsRouter);
        this.app.use(this.paths.meetings, meetingsRouter);
        this.app.use(this.paths.calendar, calendarRouter);
        this.app.use(this.paths.email, emailRouter);
        this.app.use(this.paths.reports, reportsRouter);
        this.app.use(this.paths.almacenes, almacenesRouter);
        this.app.use(this.paths.statistics, statisticsRouter);
        this.app.use(this.paths.abonos, abonosRouter);
        this.app.use(this.paths.aiRouter, aiRouter);
        this.app.use(this.paths.informesia, informesiaRouter);

    }

    public async closeConnections(): Promise<void> {
        await dbConnectionMain().then(pool => pool.close()).catch(() => { });
        console.log('Conexión a la base de datos cerrada');
    }


    public listen(): void {
        this.app.listen(this.port, () => {
            console.log("✅ Servidor corriendo en puerto " + this.port);
        });
    }

    errorHandler(): void {
        this.app.use(errorHandler);
    }

}

export default Server;

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