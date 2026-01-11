export class OrderController {
    constructor(orderUseCase) {
        this.orderUseCase = orderUseCase;
    }
    async createOrder(req, res, next) {
        try {
            const dto = {
                userId: req.body.userId,
                items: req.body.items,
                shippingAddress: req.body.shippingAddress,
                paymentMethod: req.body.paymentMethod,
                notes: req.body.notes
            };
            const order = await this.orderUseCase.createOrder(dto);
            res.status(201).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async getAllOrders(req, res, next) {
        try {
            const filter = {
                userId: req.query.userId,
                status: req.query.status,
                paymentStatus: req.query.paymentStatus,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined
            };
            const orders = await this.orderUseCase.getAllOrders(filter);
            res.status(200).json({
                success: true,
                data: orders
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getOrderById(req, res, next) {
        try {
            const order = await this.orderUseCase.getOrderById(req.params.id);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getOrdersByUser(req, res, next) {
        try {
            const orders = await this.orderUseCase.getOrdersByUser(req.params.userId);
            res.status(200).json({
                success: true,
                data: orders
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateOrderStatus(req, res, next) {
        try {
            const dto = {
                status: req.body.status
            };
            const order = await this.orderUseCase.updateOrderStatus(req.params.id, dto);
            res.status(200).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async updatePaymentStatus(req, res, next) {
        try {
            const dto = {
                paymentStatus: req.body.paymentStatus
            };
            const order = await this.orderUseCase.updatePaymentStatus(req.params.id, dto);
            res.status(200).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async cancelOrder(req, res, next) {
        try {
            const order = await this.orderUseCase.cancelOrder(req.params.id);
            res.status(200).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async deleteOrder(req, res, next) {
        try {
            const result = await this.orderUseCase.deleteOrder(req.params.id);
            res.status(200).json({
                success: result,
                message: result ? 'Order deleted successfully' : 'Order not found'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getOrdersByStatus(req, res, next) {
        try {
            const status = req.params.status;
            const orders = await this.orderUseCase.getOrdersByStatus(status);
            res.status(200).json({
                success: true,
                data: orders
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
//# sourceMappingURL=OrderController.js.map