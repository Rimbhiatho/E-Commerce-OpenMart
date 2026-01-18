import 'package:openmart/data/local/db/database_helper.dart';
import 'package:openmart/data/server/service/backend_product_api_service.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:sqflite/sqflite.dart';

class ProductRepository {
  final BackendProductApiService apiService;
  final DatabaseHelper dbHelper;

  ProductRepository(this.apiService, this.dbHelper);

  /// Fetch products from API and cache to local database
  Future<List<ProductModel>> getProducts() async {
    try {
      final products = await apiService.fetchProducts();

      final db = await dbHelper.database;

      for (var product in products) {
        await db.insert(
          'products',
          product.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }

      return products;
    } catch (e) {
      // If API fails, try to get from local database
      final db = await dbHelper.database;
      final maps = await db.query('products');
      if (maps.isNotEmpty) {
        return maps.map((map) {
          return ProductModel(
            id: map['id'] as int,
            title: map['title'] as String,
            description: map['description'] as String,
            price: map['price'] as double,
            category: map['category'] as String,
            image: map['image'] as String,
            stock: map['stock'] as int? ?? 0,
          );
        }).toList();
      }
      rethrow;
    }
  }

  /// Fetch a single product by ID
  Future<ProductModel> getProduct(int productId) async {
    try {
      return await apiService.fetchProduct(productId);
    } catch (e) {
      // Try local database
      final db = await dbHelper.database;
      final maps = await db.query(
        'products',
        where: 'id = ?',
        whereArgs: [productId],
      );

      if (maps.isNotEmpty) {
        final map = maps.first;
        return ProductModel(
          id: map['id'] as int,
          title: map['title'] as String,
          description: map['description'] as String,
          price: map['price'] as double,
          category: map['category'] as String,
          image: map['image'] as String,
          stock: map['stock'] as int? ?? 0,
        );
      }
      rethrow;
    }
  }

  /// Update product stock in local database
  Future<void> updateLocalStock(int productId, int newStock) async {
    final db = await dbHelper.database;
    await db.update(
      'products',
      {'stock': newStock},
      where: 'id = ?',
      whereArgs: [productId],
    );
  }

  /// Search products
  Future<List<ProductModel>> searchProducts(String keyword) async {
    try {
      return await apiService.searchProducts(keyword);
    } catch (e) {
      // Fallback to local database search
      final db = await dbHelper.database;
      final maps = await db.query(
        'products',
        where: 'title LIKE ? OR description LIKE ?',
        whereArgs: ['%$keyword%', '%$keyword%'],
      );

      return maps.map((map) {
        return ProductModel(
          id: map['id'] as int,
          title: map['title'] as String,
          description: map['description'] as String,
          price: map['price'] as double,
          category: map['category'] as String,
          image: map['image'] as String,
          stock: map['stock'] as int? ?? 0,
        );
      }).toList();
    }
  }
}
