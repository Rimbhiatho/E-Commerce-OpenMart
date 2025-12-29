import 'package:openmart/data/server/repository/product_repository.dart';
import 'package:openmart/data/server/model/product_model.dart';

class GetProductsUseCase {
  final ProductRepository repository;

  GetProductsUseCase(this.repository);

  Future<List<ProductModel>> execute() {
    return repository.getProducts();
  }
}
