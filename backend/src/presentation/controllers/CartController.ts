import { Request, Response, NextFunction } from 'express';
import { CartRepositoryImpl } from '../../infrastructure/repositories/CartRepositoryImpl';

export class CartController {
  constructor(private cartRepository: CartRepositoryImpl) {}

  /// Get all cart items for the authenticated user
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const cartItems = await this.cartRepository.getCartByUserId(userId);
      const itemCount = await this.cartRepository.getItemCount(userId);
      const totalPrice = await this.cartRepository.getTotalPrice(userId);

      res.status(200).json({
        success: true,
        data: {
          items: cartItems,
          itemCount,
          totalPrice
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /// Add item to cart
  async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const { productId, title, imageUrl, price, quantity } = req.body;

      if (!productId || !title || price === undefined) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: productId, title, price'
        });
        return;
      }

      const cartItem = await this.cartRepository.addToCart({
        userId,
        productId: String(productId),
        title,
        imageUrl: imageUrl || '',
        price: Number(price),
        quantity: quantity || 1
      });

      res.status(200).json({
        success: true,
        data: cartItem
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /// Update quantity of a cart item
  async updateQuantity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
        return;
      }

      const updatedItem = await this.cartRepository.updateQuantity(
        userId,
        String(productId),
        Number(quantity)
      );

      if (!updatedItem) {
        res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /// Remove item from cart
  async removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
        return;
      }

      const result = await this.cartRepository.removeFromCart(userId, String(productId));

      res.status(200).json({
        success: result,
        message: result ? 'Item removed from cart' : 'Item not found'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /// Clear all cart items for the authenticated user
  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const result = await this.cartRepository.clearCart(userId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

