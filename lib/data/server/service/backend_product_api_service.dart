import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/constants.dart';

class BackendProductApiService {
  final String baseUrl = AppConstants.baseUrl;
  static const Duration timeout = Duration(seconds: 15);

  /// Fetch all products from backend
  Future<List<ProductModel>> fetchProducts() async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl${AppConstants.productsEndpoint}'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        print('API Response: $json'); // DEBUG
        if (json['success'] == true && json['data'] is List) {
          final List products = json['data'];
          print('Products count: ${products.length}'); // DEBUG
          if (products.isNotEmpty) {
            print('First product: ${products[0]}'); // DEBUG
          }
          return products.map((e) => ProductModel.fromJson(e)).toList();
        } else {
          throw Exception('Invalid response format');
        }
      } else {
        throw Exception('Failed to load products: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching products: $e');
    }
  }

  /// Fetch single product by ID
  Future<ProductModel> fetchProduct(int productId) async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl${AppConstants.productsEndpoint}/$productId'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        if (json['success'] == true && json['data'] != null) {
          return ProductModel.fromJson(json['data']);
        } else {
          throw Exception('Product not found');
        }
      } else {
        throw Exception('Failed to load product: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching product: $e');
    }
  }

  /// Search products by keyword
  Future<List<ProductModel>> searchProducts(String keyword) async {
    try {
      final response = await http
          .get(
            Uri.parse(
              '$baseUrl${AppConstants.productsEndpoint}/search?q=$keyword',
            ),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        if (json['success'] == true && json['data'] is List) {
          final List products = json['data'];
          return products.map((e) => ProductModel.fromJson(e)).toList();
        } else {
          return [];
        }
      } else {
        throw Exception('Search failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error searching products: $e');
    }
  }
}
