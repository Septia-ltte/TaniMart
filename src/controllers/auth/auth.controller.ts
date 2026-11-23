import {Request, Response} from "express";
import { loginSchema, registerSchema } from "../../validation/auth.validation";
import { eq } from "drizzle-orm";
import { usersTable } from "../../config/schema";
import { db } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthControllers {
    
    register = async(req: Request, res: Response) => {
        try {
            const validateData = registerSchema.parse(req.body);
            const { username, email, password} = validateData;

            const existingEmail = await db.query.usersTable.findFirst({
                where: eq(usersTable.email, email),
            });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [insertedUser] = await db
                .insert(usersTable)
                .values({
                    username,
                    email,
                    password: hashedPassword,
                })
                .returning();

            const newUser = await db.query.usersTable.findFirst({
                where: eq(usersTable.id, insertedUser.id),
            });

            return res.status(201).json({
                success: true,
                message: "Register succesful",
                data: {
                    user: {
                        id: newUser?.id,
                        username: newUser?.username,
                        email: newUser?.email,
                        role: newUser?.roleId,
                    },
                },
            });

        } catch (error : any){
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
            
        }
    }

    login = async (req: Request, res:Response) => {
        try {
            const validateData = loginSchema.parse(req.body);
            const {email, password} = validateData;

            const user = await db.query.usersTable.findFirst({
                where: eq(usersTable.email, email),
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Email or password incorrect",
                });
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Email or Password incorrect",
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roleId: user.roleId,
                },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: "7d",
                }
            );
            
            return res.status(200).json({
                success: true,
                message: "Login succesful",
                data: {
                    token: token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.roleId,
                    },
                },
            });

        } catch (error : any) {
            return res.status(500).json({
                success: false,
                message:"Internal server error",
                error: error.message
            });     
        }
    }

}

export default new AuthControllers()