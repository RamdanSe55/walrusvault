import { Router, type IRouter } from "express";
import healthRouter from "./health";
import filesRouter from "./files";
import tatumRouter from "./tatum";
import sharingRouter from "./sharing";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tatum", tatumRouter);
router.use("/sharing", sharingRouter);
router.use(filesRouter);

export default router;
