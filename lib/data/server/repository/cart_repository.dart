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
  Future<CartItemModel?> updateQuantity(
    String token,
    String productId,
    int quantity,
  );
  Future<bool> removeFromCart(String token, String productId);
  Future<bool> clearCart(String token);
}

/// Default implementation of CartRepository
class CartRepositoryImpl implements CartRepository {
  final CartApiService cartApiService;

  CartRepositoryImpl({required this.cartApiService});

  // Local cache base key for cart data; keys are suffixed by user id
  static const String _cartCacheKeyBase = 'cart_cache';
  static const String _cartTimestampKeyBase = 'cart_timestamp';

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
  /// Save cart to local cache. If [userId] is provided, the cache is
  /// stored per-user under a key suffixed with the user id.
  static Future<void> saveCartToCache(
    CartResponse cart, {
    String? userId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final key = userId == null
        ? _cartCacheKeyBase
        : '${_cartCacheKeyBase}_$userId';
    final tsKey = userId == null
        ? _cartTimestampKeyBase
        : '${_cartTimestampKeyBase}_$userId';
    await prefs.setString(key, jsonEncode(cart.toMap()));
    await prefs.setInt(tsKey, DateTime.now().millisecondsSinceEpoch);
  }

  /// Get cart from local cache
  /// Get cart from local cache for optional [userId]. Returns null if not
  /// present or expired.
  static Future<CartResponse?> getCartFromCache({String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    final key = userId == null
        ? _cartCacheKeyBase
        : '${_cartCacheKeyBase}_$userId';
    final tsKey = userId == null
        ? _cartTimestampKeyBase
        : '${_cartTimestampKeyBase}_$userId';
    final cartData = prefs.getString(key);
    final timestamp = prefs.getInt(tsKey);

    if (cartData == null || timestamp == null) {
      return null;
    }

    // Cache expires after 24 hours
    final age = DateTime.now().millisecondsSinceEpoch - timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      // Cache expired
      await prefs.remove(key);
      await prefs.remove(tsKey);
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
  /// Clear cart cache for optional [userId]. If [userId] is null, clears
  /// the global cache key.
  static Future<void> clearCartCache({String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    final key = userId == null
        ? _cartCacheKeyBase
        : '${_cartCacheKeyBase}_$userId';
    final tsKey = userId == null
        ? _cartTimestampKeyBase
        : '${_cartTimestampKeyBase}_$userId';
    await prefs.remove(key);
    await prefs.remove(tsKey);
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
