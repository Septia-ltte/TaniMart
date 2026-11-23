import "multer";
import { Request, Response } from "express";
import { createPostSchema, productIdSchema, updateProductParamsSchema, updateProductSchema } from "../../validation/posts.validation";
import { db } from "../../config/db";
import { products } from "../../config/schema";
import { eq, desc, and } from "drizzle-orm";
import { deleteFromCloudinary, uploadToCloudinary } from "../../services/cloudinary.services";

export class PostController {

    // CREATE
    createProduct = async (req: Request, res: Response) => {
        try {
            const validateData = createPostSchema.parse(req.body);

            const {
                farmerId,
                categoryId,
                title,
                description,
                type,
                price,
                stock,
                unit,
                harvestDate,
                preOrder
            } = validateData;

            let imageUrl: string | undefined;
            let imagePublicId: string | undefined;

            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                imageUrl = uploadResult.secure_url;
                imagePublicId = uploadResult.public_id;
            }

            const [insertedProduct] = await db
                .insert(products)
                .values({
                    farmerId,
                    categoryId,
                    title,
                    description,
                    imageUrl,
                    imagePublicId,
                    type,
                    price: String(price),
                    stock,
                    unit,
                    harvestDate,
                    preOrder
                })
                .returning();

            return res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: {
                    product: insertedProduct
                }
            });

        } catch (error: any) {
            console.log("Create product error:", error);
            console.log("Database error:", error.cause);

            if (error.name === "ZodError") {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: error.issues
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.cause?.message || error.message,
                code: error.cause?.code
            });
        }
    };

    // GET ALL
    getProducts = async (req: Request, res: Response) => {
        try {
            const allProducts = await db
                .select()
                .from(products)
                .where(eq(products.status, "published"))
                .orderBy(desc(products.createdAt));

            return res.status(200).json({
                success: true,
                message: "Products retrieved successfully",
                data: {
                    products: allProducts
                }
            });

        } catch (error: any) {
            console.log("Get products error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };

    // GET BY ID 
    getProductById = async (req: Request, res: Response) => {
        try {
            const validatedParams = productIdSchema.parse(req.params);
            const { id } = validatedParams;

            const [product] = await db
                .select()
                .from(products)
                .where(
                    and(
                        eq(products.id,id),
                        eq(products.status,"published"),
                    )
                );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Product retrieved successfully",
                data: {
                    product
                }
            });

        } catch (error: any) {
            console.log("Get product error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };


    // UPDATE
    updateProduct = async (req: Request, res: Response) => {
        try {
            // Validate params
            const validatedParams = updateProductParamsSchema.parse(req.params);
            const { id } = validatedParams;

            // Validate body
            const validateData = updateProductSchema.parse(req.body);

            const {
                title,
                description,
                categoryId,
                type,
                price,
                stock,
                unit,
                harvestDate,
                preOrder,
                status
            } = validateData;

            // Check product
            const [existingProduct] = await db
                .select()
                .from(products)
                .where(eq(products.id, id));

            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const finalHarvestDate =
                harvestDate !== undefined
                    ? harvestDate
                    : existingProduct.harvestDate;

            const finalPreOrder =
                preOrder !== undefined
                    ? preOrder
                    : existingProduct.preOrder;

            if (
                finalHarvestDate &&
                finalPreOrder &&
                finalPreOrder > finalHarvestDate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Pre-order tidak boleh setelah harvest date"
                });
            }

            // Prepare image update
            let imageUrl = existingProduct.imageUrl;
            let imagePublicId = existingProduct.imagePublicId;

            // Upload new image
            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.buffer);

                imageUrl = uploadResult.secure_url;
                imagePublicId = uploadResult.public_id;

                // Delete old image
                if (existingProduct.imagePublicId) {
                    await deleteFromCloudinary(existingProduct.imagePublicId);
                }
            }

            await db
                .update(products)
                .set({
                    ...(title !== undefined && { title }),
                    ...(description !== undefined && { description }),
                    ...(categoryId !== undefined && { categoryId }),
                    ...(type !== undefined && { type }),
                    ...(price !== undefined && { price: String(price) }),
                    ...(stock !== undefined && { stock }),
                    ...(unit !== undefined && { unit }),
                    ...(harvestDate !== undefined && { harvestDate }),
                    ...(preOrder !== undefined && { preOrder }),
                    ...(status !== undefined && { status }),
                    ...(req.file && {
                        imageUrl,
                        imagePublicId
                    }),
                    updatedAt: new Date()
                })
                .where(eq(products.id, id));

            // Get updated product
            const [updatedProduct] = await db
                .select()
                .from(products)
                .where(eq(products.id, id));

            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: {
                    product: updatedProduct
                }
            });

        } catch (error: any) {
            console.log("Update product error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };


    // DELETE
    deleteProduct = async (req: Request, res: Response) => {
        try {
            // Validate product ID
            const validatedParams = productIdSchema.parse(req.params);
            const { id } = validatedParams;

            // Check product
            const [existingProduct] = await db
                .select()
                .from(products)
                .where(eq(products.id, id));

            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // Soft delete
            await db
                .update(products)
                .set({
                    status: "inactive",
                    updatedAt: new Date()
                })
                .where(eq(products.id, id));

            return res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            });

        } catch (error: any) {
            console.log("Delete product error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };
}

export default new PostController();