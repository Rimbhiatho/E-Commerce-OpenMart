import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:openmart/data/server/model/product_model.dart';

class ProductApiService {
  final String baseUrl = 'https://fakestoreapi.com';

  Future<List<ProductModel>> fetchProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products'));

    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((e) => ProductModel.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }
}
