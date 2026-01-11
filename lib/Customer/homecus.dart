import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:openmart/Customer/shares/cartproduct.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/service/product_api_service.dart';
import 'package:openmart/data/server/usecase/get_product_usecase.dart';
import 'package:openmart/data/local/db/database_helper.dart';
import 'package:openmart/data/server/repository/product_repository.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';
import 'package:openmart/login_page.dart';

class CustomerHome extends StatefulWidget {
  const CustomerHome({super.key});

  @override
  State<CustomerHome> createState() => _CustomerHomeState();
}

class _CustomerHomeState extends State<CustomerHome> {
  late final GetProductsUseCase useCase;
  late Future<List<ProductModel>> futureProducts;

  @override
  void initState() {
    super.initState();
    final apiService = ProductApiService();
    final dbHelper = DatabaseHelper.instance;
    final repository = ProductRepository(apiService, dbHelper);
    useCase = GetProductsUseCase(repository);
    futureProducts = useCase.execute();
  }

  Future<void> _handleLogout() async {
    final authProvider = context.read<AuthProvider>();
    await authProvider.logout();
    
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('OpenMart'),
        actions: [
          // Show user name if logged in
          if (authProvider.user != null)
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Center(
                child: Text(
                  authProvider.user!.name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          // Logout button
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: FutureBuilder<List<ProductModel>>(
        future: futureProducts,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${snapshot.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        futureProducts = useCase.execute();
                      });
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No products available'));
          } else {
            final products = snapshot.data!;
            return GridView.builder(
              padding: const EdgeInsets.all(8.0),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, // 2 columns
                childAspectRatio: 0.7, // more square shape
                crossAxisSpacing: 8.0,
                mainAxisSpacing: 8.0,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return CartProduct(
                  imageurl: product.image,
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

