import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:openmart/data/server/constants.dart';
import 'package:openmart/data/server/model/cart_model.dart';

/// CartApiService handles all cart-related API calls
class CartApiService {
  static const Duration timeout = Duration(seconds: 15);
  final String baseUrl = AppConstants.baseUrl;

  // Singleton pattern
  static final CartApiService instance = CartApiService._();
  factory CartApiService() => instance;
  CartApiService._();

  /// Get authorization headers with Bearer token
  Map<String, String> _getAuthHeaders(String token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Helper to parse JSON response
  Map<String, dynamic> _parseResponse(http.Response response) {
    try {
      return json.decode(response.body) as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Invalid response format: ${response.body}');
    }
  }

  /// Get cart items for authenticated user
  /// Requires authentication token
  Future<CartResponse> getCart(String token) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl/cart'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return CartResponse.fromJson(json['data']);
    } else {
      throw Exception(json['message'] ?? 'Failed to get cart');
    }
  }

  /// Add item to cart
  /// Requires authentication token
  Future<CartItemModel> addToCart(
    String token,
    AddToCartRequest request,
  ) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/cart/items'),
          headers: _getAuthHeaders(token),
          body: jsonEncode(request.toJson()),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return CartItemModel.fromJson(json['data']);
    } else {
      throw Exception(json['message'] ?? 'Failed to add item to cart');
    }
  }

  /// Update quantity of a cart item
  /// Requires authentication token
  Future<CartItemModel?> updateQuantity(
    String token,
    String productId,
    int quantity,
  ) async {
    final response = await http
        .put(
          Uri.parse('$baseUrl/cart/items/$productId'),
          headers: _getAuthHeaders(token),
          body: jsonEncode({'quantity': quantity}),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      final data = json['data'];
      if (data == null) {
        return null; // Item was removed
      }
      return CartItemModel.fromJson(data);
    } else {
      throw Exception(json['message'] ?? 'Failed to update quantity');
    }
  }

  /// Remove item from cart
  /// Requires authentication token
  Future<bool> removeFromCart(String token, String productId) async {
    final response = await http
        .delete(
          Uri.parse('$baseUrl/cart/items/$productId'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return true;
    } else {
      throw Exception(json['message'] ?? 'Failed to remove item');
    }
  }

  /// Clear entire cart
  /// Requires authentication token
  Future<bool> clearCart(String token) async {
    final response = await http
        .delete(
          Uri.parse('$baseUrl/cart'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return true;
    } else {
      throw Exception(json['message'] ?? 'Failed to clear cart');
    }
  }
}

