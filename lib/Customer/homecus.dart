import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:openmart/Customer/shares/cartproduct.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/service/backend_product_api_service.dart';
import 'package:openmart/data/server/usecase/get_product_usecase.dart';
import 'package:openmart/data/local/db/database_helper.dart';
import 'package:openmart/data/server/repository/product_repository.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';
import 'package:openmart/presentation/controllers/cart_provider.dart';
import 'package:openmart/presentation/controllers/product_provider.dart';
import 'package:openmart/presentation/controllers/wallet_provider.dart';
import 'package:openmart/login_page.dart';
import 'package:openmart/Customer/pages/keranjang.dart';
import 'package:openmart/Customer/pages/transaksi.dart';
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

  @override
  void initState() {
    super.initState();
    final apiService = BackendProductApiService();
    final dbHelper = DatabaseHelper.instance;
    final repository = ProductRepository(apiService, dbHelper);
    useCase = GetProductsUseCase(repository);
    futureProducts = useCase.execute();
    _searchController.addListener(_onSearchChanged);
  }

  List<Widget> get _pages => [
    _homePage(),
    const KeranjangPage(),
    const HistoryPage(),
    const ProfilePage(),
  ];

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

    await cartProvider.saveToCache(userId: authProvider.user?.id);

    await cartProvider.clearCart();

    await authProvider.logout();

    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginPage()),
      );
    }
  }

  Widget _homePage() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().loadProducts();
    });

    return Consumer<ProductProvider>(
      builder: (context, productProvider, child) {
        if (productProvider.isLoading && productProvider.products.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (productProvider.error != null && productProvider.products.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Error: ${productProvider.error}'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    productProvider.loadProducts();
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (productProvider.products.isEmpty) {
          return const Center(child: Text('No products available'));
        }

        final products = productProvider.products;
        _categories = products
            .map((p) => p.category.trim())
            .where((c) => c.isNotEmpty)
            .toSet()
            .toList();
        _categories.sort();

        final filteredProducts = products.where((product) {
          final titleMatch = product.title.toLowerCase().contains(_searchQuery);
          final prodCategory = product.category.trim();
          final categoryMatch =
              _selectedCategory == 'All' || prodCategory == _selectedCategory;
          return titleMatch && categoryMatch;
        }).toList();

        return Column(
          children: [
            searchBar(),
            categorySelector(),
            Expanded(
              child: Stack(
                children: [
                  GridView.builder(
                    padding: const EdgeInsets.all(8.0),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.7,
                          crossAxisSpacing: 8.0,
                          mainAxisSpacing: 8.0,
                        ),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = filteredProducts[index];
                      final isOutOfStock = product.stock <= 0;

                      return GestureDetector(
                        onTap: isOutOfStock
                            ? null
                            : () {
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
                          stock: product.stock,
                          onpress: isOutOfStock
                              ? () {}
                              : () {
                                  context.read<CartProvider>().addToCart(
                                    product,
                                  );
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
                  if (productProvider.isLoading &&
                      productProvider.products.isNotEmpty)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.green.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget searchBar() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        children: [
          // Saldo Card
          Consumer<WalletProvider>(
            builder: (context, walletProvider, child) {
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12.0),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.green[400]!, Colors.green[600]!],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Saldo Akun',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Rp ${walletProvider.balance.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12.0,
                          vertical: 8.0,
                        ),
                        child: const Row(),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search products',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                      },
                    )
                  : null,
            ),
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => setState(() {}),
          ),
        ],
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
              onSelected: (selected) =>
                  _onCategorySelected(selected ? category : 'All'),
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
        backgroundColor: Colors.green,
        title: const Text('OpenMart'),
        titleTextStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
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
                    color: Colors.white,
                  ),
                ),
              ),
            ),

          IconButton(
            icon: const Icon(Icons.logout),
            style: ButtonStyle(
              foregroundColor: MaterialStateProperty.all<Color>(Colors.white),
            ),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: IndexedStack(index: _selectedIndex, children: _pages),
      bottomNavigationBar: NavigationBar(
        backgroundColor: Colors.green[50],
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
