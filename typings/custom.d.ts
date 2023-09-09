declare module 'express-session' {
    interface SessionData {
        user: any; // Define la estructura del usuario según tus necesidades
        // Otras propiedades de la sesión si las tienes
    }
}
