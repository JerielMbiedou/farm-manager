import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import financementRouter from "./financement";
import devisRouter from "./devis";
import depensesRouter from "./depenses";
import bandesRouter from "./bandes";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/financement", financementRouter);
router.use("/devis", devisRouter);
router.use("/depenses", depensesRouter);
router.use("/bandes", bandesRouter);
router.use("/dashboard", dashboardRouter);

export default router;
