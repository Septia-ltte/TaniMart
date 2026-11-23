import { Request, Response } from "express";
import { db } from "../../config/db";
import { categories } from "../../config/schema";
import { asc } from "drizzle-orm";

export class CategoryController {
    createCategory = async (req: Request, res: Response) => {
        try {
            const { id, name } = req.body;

            if (!id || !name?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "ID and category name are required",
                });
            }

            await db.insert(categories).values({
                id,
                name: name.trim(),
            });

            return res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: {
                    id,
                    name: name.trim(),
                },
            });

        } catch (error) {
            console.log("Create category error: ", error);

            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

    getCategories = async (req: Request, res: Response) => {
        try {
            const categoriesProduct = await db
                .select()
                .from(categories)
                .orderBy(asc(categories.id));

            return res.status(200).json({
                success: true,
                message: "Get categories successfully",
                data: {
                    categories: categoriesProduct
                }
            });

        } catch (error) {
            console.log("Get category error: ", error);

            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error
                    ? error.message
                    : error,
            });
        }
    };
}

export default new CategoryController();