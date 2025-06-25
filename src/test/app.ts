import express, { Request, Response } from 'express';
import * as userService from './userService';
import { auth } from './auth';
import * as profileService from './profileService';

const app = express();

// ¡Esto es obligatorio para que req.body funcione!
app.use(express.json());

app.post('/api/users', async (req: Request, res: Response): Promise<Response | void> => {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required and must be a string' });
    }


    try {
        const newUser = await userService.createUser(name);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/profile', auth, async (req, res) => {
    try {
        const profile = await profileService.getProfile((req.user as any).id);
        res.json(profile);
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default app;
