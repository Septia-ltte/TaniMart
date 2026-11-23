import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (authReq.user?.roleId !== 1){
        return res.status(403).json({
            message: "Akses ditolak, khusus Admin"
        });
    }
    next();
}