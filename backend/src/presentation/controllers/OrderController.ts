import { Request, Response, NextFunction } from 'express';
import { OrderUseCase } from '../../domain/useCases/OrderUseCase';
import { CreateOrderDTO, UpdateOrderStatusDTO, UpdatePaymentStatusDTO, OrderFilter, OrderStatus, PaymentStatus } from '../../domain/entities/Order';

export class OrderController {
  constructor(private orderUseCase: OrderUseCase) {}

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateOrderDTO = {
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: OrderFilter = {
        userId: req.query.userId as string,
        status: req.query.status as OrderStatus,
        paymentStatus: req.query.paymentStatus as PaymentStatus,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const orders = await this.orderUseCase.getAllOrders(filter);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getOrdersByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await this.orderUseCase.getOrdersByUser(req.params.userId);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: UpdateOrderStatusDTO = {
        status: req.body.status
      };
      const order = await this.orderUseCase.updateOrderStatus(req.params.id, dto);
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: UpdatePaymentStatusDTO = {
        paymentStatus: req.body.paymentStatus
      };
      const order = await this.orderUseCase.updatePaymentStatus(req.params.id, dto);
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.orderUseCase.cancelOrder(req.params.id);
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.orderUseCase.deleteOrder(req.params.id);
      res.status(200).json({
        success: result,
        message: result ? 'Order deleted successfully' : 'Order not found'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getOrdersByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.params.status as OrderStatus;
      const orders = await this.orderUseCase.getOrdersByStatus(status);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

