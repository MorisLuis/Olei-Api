import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { deleteMeeting, getMeetingById, getMeetings, postMeeting, updateMeeting } from "../controllers/bitacora";


const router = Router();

router.get('/', validateJWTWeb, getMeetings);
router.get('/:id', validateJWTWeb, getMeetingById);
router.put('/:id', validateJWTWeb, updateMeeting);
router.post('/', validateJWTWeb, postMeeting);
router.delete('/:id', validateJWTWeb, deleteMeeting);

export default router;