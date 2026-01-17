import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:openmart/Customer/shares/cart_item_widget.dart';
import 'package:openmart/presentation/controllers/cart_provider.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';

class KeranjangPage extends StatelessWidget {
  const KeranjangPage({super.key});

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();
    final authProvider = context.watch<AuthProvider>();
    final token = authProvider.token;

    return CartPage(
      token: token,
    );
  }
}
