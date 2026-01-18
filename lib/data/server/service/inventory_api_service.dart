import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/constants.dart';

class InventoryApiService {
  final String baseUrl = AppConstants.baseUrl;
  final String? token;
  static const Duration timeout = Duration(seconds: 15);

  InventoryApiService({this.token});

  Map<String, String> _getHeaders() {
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Add stock to a product
  Future<ProductModel> addStock(int productId, int quantity) async {
    try {
      final url = '$baseUrl${AppConstants.inventoryEndpoint}/$productId/add';
      print('DEBUG: Adding stock - URL: $url');
      print('DEBUG: Headers: ${_getHeaders()}');
      print('DEBUG: Body: ${jsonEncode({'quantity': quantity})}');

      final response = await http
          .post(
            Uri.parse(url),
            headers: _getHeaders(),
            body: jsonEncode({'quantity': quantity}),
          )
          .timeout(timeout);

      print('DEBUG: Response status: ${response.statusCode}');
      print('DEBUG: Response body: ${response.body}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        if (json['success'] == true) {
          return ProductModel.fromJson(json['data']);
        } else {
          throw Exception(json['message'] ?? 'Gagal menambah stok');
        }
      } else {
        throw Exception('Error: ${response.statusCode}');
      }
    } catch (e) {
      print('ERROR in addStock: $e');
      throw Exception('Error adding stock: $e');
    }
  }

  /// Remove stock from a product
  Future<ProductModel> removeStock(int productId, int quantity) async {
    try {
      final response = await http
          .post(
            Uri.parse(
              '$baseUrl${AppConstants.inventoryEndpoint}/$productId/remove',
            ),
            headers: _getHeaders(),
            body: jsonEncode({'quantity': quantity}),
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        if (json['success'] == true) {
          return ProductModel.fromJson(json['data']);
        } else {
          throw Exception(json['message'] ?? 'Gagal mengurangi stok');
        }
      } else {
        throw Exception('Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error removing stock: $e');
    }
  }

  /// Set stock to a specific value
  Future<ProductModel> setStock(int productId, int quantity) async {
    try {
      final response = await http
          .put(
            Uri.parse(
              '$baseUrl${AppConstants.inventoryEndpoint}/$productId/set',
            ),
            headers: _getHeaders(),
            body: jsonEncode({'quantity': quantity}),
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        if (json['success'] == true) {
          return ProductModel.fromJson(json['data']);
        } else {
          throw Exception(json['message'] ?? 'Gagal mengatur stok');
        }
      } else {
        throw Exception('Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error setting stock: $e');
    }
  }

  /// Get current stock for a product
  Future<int> getStock(int productId) async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl${AppConstants.inventoryEndpoint}/$productId'),
            headers: _getHeaders(),
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        if (json['success'] == true) {
          return json['data']['stock'] ?? 0;
        } else {
          throw Exception(json['message'] ?? 'Gagal mengambil stok');
        }
      } else {
        throw Exception('Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting stock: $e');
    }
  }
}
