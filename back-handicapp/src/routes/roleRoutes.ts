import { Router } from "express";
import { RoleController } from "../controllers/roleController";
import { authenticate, adminOnly } from "../middleware/auth";
import {
  validatePagination,
  validateRoleCreate,
  validateRoleId,
  validateRoleUpdate,
} from "../validators";

const router = Router();

router.use(authenticate, adminOnly);

router.get("/", validatePagination, RoleController.list);
router.post("/", validateRoleCreate, RoleController.create);
router.get("/:id", validateRoleId, RoleController.getById);
router.put("/:id", validateRoleId, validateRoleUpdate, RoleController.update);
router.delete("/:id", validateRoleId, RoleController.remove);

export { router as roleRoutes };
