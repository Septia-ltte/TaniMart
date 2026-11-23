import { Request, Response } from "express";
import { usersTable } from "../../config/schema";
import { db } from "../../config/db";
import { createUserSchema } from "../../validation/users.validation";
import bcrypt from "bcryptjs";

export class UserController {

    createUser = async (req: Request, res: Response) => {
        try {
            const validation = createUserSchema.parse(req.body);
            const { username, email, password } = validation;
            const hashedPassword = await bcrypt.hash(password, 10);

            const [newUser] = await db
                .insert(usersTable)
                .values({
                    username,
                    email,
                    password:hashedPassword,
                    roleId: 3
                })
                .returning();

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: newUser
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

export default new UserController();