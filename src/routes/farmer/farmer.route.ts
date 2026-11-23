import { Router } from "express";
import FarmerController from "../../controllers/farmer/farmer.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/Admin.middleware";

const router = Router();

router.post("/", authenticate, isAdmin, FarmerController.createFarmer);

export default router;