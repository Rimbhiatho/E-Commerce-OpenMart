import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:openmart/data/server/constants.dart';
import 'package:openmart/data/server/model/order_model.dart';

/// OrderApiService handles all order-related API calls
/// Includes both user and admin endpoints
class OrderApiService {
  static const Duration timeout = Duration(seconds: 15);
  final String baseUrl = AppConstants.baseUrl;

  // Singleton pattern
  static final OrderApiService instance = OrderApiService._();
  factory OrderApiService() => instance;
  OrderApiService._();

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

  // ==================== User Endpoints ====================

  /// Get orders for the authenticated user
  /// Requires authentication token
  Future<OrderListResponse> getMyOrders(String token) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl/orders/my-orders'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return OrderListResponse.fromJson(json['data'] ?? {});
    } else {
      throw Exception(json['message'] ?? 'Failed to get orders');
    }
  }

  /// Create a new order
  /// Requires authentication token
  Future<OrderModel> createOrder(String token, Map<String, dynamic> orderData) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/orders'),
          headers: _getAuthHeaders(token),
          body: jsonEncode(orderData),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return OrderModel.fromJson(json['data'] ?? json['order'] ?? {});
    } else {
      throw Exception(json['message'] ?? 'Failed to create order');
    }
  }

  /// Get order by ID
  /// Requires authentication token
  Future<OrderModel> getOrderById(String token, String orderId) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl/orders/$orderId'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return OrderModel.fromJson(json['data'] ?? json['order'] ?? {});
    } else {
      throw Exception(json['message'] ?? 'Failed to get order');
    }
  }

  /// Cancel an order
  /// Requires authentication token
  Future<bool> cancelOrder(String token, String orderId) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/orders/$orderId/cancel'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return true;
    } else {
      throw Exception(json['message'] ?? 'Failed to cancel order');
    }
  }

  // ==================== Admin Endpoints ====================

  /// Get all orders (admin only)
  /// Requires authentication token with admin role
  Future<List<OrderModel>> getAllOrders(String token) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl/orders'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      final ordersList = (json['data'] as List?) ?? [];
      return ordersList
          .map((order) => OrderModel.fromJson(order as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception(json['message'] ?? 'Failed to get all orders');
    }
  }

  /// Get orders by status (admin only)
  /// Requires authentication token with admin role
  Future<List<OrderModel>> getOrdersByStatus(String token, String status) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl/orders/status/$status'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      final ordersList = (json['data'] as List?) ?? [];
      return ordersList
          .map((order) => OrderModel.fromJson(order as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception(json['message'] ?? 'Failed to get orders by status');
    }
  }

  /// Update order status (admin only)
  /// Requires authentication token with admin role
  Future<OrderModel> updateOrderStatus(
    String token,
    String orderId,
    String status,
  ) async {
    final response = await http
        .put(
          Uri.parse('$baseUrl/orders/$orderId/status'),
          headers: _getAuthHeaders(token),
          body: jsonEncode({'status': status}),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return OrderModel.fromJson(json['data'] ?? json['order'] ?? {});
    } else {
      throw Exception(json['message'] ?? 'Failed to update order status');
    }
  }

  /// Update payment status (admin only)
  /// Requires authentication token with admin role
  Future<OrderModel> updatePaymentStatus(
    String token,
    String orderId,
    String paymentStatus,
  ) async {
    final response = await http
        .put(
          Uri.parse('$baseUrl/orders/$orderId/payment'),
          headers: _getAuthHeaders(token),
          body: jsonEncode({'paymentStatus': paymentStatus}),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return OrderModel.fromJson(json['data'] ?? json['order'] ?? {});
    } else {
      throw Exception(json['message'] ?? 'Failed to update payment status');
    }
  }

  /// Delete an order (admin only)
  /// Requires authentication token with admin role
  Future<bool> deleteOrder(String token, String orderId) async {
    final response = await http
        .delete(
          Uri.parse('$baseUrl/orders/$orderId'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return true;
    } else {
      throw Exception(json['message'] ?? 'Failed to delete order');
    }
  }
}

