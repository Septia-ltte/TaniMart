import { Router } from "express";
import CategoryController from "../../controllers/categories/categories.controller";

const router = Router();


router.post("/", CategoryController.createCategory);
router.get("/", CategoryController.getCategories);


export default router;