import 'package:flutter/material.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/service/cart_api_service.dart';
import 'package:openmart/data/server/model/cart_model.dart';
import 'package:openmart/data/server/repository/cart_repository.dart';

class CartItem {
  final ProductModel product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get total => product.price * quantity;
}

class CartProvider extends ChangeNotifier {
  final CartApiService cartApiService;
  final List<CartItem> _items = [];
  bool _isLoading = false;
  String? _error;
  bool _isConnected = false; // Whether cart is connected to server

  // Getters
  List<CartItem> get items => _items;
  int get itemCount => _items.length;
  double get totalPrice {
    double total = 0;
    for (var item in _items) {
      total += item.total;
    }
    return total;
  }
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isConnected => _isConnected;

  CartProvider({CartApiService? cartApiService})
      : cartApiService = cartApiService ?? CartApiService.instance;

  /// Add product to cart (local + sync to server)
  Future<void> addToCart(ProductModel product, {String? token}) async {
    // Check if item already exists
    final existingIndex = _items.indexWhere(
      (item) => item.product.id == product.id,
    );

    if (existingIndex >= 0) {
      // Item exists, increment quantity
      _items[existingIndex].quantity++;
    } else {
      // Add new item
      _items.add(CartItem(product: product, quantity: 1));
    }
    notifyListeners();

    // Sync to server if connected
    if (token != null && _isConnected) {
      try {
        await cartApiService.addToCart(
          token,
          AddToCartRequest(
            productId: product.id.toString(),
            title: product.title,
            imageUrl: product.image,
            price: product.price,
            quantity: 1,
          ),
        );
      } catch (e) {
        _error = 'Failed to sync cart: $e';
        // Don't revert local changes, just notify about sync error
        notifyListeners();
      }
    }
  }

  /// Remove item from cart (local + sync to server)
  Future<void> removeFromCart(String productId, {String? token}) async {
    _items.removeWhere((item) => item.product.id.toString() == productId);
    notifyListeners();

    // Sync to server if connected
    if (token != null && _isConnected) {
      try {
        await cartApiService.removeFromCart(token, productId);
      } catch (e) {
        _error = 'Failed to sync removal: $e';
        notifyListeners();
      }
    }
  }

  /// Update quantity of an item (local + sync to server)
  /// FIXED: Now handles errors properly
  Future<void> updateQuantity(
    String productId,
    int quantity, {
    String? token,
  }) async {
    // Find the item - FIX: handle case where item might not exist
    try {
      final itemIndex = _items.indexWhere(
        (item) => item.product.id.toString() == productId,
      );

      if (itemIndex < 0) {
        // Item not found locally, just return
        return;
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        _items.removeAt(itemIndex);
      } else {
        // Update quantity
        _items[itemIndex].quantity = quantity;
      }
      notifyListeners();

      // Sync to server if connected
      if (token != null && _isConnected) {
        try {
          final result = await cartApiService.updateQuantity(
            token,
            productId,
            quantity,
          );
          // If result is null, item was removed on server side too
          if (result == null && quantity > 0) {
            // Server removed the item (maybe out of stock), sync local
            _items.removeWhere(
              (item) => item.product.id.toString() == productId,
            );
            notifyListeners();
          }
        } catch (e) {
          _error = 'Failed to sync quantity: $e';
          notifyListeners();
        }
      }
    } catch (e) {
      _error = 'Error updating quantity: $e';
      notifyListeners();
    }
  }

  /// Clear entire cart (local + sync to server)
  Future<void> clearCart({String? token}) async {
    _items.clear();
    notifyListeners();

    // Sync to server if connected
    if (token != null && _isConnected) {
      try {
        await cartApiService.clearCart(token);
      } catch (e) {
        _error = 'Failed to sync clear: $e';
        notifyListeners();
      }
    }
  }

  /// Load cart from server (called after login)
  Future<void> loadCartFromServer(String token) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final cartResponse = await cartApiService.getCart(token);

      // Convert server items to local CartItems
      _items.clear();
      for (final serverItem in cartResponse.items) {
        // Convert server cart item to ProductModel
        final product = ProductModel(
          id: int.tryParse(serverItem.productId) ?? 0,
          title: serverItem.title,
          description: '',
          price: serverItem.price,
          category: '',
          image: serverItem.imageUrl,
        );

        _items.add(CartItem(
          product: product,
          quantity: serverItem.quantity,
        ));
      }

      _isConnected = true;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = 'Failed to load cart: $e';
      notifyListeners();
    }
  }

  /// Load cart from local cache (fallback when offline)
  Future<void> loadCartFromCache() async {
    final cachedCart = await CartRepositoryImpl.getCartFromCache();
    if (cachedCart != null) {
      _items.clear();
      for (final serverItem in cachedCart.items) {
        final product = ProductModel(
          id: int.tryParse(serverItem.productId) ?? 0,
          title: serverItem.title,
          description: '',
          price: serverItem.price,
          category: '',
          image: serverItem.imageUrl,
        );

        _items.add(CartItem(
          product: product,
          quantity: serverItem.quantity,
        ));
      }
      _isConnected = false; // From cache, not server
      notifyListeners();
    }
  }

  /// Set connection status and optionally save to local cache
  void setConnected(bool connected, {String? token}) {
    _isConnected = connected;
    notifyListeners();
  }

  /// Save current cart to local cache
  Future<void> saveToCache() async {
    final cartResponse = CartResponse(
      items: _items.map((item) {
        return CartItemModel(
          id: '',
          userId: '',
          productId: item.product.id.toString(),
          title: item.product.title,
          imageUrl: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          createdAt: '',
          updatedAt: '',
        );
      }).toList(),
      itemCount: _items.length,
      totalPrice: totalPrice,
    );
    await CartRepositoryImpl.saveCartToCache(cartResponse);
  }

  /// Clear any error state
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Check if product is in cart
  bool isInCart(int productId) {
    return _items.any((item) => item.product.id == productId);
  }

  /// Get quantity of a specific product
  int getQuantity(int productId) {
    final item = _items.firstWhere(
      (item) => item.product.id == productId,
      orElse: () => CartItem(product: ProductModel(id: 0, title: '', description: '', price: 0, category: '', image: '')),
    );
    return item.quantity;
  }
}

