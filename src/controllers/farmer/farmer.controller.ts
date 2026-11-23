import { Request, Response } from "express";
import { usersTable } from "../../config/schema";
import bcrypt from "bcryptjs";
import { db } from "../../config/db";
import { createFarmerSchema } from "../../validation/farmer.validation";

export class FarmerController {

    createFarmer = async (req: Request, res: Response) => {
        try {
            const validation = createFarmerSchema.parse(req.body);
            const { username, email, password } = validation;
            const hashedPassword = await bcrypt.hash(password, 10);

            const [newFarmer] = await db
                .insert(usersTable)
                .values({
                    username,
                    email,
                    password: hashedPassword,
                    roleId: 2
                })
                .returning();

            return res.status(201).json({
                success: true,
                message: "Farmer created successfully",
                data: newFarmer
            });

        } catch (error: any) {
            if (error.code === "23505") {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists"
                });
            }

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}
export default new FarmerController();