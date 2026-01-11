import 'package:flutter/material.dart';
import 'package:openmart/Customer/shares/cartproduct.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/service/product_api_service.dart';
import 'package:openmart/data/server/usecase/get_product_usecase.dart';
import 'package:openmart/data/local/db/database_helper.dart';
import 'package:openmart/data/server/repository/product_repository.dart';

class CustomerHome extends StatefulWidget {
  const CustomerHome({super.key});

  @override
  State<CustomerHome> createState() => _CustomerHomeState();
}

class _CustomerHomeState extends State<CustomerHome> {
  late final GetProductsUseCase UseCase;
  late Future<List<ProductModel>> futureProducts;

  @override
  void initState() {
    super.initState();
    final apiService = ProductApiService();
    final dbHelper = DatabaseHelper.instance;
    final repository = ProductRepository(apiService, dbHelper);
    UseCase = GetProductsUseCase(repository);
    futureProducts = UseCase.execute();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('produk customer')),
      body: FutureBuilder<List<ProductModel>>(
        future: futureProducts,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No products available'));
          } else {
            final products = snapshot.data!;
            return GridView.builder(
              padding: const EdgeInsets.all(8.0),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, // 2 kolom
                childAspectRatio: 0.7, // bentuk lebih persegi
                crossAxisSpacing: 8.0,
                mainAxisSpacing: 8.0,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return CartProduct(
                  imageurl: product.image, // sesuai ProductModel
                  productname: product.title,
                  productprice: product.price,
                  onpress: () {},
                );
              },
            );
          }
        },
      ),
    );
  }
}
