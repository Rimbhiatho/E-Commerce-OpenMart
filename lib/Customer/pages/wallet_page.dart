import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:openmart/presentation/controllers/wallet_provider.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';
import 'package:openmart/presentation/controllers/cart_provider.dart';

/// WalletCheckoutPage - Halaman pembayaran dengan wallet
/// Muncul setelah user klik tombol "Beli" di keranjang
class WalletCheckoutPage extends StatefulWidget {
  final double totalAmount;

  const WalletCheckoutPage({
    super.key,
    required this.totalAmount,
  });

  @override
  State<WalletCheckoutPage> createState() => _WalletCheckoutPageState();
}

class _WalletCheckoutPageState extends State<WalletCheckoutPage> {
  bool _isProcessing = false;
  String? _errorMessage;
  bool _walletInitialized = false;

  @override
  void initState() {
    super.initState();
    // Use addPostFrameCallback to safely call context.read() after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeWallet();
    });
  }

  Future<void> _initializeWallet() async {
    final authProvider = context.read<AuthProvider>();
    final walletProvider = context.read<WalletProvider>();

    final token = authProvider.token;
    if (token == null) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Session tidak valid. Silakan login kembali.';
        });
      }
      return;
    }

    try {
      await walletProvider.initializeWallet(token);
      if (mounted) {
        setState(() {
          _walletInitialized = true;
          _errorMessage = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Gagal memuat data wallet: $e';
          _walletInitialized = false;
        });
      }
    }
  }

  Future<void> _processPayment() async {
    final authProvider = context.read<AuthProvider>();
    final walletProvider = context.read<WalletProvider>();
    final cartProvider = context.read<CartProvider>();

    final token = authProvider.token;
    if (token == null) {
      setState(() {
        _errorMessage = 'Session tidak valid. Silakan login kembali.';
      });
      return;
    }

    // Validasi saldo
    if (!walletProvider.hasSufficientBalance(widget.totalAmount)) {
      setState(() {
        _errorMessage = 'Saldo tidak mencukupi!\n'
            'Diperlukan: Rp ${widget.totalAmount.toStringAsFixed(2)}\n'
            'Saldo tersedia: ${walletProvider.getFormattedBalance()}';
      });
      return;
    }

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      // Proses pembayaran dengan top-up negatif (ini akan gagal jika tidak ada endpoint)
      //Karena backend tidak memiliki endpoint untuk pembayaran langsung,
      //kita perlu menggunakan metode top-up untuk simulate pembayaran
      //Dalam implementasi sebenarnya, endpoint pembayaran akan tersedia di backend

      // Untuk saat ini, kita akan top-up sejumlah yang sama untuk simulate
      // karena backend sudah deduct di OrderUseCase saat createOrder

      // Langsung create order - wallet akan di deduct di backend
      final orderResponse = await _createOrder(token, cartProvider);

      if (orderResponse != null && orderResponse['success'] == true) {
        // Payment successful
        await cartProvider.clearCart(token: token);
        await walletProvider.refreshBalance(token);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Pembayaran berhasil! Saldo wallet telah dikurangi.'),
              backgroundColor: Colors.green,
            ),
          );

          // Navigate back to cart with success flag
          Navigator.of(context).pop(true);
        }
      } else {
        setState(() {
          _errorMessage = orderResponse?['message'] ?? 'Pembayaran gagal. Silakan coba lagi.';
          _isProcessing = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Terjadi kesalahan: $e';
        _isProcessing = false;
      });
    }
  }

  Future<Map<String, dynamic>?> _createOrder(
    String token,
    CartProvider cartProvider,
  ) async {
    final response = await http.post(
      Uri.parse('http://10.0.2.2:3000/api/orders'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'items': cartProvider.items.map((item) {
          return {
            'productId': item.product.id.toString(),
            'quantity': item.quantity,
          };
        }).toList(),
        'shippingAddress': 'Default Address', // Should come from user input
        'paymentMethod': 'wallet',
        'notes': 'Pembayaran via Wallet',
      }),
    );

    return json.decode(response.body) as Map<String, dynamic>;
  }

  @override
  Widget build(BuildContext context) {
    final walletProvider = context.watch<WalletProvider>();
    final cartProvider = context.watch<CartProvider>();

    final balance = walletProvider.balance;
    final canPay = balance >= widget.totalAmount;
    final remainingBalance = balance - widget.totalAmount;

    // Show loading overlay while wallet is initializing
    if (!_walletInitialized && _errorMessage == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                color: Colors.green,
              ),
              const SizedBox(height: 16),
              Text(
                'Memuat data wallet...',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[700],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pembayaran Wallet'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ringkasan Pembayaran
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Ringkasan Pembayaran',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Divider(),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Belanja:'),
                        Text(
                          'Rp ${widget.totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Metode Pembayaran:'),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'Wallet',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Info Wallet
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.account_balance_wallet,
                            color: Colors.green,
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            'Saldo Wallet Anda',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      walletProvider.isLoading
                          ? 'Memuat...'
                          : walletProvider.getFormattedBalance(),
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (!walletProvider.isLoading)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            canPay ? 'Saldo cukup untuk pembayaran' : 'Saldo tidak mencukupi',
                            style: TextStyle(
                              color: canPay ? Colors.green : Colors.red,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Detail Transaksi
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Detail Transaksi',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Divider(),
                    const SizedBox(height: 8),
                    ...cartProvider.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.product.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  '${item.quantity} x Rp ${item.product.price.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            'Rp ${item.total.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    )),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Rp ${widget.totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Sisa Saldo Setelah Pembayaran
            if (!walletProvider.isLoading)
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                color: canPay ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Sisa Saldo Setelah Bayar:',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        'Rp ${remainingBalance.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: canPay ? Colors.green : Colors.red,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 16),

            // Error Message
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red),
                ),
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
                  ],
                ),
              ),

            const SizedBox(height: 16),

            // Tombol Bayar
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: canPay ? Colors.green : Colors.grey,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: (walletProvider.isLoading || _isProcessing || !canPay)
                    ? null
                    : _processPayment,
                child: _isProcessing
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation(Colors.white),
                            ),
                          ),
                          SizedBox(width: 12),
                          Text('Memproses...'),
                        ],
                      )
                    : const Text(
                        'Bayar Sekarang',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 12),

            // Tombol Kembali
            SizedBox(
              width: double.infinity,
              height: 56,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: _isProcessing
                    ? null
                    : () => Navigator.of(context).pop(false),
                child: const Text(
                  'Kembali ke Keranjang',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

