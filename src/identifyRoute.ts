import express from 'express';
import { identifyUser } from './identifyController';

const router = express.Router();
router.post('/', identifyUser);
export default router;
