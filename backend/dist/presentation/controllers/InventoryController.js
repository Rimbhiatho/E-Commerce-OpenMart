export class InventoryController {
    constructor(inventoryUseCase) {
        this.inventoryUseCase = inventoryUseCase;
    }
    async getInventoryReport(req, res, next) {
        try {
            const report = await this.inventoryUseCase.getInventoryReport();
            res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getLowStockProducts(req, res, next) {
        try {
            const threshold = req.query.threshold ? parseInt(req.query.threshold) : 10;
            const products = await this.inventoryUseCase.getLowStockProducts(threshold);
            res.status(200).json({
                success: true,
                data: products
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getOutOfStockProducts(req, res, next) {
        try {
            const products = await this.inventoryUseCase.getOutOfStockProducts();
            res.status(200).json({
                success: true,
                data: products
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async addStock(req, res, next) {
        try {
            const productId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const product = await this.inventoryUseCase.addStock(productId, quantity);
            res.status(200).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async removeStock(req, res, next) {
        try {
            const productId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const product = await this.inventoryUseCase.removeStock(productId, quantity);
            res.status(200).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async setStock(req, res, next) {
        try {
            const productId = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const product = await this.inventoryUseCase.setStock(productId, quantity);
            res.status(200).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async getTotalInventoryValue(req, res, next) {
        try {
            const totalValue = await this.inventoryUseCase.getTotalInventoryValue();
            res.status(200).json({
                success: true,
                data: { totalValue }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getStockCount(req, res, next) {
        try {
            const stockCount = await this.inventoryUseCase.getStockCount();
            res.status(200).json({
                success: true,
                data: { stockCount }
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
//# sourceMappingURL=InventoryController.js.map