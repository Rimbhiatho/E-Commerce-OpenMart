import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:openmart/Customer/shares/cartproduct.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/service/product_api_service.dart';
import 'package:openmart/data/server/usecase/get_product_usecase.dart';
import 'package:openmart/data/local/db/database_helper.dart';
import 'package:openmart/data/server/repository/product_repository.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';
import 'package:openmart/presentation/controllers/cart_provider.dart';
import 'package:openmart/login_page.dart';
import 'package:openmart/Customer/pages/keranjang.dart';
import 'package:openmart/Customer/pages/history.dart';
import 'package:openmart/Customer/pages/profil.dart';

class CustomerHome extends StatefulWidget {
  const CustomerHome({super.key});

  @override
  State<CustomerHome> createState() => _CustomerHomeState();
}

class _CustomerHomeState extends State<CustomerHome> {
  late final GetProductsUseCase useCase;
  late Future<List<ProductModel>> futureProducts;
  int _selectedIndex = 0;

  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'All';
  List<String> _categories = [];

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    final apiService = ProductApiService();
    final dbHelper = DatabaseHelper.instance;
    final repository = ProductRepository(apiService, dbHelper);
    useCase = GetProductsUseCase(repository);
    futureProducts = useCase.execute();
    _searchController.addListener(_onSearchChanged);
    _pages = [
      _homePage(),
      const KeranjangPage(),
      const HistoryPage(),
      const ProfilePage(),
    ];
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text.toLowerCase();
    });
  }

  void _onCategorySelected(String category) {
    setState(() {
      _selectedCategory = category;
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _handleLogout() async {
    final authProvider = context.read<AuthProvider>();
    final cartProvider = context.read<CartProvider>();

    // Save cart to cache before logout (per-user)
    await cartProvider.saveToCache(userId: authProvider.user?.id);

    // Clear cart from memory
    await cartProvider.clearCart();

    await authProvider.logout();

    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginPage()),
      );
    }
  }

  Widget _homePage() {
    return FutureBuilder<List<ProductModel>>(
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
          _categories = products.map((p) => p.category).toSet().toList();
          final filteredProducts = products
              .where(
                (product) =>
                    product.title.toLowerCase().contains(_searchQuery) &&
                    (_selectedCategory == 'All' ||
                        product.category == _selectedCategory),
              )
              .toList();
          return Column(
            children: [
              searchBar(),
              categorySelector(),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(8.0),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.7,
                    crossAxisSpacing: 8.0,
                    mainAxisSpacing: 8.0,
                  ),
                  itemCount: filteredProducts.length,
                  itemBuilder: (context, index) {
                    final product = filteredProducts[index];
                    return GestureDetector(
                      onTap: () {
                        // Add to cart when an item is tapped
                        context.read<CartProvider>().addToCart(product);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              '${product.title} ditambahkan ke keranjang',
                            ),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                      child: CartProduct(
                        imageurl: product.image,
                        productname: product.title,
                        productprice: product.price,
                        onpress: () {
                          context.read<CartProvider>().addToCart(product);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                '${product.title} ditambahkan ke keranjang',
                              ),
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        }
      },
    );
  }

  Widget searchBar() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search products',
          prefixIcon: Icon(Icons.search),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
        ),
      ),
    );
  }

  Widget categorySelector() {
    return Container(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8.0),
        itemCount: _categories.length + 1,
        itemBuilder: (context, index) {
          final category = index == 0 ? 'All' : _categories[index - 1];
          final isSelected = _selectedCategory == category;
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: FilterChip(
              label: Text(category),
              selected: isSelected,
              onSelected: (_) => _onCategorySelected(category),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('OpenMart'),
        actions: [
          if (authProvider.user != null)
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Center(
                child: Text(
                  "Wolcome " + authProvider.user!.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),

          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: IndexedStack(index: _selectedIndex, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.add_shopping_cart_outlined),
            selectedIcon: Icon(Icons.add_shopping_cart_rounded),
            label: 'Keranjang',
          ),
          NavigationDestination(
            icon: Icon(Icons.article_outlined),
            selectedIcon: Icon(Icons.article_rounded),
            label: 'Transaksi',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
