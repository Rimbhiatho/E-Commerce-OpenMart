import 'dart:async';
import 'dart:convert';
import 'package:openmart/data/server/model/cart_model.dart';
import 'package:openmart/data/server/service/cart_api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:openmart/data/server/constants.dart';

/// Abstract interface for cart repository
abstract class CartRepository {
  Future<CartResponse> getCart(String token);
  Future<CartItemModel> addToCart(String token, AddToCartRequest request);
  Future<CartItemModel?> updateQuantity(String token, String productId, int quantity);
  Future<bool> removeFromCart(String token, String productId);
  Future<bool> clearCart(String token);
}

/// Default implementation of CartRepository
class CartRepositoryImpl implements CartRepository {
  final CartApiService cartApiService;

  CartRepositoryImpl({required this.cartApiService});

  // Local cache key for cart data
  static const String _cartCacheKey = 'cart_cache';
  static const String _cartTimestampKey = 'cart_timestamp';

  @override
  Future<CartResponse> getCart(String token) {
    return cartApiService.getCart(token);
  }

  @override
  Future<CartItemModel> addToCart(String token, AddToCartRequest request) {
    return cartApiService.addToCart(token, request);
  }

  @override
  Future<CartItemModel?> updateQuantity(
    String token,
    String productId,
    int quantity,
  ) {
    return cartApiService.updateQuantity(token, productId, quantity);
  }

  @override
  Future<bool> removeFromCart(String token, String productId) {
    return cartApiService.removeFromCart(token, productId);
  }

  @override
  Future<bool> clearCart(String token) {
    return cartApiService.clearCart(token);
  }

  /// Save cart to local cache (for offline access)
  static Future<void> saveCartToCache(CartResponse cart) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cartCacheKey, jsonEncode(cart.toMap()));
    await prefs.setInt(_cartTimestampKey, DateTime.now().millisecondsSinceEpoch);
  }

  /// Get cart from local cache
  static Future<CartResponse?> getCartFromCache() async {
    final prefs = await SharedPreferences.getInstance();
    final cartData = prefs.getString(_cartCacheKey);
    final timestamp = prefs.getInt(_cartTimestampKey);

    if (cartData == null || timestamp == null) {
      return null;
    }

    // Cache expires after 24 hours
    final age = DateTime.now().millisecondsSinceEpoch - timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      // Cache expired
      await prefs.remove(_cartCacheKey);
      await prefs.remove(_cartTimestampKey);
      return null;
    }

    try {
      final Map<String, dynamic> data = jsonDecode(cartData);
      return CartResponse(
        items: (data['items'] as List)
            .map((item) => CartItemModel.fromJson(item))
            .toList(),
        itemCount: data['itemCount'] ?? 0,
        totalPrice: (data['totalPrice'] ?? 0.0).toDouble(),
      );
    } catch (e) {
      return null;
    }
  }

  /// Clear cart cache
  static Future<void> clearCartCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cartCacheKey);
    await prefs.remove(_cartTimestampKey);
  }
}

/// Extension to convert CartResponse to cache map
extension CartResponseToMap on CartResponse {
  Map<String, dynamic> toMap() {
    return {
      'items': items.map((item) => item.toMap()).toList(),
      'itemCount': itemCount,
      'totalPrice': totalPrice,
    };
  }
}

