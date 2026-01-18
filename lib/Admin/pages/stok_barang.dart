import 'package:flutter/material.dart';
import 'package:openmart/data/server/model/product_model.dart';
import 'package:openmart/data/server/service/inventory_api_service.dart';
import 'package:openmart/data/server/service/backend_product_api_service.dart';
import 'package:openmart/data/server/service/auth_api_service.dart';
import 'package:openmart/data/local/db/database_helper.dart';
import 'package:openmart/data/server/repository/product_repository.dart';
import 'package:openmart/data/server/usecase/get_product_usecase.dart';

class StokBarangPage extends StatefulWidget {
  const StokBarangPage({super.key});

  @override
  State<StokBarangPage> createState() => _StokBarangPageState();
}

class _StokBarangPageState extends State<StokBarangPage> {
  late final GetProductsUseCase _useCase;
  late Future<List<ProductModel>> _futureProducts;
  late final InventoryApiService _inventoryService;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final apiService = BackendProductApiService();
    final dbHelper = DatabaseHelper.instance;
    final repository = ProductRepository(apiService, dbHelper);
    _useCase = GetProductsUseCase(repository);

    // Initialize InventoryApiService with auth token
    final authService = AuthApiService.instance;
    final token = authService.getStoredToken();

    if (token == null) {
      print('WARNING: Auth token is null!');
    } else {
      print('DEBUG: Auth token found: ${token.substring(0, 20)}...');
    }

    _inventoryService = InventoryApiService(token: token);

