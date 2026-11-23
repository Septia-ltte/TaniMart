import { Router } from "express";
import PostsController from "../../controllers/posts/posts.controller";
import { uploadSingleImage } from "../../middleware/upload.middleware";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

//create
router.post('/' ,authenticate ,uploadSingleImage, PostsController.createProduct);

//guest
router.get('/', PostsController.getProducts);
router.get('/:id', PostsController.getProductById);

//update
router.patch('/:id', authenticate, uploadSingleImage, PostsController.updateProduct);

//delete
router.delete('/:id', authenticate, PostsController.deleteProduct);

export default router;
