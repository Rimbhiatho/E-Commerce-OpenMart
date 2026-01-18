import 'package:flutter/material.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/service/backend_product_api_service.dart';
import 'package:openmart/data/server/usecase/get_product_usecase.dart';
import 'package:openmart/data/local/db/database_helper.dart';
import 'package:openmart/data/server/repository/product_repository.dart';

/// ProductProvider manages product data and provides reactive updates
/// This allows product list to be refreshed and shared across the app
class ProductProvider extends ChangeNotifier {
  final GetProductsUseCase _useCase;
  List<ProductModel> _products = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<ProductModel> get products => _products;
  bool get isLoading => _isLoading;
  String? get error => _error;

  ProductProvider({GetProductsUseCase? useCase})
    : _useCase = useCase ?? _createDefaultUseCase();

  static GetProductsUseCase _createDefaultUseCase() {
    final apiService = BackendProductApiService();
    final dbHelper = DatabaseHelper.instance;
    final repository = ProductRepository(apiService, dbHelper);
    return GetProductsUseCase(repository);
  }

  /// Load products from server/database
  Future<void> loadProducts() async {
    if (_isLoading) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _products = await _useCase.execute();
    } catch (e) {
      _error = 'Gagal memuat produk: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Reload products (force refresh from server)
  Future<void> reloadProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _products = await _useCase.execute();
    } catch (e) {
      _error = 'Gagal memuat produk: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get a single product by ID
  ProductModel? getProductById(int id) {
    try {
      return _products.firstWhere((p) => p.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Update local product stock (for immediate UI update after purchase)
  void updateProductStock(int productId, int newStock) {
    final index = _products.indexWhere((p) => p.id == productId);
    if (index >= 0) {
      _products[index] = ProductModel(
        id: _products[index].id,
        title: _products[index].title,
        description: _products[index].description,
        price: _products[index].price,
        category: _products[index].category,
        image: _products[index].image,
        stock: newStock,
      );
      notifyListeners();
    }
  }

  /// Get products filtered by category
  List<ProductModel> getProductsByCategory(String category) {
    if (category == 'All') return _products;
    return _products.where((p) => p.category.trim() == category).toList();
  }

  /// Search products by title
  List<ProductModel> searchProducts(String query) {
    final lowerQuery = query.toLowerCase();
    return _products
        .where((p) => p.title.toLowerCase().contains(lowerQuery))
        .toList();
  }

  /// Clear error state
  void clearError() {
    _error = null;
    notifyListeners();
  }
}