    _loadProducts();
  }

  void _loadProducts() {
    setState(() {
      _futureProducts = _useCase.execute();
      _errorMessage = null;
    });
  }

  Future<void> _tambahStok(ProductModel product) async {
    final TextEditingController jumlahController = TextEditingController();

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Tambah Stok - ${product.title}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Stok saat ini: ${product.stock}'),
            const SizedBox(height: 16),
            TextField(
              controller: jumlahController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Jumlah yang ditambahkan',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final jumlah = int.tryParse(jumlahController.text);
              if (jumlah == null || jumlah <= 0) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Masukkan jumlah yang valid')),
                );
                return;
              }

              Navigator.pop(context);
              await _prosesTambahStok(product, jumlah);
            },
            child: const Text('Tambah'),
          ),
        ],
      ),
    );
  }

  Future<void> _prosesTambahStok(ProductModel product, int jumlah) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      print(
        'DEBUG: Adding stock to product ID ${product.id}, quantity: $jumlah',
      );
      print('DEBUG: Token is null: ${_inventoryService.token == null}');

      final updatedProduct = await _inventoryService.addStock(
        product.id,
        jumlah,
      );

      // Update local database with new stock value
      final db = await DatabaseHelper.instance.database;
      await db.update(
        'products',
        {'stock': updatedProduct.stock},
        where: 'id = ?',
        whereArgs: [product.id],
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Stok ${product.title} berhasil ditambahkan +$jumlah'),
          backgroundColor: Colors.green,
        ),
      );

      // Reload products to get updated data
      _loadProducts();
    } catch (e) {
      print('ERROR: Failed to add stock: $e');
      setState(() {
        _errorMessage = 'Gagal menambahkan stok: $e';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage!), backgroundColor: Colors.red),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _kurangiStok(ProductModel product) async {
    final TextEditingController jumlahController = TextEditingController();

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Kurangi Stok - ${product.title}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Stok saat ini: ${product.stock}',
              style: TextStyle(
                color: product.stock > 0 ? Colors.black : Colors.red,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: jumlahController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Jumlah yang dikurangi',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final jumlah = int.tryParse(jumlahController.text);
              if (jumlah == null || jumlah <= 0) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Masukkan jumlah yang valid')),
                );
                return;
              }
              if (jumlah > product.stock) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Stok tidak cukup (max: ${product.stock})'),
                  ),
                );
                return;
              }

              Navigator.pop(context);
              await _prosesKurangiStok(product, jumlah);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Kurangi'),
          ),
        ],
      ),
    );
  }

  Future<void> _prosesKurangiStok(ProductModel product, int jumlah) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final updatedProduct = await _inventoryService.removeStock(
        product.id,
        jumlah,
      );

      // Update local database with new stock value
      final db = await DatabaseHelper.instance.database;
      await db.update(
        'products',
        {'stock': updatedProduct.stock},
        where: 'id = ?',
        whereArgs: [product.id],
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Stok ${product.title} berhasil dikurangi -$jumlah'),
          backgroundColor: Colors.orange,
        ),
      );
      _loadProducts();
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal mengurangi stok: $e';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage!), backgroundColor: Colors.red),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _aturStok(ProductModel product) async {
    final TextEditingController stokController = TextEditingController(
      text: product.stock.toString(),
    );

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Atur Stok - ${product.title}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Stok saat ini: ${product.stock}'),
            const SizedBox(height: 16),
            TextField(
              controller: stokController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Stok baru',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final stokBaru = int.tryParse(stokController.text);
              if (stokBaru == null || stokBaru < 0) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Masukkan stok yang valid')),
                );
                return;
              }

              Navigator.pop(context);
              await _prosesAturStok(product, stokBaru);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  Future<void> _prosesAturStok(ProductModel product, int stokBaru) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final updatedProduct = await _inventoryService.setStock(
        product.id,
        stokBaru,
      );

      // Update local database with new stock value
      final db = await DatabaseHelper.instance.database;
      await db.update(
        'products',
        {'stock': updatedProduct.stock},
        where: 'id = ?',
        whereArgs: [product.id],
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Stok ${product.title} berhasil diatur menjadi $stokBaru',
          ),
          backgroundColor: Colors.blue,
        ),
      );
      _loadProducts();
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal mengatur stok: $e';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage!), backgroundColor: Colors.red),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Color _getStockColor(int stock) {
    if (stock == 0) return Colors.red;
    if (stock <= 10) return Colors.orange;
    return Colors.green;
  }

  Icon _getStockIcon(int stock) {
    if (stock == 0) return const Icon(Icons.error, color: Colors.red);
    if (stock <= 10) return const Icon(Icons.warning, color: Colors.orange);
    return const Icon(Icons.check_circle, color: Colors.green);
  }

  Future<void> _setAllStockTo100() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Update all products in local database to have stock of 100
      final db = await DatabaseHelper.instance.database;
      await db.update(
        'products',
        {'stock': 100},
        where: '1 = 1', // Update all rows
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Semua stok berhasil diatur menjadi 100'),
          backgroundColor: Colors.green,
        ),
      );

      _loadProducts();
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal mengatur stok: $e';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage!), backgroundColor: Colors.red),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kelola Stok Barang'),
        backgroundColor: Colors.blue.shade700,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadProducts,
            tooltip: 'Refresh',
          ),
          IconButton(
            icon: const Icon(Icons.inventory),
            onPressed: _setAllStockTo100,
            tooltip: 'Atur Semua Stok ke 100',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.blue.shade50,
            child: Row(
              children: [
                Icon(Icons.inventory_2, color: Colors.blue.shade700, size: 32),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Manajemen Stok',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue.shade700,
                      ),
                    ),
                    Text(
                      'Kelola stok barang yang tersedia',
                      style: TextStyle(color: Colors.blue.shade600),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (_isLoading)
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.blue.shade100,
              child: Row(
                children: [
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  const SizedBox(width: 12),
                  const Text('Memuat data produk...'),
                ],
              ),
            ),
          if (_errorMessage != null)
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.red.shade100,
              child: Row(
                children: [
                  const Icon(Icons.error, color: Colors.red),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.red),
                    onPressed: () => setState(() => _errorMessage = null),
                  ),
                ],
              ),
            ),
          Expanded(
            child: FutureBuilder<List<ProductModel>>(
              future: _futureProducts,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('Memuat produk...'),
                      ],
                    ),
                  );
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red.shade300,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Gagal memuat produk',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${snapshot.error}',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _loadProducts,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  );
                }

                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.inventory_2,
                          size: 64,
                          color: Colors.grey,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Tidak ada produk tersedia',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tekan tombol refresh untuk memuat ulang',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _loadProducts,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Refresh'),
                        ),
                      ],
                    ),
                  );
                }

                final products = snapshot.data!;
                return ListView.builder(
                  padding: const EdgeInsets.all(8),
                  itemCount: products.length,
                  itemBuilder: (context, index) {
                    final product = products[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                        vertical: 6,
                        horizontal: 4,
                      ),
                      elevation: 2,
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.network(
                                    product.image,
                                    width: 60,
                                    height: 60,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        width: 60,
                                        height: 60,
                                        color: Colors.grey.shade300,
                                        child: const Icon(
                                          Icons.image_not_supported,
                                        ),
                                      );
                                    },
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        product.title,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Rp ${product.price.toStringAsFixed(0)}',
                                        style: TextStyle(
                                          color: Colors.green.shade700,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          _getStockIcon(product.stock),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Stok: ${product.stock}',
                                            style: TextStyle(
                                              color: _getStockColor(
                                                product.stock,
                                              ),
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                Expanded(
                                  child: OutlinedButton.icon(
                                    onPressed: () => _tambahStok(product),
                                    icon: const Icon(
                                      Icons.add,
                                      color: Colors.green,
                                    ),
                                    label: const Text(
                                      'Tambah',
                                      style: TextStyle(color: Colors.green),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(
                                        color: Colors.green,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: OutlinedButton.icon(
                                    onPressed: () => _kurangiStok(product),
                                    icon: const Icon(
                                      Icons.remove,
                                      color: Colors.orange,
                                    ),
                                    label: const Text(
                                      'Kurangi',
                                      style: TextStyle(color: Colors.orange),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(
                                        color: Colors.orange,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () => _aturStok(product),
                                    icon: const Icon(
                                      Icons.edit,
                                      color: Colors.white,
                                    ),
                                    label: const Text(
                                      'Atur',
                                      style: TextStyle(color: Colors.white),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.blue,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
