export class AuthController {
    constructor(authUseCase) {
        this.authUseCase = authUseCase;
    }
    async register(req, res, next) {
        try {
            const dto = {
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async login(req, res, next) {
        try {
            const dto = {
                email: req.body.email,
                password: req.body.password
            };
            const result = await this.authUseCase.login(dto);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.id;
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const users = await this.authUseCase.getAllUsers();
            res.status(200).json({
                success: true,
                data: users
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateUser(req, res, next) {
        try {
            const userId = req.params.id || req.user?.id;
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async deleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            const result = await this.authUseCase.deleteUser(userId);
            res.status(200).json({
                success: result,
                message: result ? 'User deleted successfully' : 'User not found'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}
//# sourceMappingURL=AuthController.js.map