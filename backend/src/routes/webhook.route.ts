import { Router } from "express";
import { googleCalendarWebhookHandler } from "../controllers/integration.controller";
const router = Router();

router.post("/google-calendar", googleCalendarWebhookHandler);

export default router;