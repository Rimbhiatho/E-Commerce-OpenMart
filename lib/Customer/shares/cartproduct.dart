import 'package:flutter/material.dart';

class CartProduct extends StatelessWidget {
  final String imageurl;
  final String productname;
  final double productprice;
  final VoidCallback onpress;
  final int stock;
  final bool isOutOfStock;

  const CartProduct({
    super.key,
    required this.imageurl,
    required this.productname,
    required this.productprice,
    required this.onpress,
    this.stock = 0,
  }) : isOutOfStock = stock <= 0;

  Color _getStockColor(int stock) {
    if (stock == 0) return Colors.red;
    if (stock <= 10) return Colors.orange;
    return Colors.green;
  }

  Icon _getStockIcon(int stock) {
    if (stock == 0) return const Icon(Icons.error, color: Colors.red, size: 14);
    if (stock <= 10) return const Icon(Icons.warning, color: Colors.orange, size: 14);
    return const Icon(Icons.check_circle, color: Colors.green, size: 14);
  }

  @override
  Widget build(BuildContext context) {
    final stockColor = _getStockColor(stock);

    return InkWell(
      onTap: isOutOfStock ? null : onpress,
      child: Container(
        margin: const EdgeInsets.all(8.0),
        decoration: BoxDecoration(
          border: Border.all(
            color: isOutOfStock ? Colors.grey.shade300 : Colors.grey,
          ),
          borderRadius: BorderRadius.circular(12.0),
          color: isOutOfStock ? Colors.grey.shade100 : Colors.white,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(12.0)),
                  child: Image.network(
                    imageurl,
                    height: 140,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 140,
                        width: double.infinity,
                        color: Colors.grey.shade300,
                        child: const Icon(Icons.image_not_supported),
                      );
                    },
                  ),
                ),
                if (isOutOfStock)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Habis',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    productname,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: isOutOfStock ? Colors.grey : Colors.black,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    'Rp ${productprice.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 6.0),
                  Row(
                    children: [
                      _getStockIcon(stock),
                      const SizedBox(width: 4),
                      Text(
                        'Stok: $stock',
                        style: TextStyle(
                          fontSize: 12,
                          color: stockColor,
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
      ),
    );
  }
}
