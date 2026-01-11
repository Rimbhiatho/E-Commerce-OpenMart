import jwt from 'jsonwebtoken';
export const authMiddleware = (jwtSecret) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'No token provided'
            });
            return;
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
            return;
        }
        const [bearer, token] = parts;
        if (bearer !== 'Bearer') {
            res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
            return;
        }
        try {
            const decoded = jwt.verify(token, jwtSecret);
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    };
};
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
        return;
    }
    next();
};
export const optionalAuth = (jwtSecret) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next();
            return;
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            next();
            return;
        }
        const token = parts[1];
        try {
            const decoded = jwt.verify(token, jwtSecret);
            req.user = decoded;
        }
        catch (error) {
            // Token invalid, but continue without user
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map