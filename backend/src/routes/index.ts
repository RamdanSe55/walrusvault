import { Router, type IRouter } from "express";
import healthRouter from "./health";
import filesRouter from "./files";
import tatumRouter from "./tatum";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tatum", tatumRouter);
router.use(filesRouter);

export default router;
