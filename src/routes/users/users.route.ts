import { Router } from "express";
import UserController from "../../controllers/users/users.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/Admin.middleware";

const router = Router();

router.post("/", authenticate, isAdmin, UserController.createUser);

export default router;