import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}
declare const JWT_SECRET: string;
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const generateToken: (userId: string, email: string, name: string) => string;
export { JWT_SECRET };
//# sourceMappingURL=auth.d.ts.map