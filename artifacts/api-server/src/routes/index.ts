import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import speakingRouter from "./speaking";
import speakingDiagnosticsRouter from "./speakingDiagnostics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(speakingRouter);
router.use(speakingDiagnosticsRouter);

export default router;
