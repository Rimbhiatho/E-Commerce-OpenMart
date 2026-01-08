import 'package:openmart/data/local/db/database_helper.dart';
import 'package:openmart/data/server/service/product_api_service.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:sqflite/sqflite.dart';

class ProductRepository {
  final ProductApiService apiService;
  final DatabaseHelper dbHelper;

  ProductRepository(this.apiService, this.dbHelper);

  Future<List<ProductModel>> getProducts() async {
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
  }
}
