import { Request, Response, NextFunction } from 'express';
import { AuthUseCase } from '../../domain/useCases/AuthUseCase';
import { CreateUserDTO, LoginDTO } from '../../domain/entities/User';

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateUserDTO = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        role: req.body.role
      };

      const result = await this.authUseCase.register(dto);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LoginDTO = {
        email: req.body.email,
        password: req.body.password
      };

      const result = await this.authUseCase.login(dto);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const user = await this.authUseCase.getProfile(userId);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.authUseCase.getAllUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id || (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const user = await this.authUseCase.updateUser(userId, req.body);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const result = await this.authUseCase.deleteUser(userId);
      res.status(200).json({
        success: result,
        message: result ? 'User deleted successfully' : 'User not found'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

