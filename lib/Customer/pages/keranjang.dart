import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:openmart/Customer/shares/cart_item_widget.dart';
import 'package:openmart/presentation/controllers/cart_provider.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';
import 'package:openmart/presentation/controllers/wallet_provider.dart';
import 'wallet_page.dart';

class KeranjangPage extends StatefulWidget {
  const KeranjangPage({super.key});

  @override
  State<KeranjangPage> createState() => _KeranjangPageState();
}

class _KeranjangPageState extends State<KeranjangPage> {
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
    if (token != null) {
      try {
        await walletProvider.initializeWallet(token);
      } catch (e) {
        // Silently fail - wallet will be reinitialized on checkout page
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();
    final authProvider = context.watch<AuthProvider>();
    final walletProvider = context.watch<WalletProvider>();
    final token = authProvider.token;

    return CartPage(
      token: token,
      onBuyPressed: () {
        // Navigate to wallet checkout page
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => WalletCheckoutPage(
              totalAmount: cartProvider.totalPrice,
            ),
          ),
        ).then((success) async {
          // Refresh wallet balance after returning
          if (success == true && token != null) {
            await walletProvider.refreshBalance(token);
          }
        });
      },
    );
  }
}
