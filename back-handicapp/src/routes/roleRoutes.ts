import { Router, type Router as ExpressRouter } from "express";
import { RoleController } from "../controllers/roleController";
import { requireAuth, adminOnly } from "../middleware/auth";
import { paramValidations } from "../middleware/validation";

const router: ExpressRouter = Router();

router.use(requireAuth, adminOnly);

router.get("/", paramValidations.pagination, RoleController.list);
router.post("/", RoleController.create);
router.get("/:id", paramValidations.id, RoleController.getById);
router.put("/:id", paramValidations.id, RoleController.update);
router.delete("/:id", paramValidations.id, RoleController.remove);

export { router as roleRoutes };
