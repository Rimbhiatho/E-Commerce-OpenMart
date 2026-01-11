import { Request, Response, NextFunction } from 'express';
import { AuthUseCase } from '../../domain/useCases/AuthUseCase';
export declare class AuthController {
    private authUseCase;
    constructor(authUseCase: AuthUseCase);
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map