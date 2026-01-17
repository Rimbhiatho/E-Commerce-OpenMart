import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:openmart/data/server/model/wallet_model.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';
import 'package:openmart/data/server/constants.dart';

class TransactionDetailPage extends StatefulWidget {
  final WalletTransaction transaction;
  final List<Map<String, dynamic>>?
  items; // optional list of items {name, qty, price}

  const TransactionDetailPage({
    super.key,
    required this.transaction,
    this.items,
  });

  @override
  State<TransactionDetailPage> createState() => _TransactionDetailPageState();
}

class _TransactionDetailPageState extends State<TransactionDetailPage> {
  List<Map<String, dynamic>>? _items;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _items = widget.items;
    if (_items == null) {
      _fetchOrderItemsIfPossible();
    }
  }

  Future<void> _fetchOrderItemsIfPossible() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final auth = context.read<AuthProvider>();
    final token = auth.token;
    if (token == null) {
      setState(() {
        _error = 'Session tidak valid';
        _isLoading = false;
      });
      return;
    }

    try {
      final uri = Uri.parse(
        '${AppConstants.baseUrl}${AppConstants.ordersEndpoint}/${widget.transaction.id}',
      );
      final resp = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body);
        // Try several possible shapes
        dynamic order = data;
        if (data is Map && data['order'] != null) order = data['order'];
        if (order is Map && order['items'] is List) {
          final rawItems = List.from(order['items']);
          final parsed = rawItems.map<Map<String, dynamic>>((it) {
            if (it == null) return {};
            if (it is Map) {
              // If backend nests product object
              if (it['product'] is Map) {
                final p = it['product'];
                return {
                  'name':
                      p['name'] ??
                      p['title'] ??
                      p['productName'] ??
                      (p['id']?.toString() ?? 'Item'),
                  'quantity': it['quantity'] ?? it['qty'] ?? 1,
                  'price': (p['price'] ?? p['unitPrice'] ?? 0).toDouble(),
                };
              }

              // Flat item with name/price
              return {
                'name':
                    it['name'] ??
                    it['title'] ??
                    it['productName'] ??
                    it['productId']?.toString() ??
                    'Item',
                'quantity': it['quantity'] ?? it['qty'] ?? 1,
                'price': (it['price'] ?? it['unitPrice'] ?? 0).toDouble(),
              };
            }
            return {};
          }).toList();

          setState(() {
            _items = parsed;
            _isLoading = false;
          });
          return;
        }

        setState(() {
          _error = 'Tidak ada detail barang pada order ini.';
          _isLoading = false;
        });
      } else {
        if (resp.statusCode == 404) {
          // Try fallback: fetch user's orders and find order with wallet tx id in notes
          await _findOrderFromMyOrders(token, widget.transaction.id);
          return;
        }

        setState(() {
          _error = 'Gagal memuat detail order (${resp.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Terjadi kesalahan: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _findOrderFromMyOrders(String token, String walletTxId) async {
    try {
      final uri = Uri.parse(
        '${AppConstants.baseUrl}${AppConstants.ordersEndpoint}/my-orders',
      );
      final resp = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body);
        dynamic list = data;
        if (data is Map && data['data'] != null) list = data['data'];
        if (list is List) {
          for (final o in list) {
            final notes = (o is Map) ? (o['notes'] ?? '') : '';
            if (notes != null && notes.toString().contains(walletTxId)) {
              // Found matching order
              dynamic order = o;
              if (o is Map && o['data'] != null) order = o['data'];
              if (order is Map && order['items'] is List) {
                final rawItems = List.from(order['items']);
                final parsed = rawItems.map<Map<String, dynamic>>((it) {
                  if (it == null) return {};
                  if (it is Map) {
                    return {
                      'name':
                          it['productName'] ??
                          it['name'] ??
                          it['title'] ??
                          'Item',
                      'quantity': it['quantity'] ?? it['qty'] ?? 1,
                      'price': (it['unitPrice'] ?? it['price'] ?? 0).toDouble(),
                    };
                  }
                  return {};
                }).toList();

                setState(() {
                  _items = parsed;
                  _isLoading = false;
                });
                return;
              }
            }
          }
        }

        setState(() {
          _error =
              'Tidak menemukan order yang berhubungan dengan transaksi wallet ini.';
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Gagal memuat daftar order (${resp.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Terjadi kesalahan saat mencari order: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    final date = widget.transaction.createdAt;
    final formattedDate =
        '${date.day.toString().padLeft(2, '0')} ${months[date.month - 1]} ${date.year}';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Transaksi'),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.transaction.description,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(formattedDate, style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 16),

            const Text(
              'Daftar Barang',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),

            if (_isLoading) ...[
              const Center(child: CircularProgressIndicator()),
            ] else if (_error != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!, style: TextStyle(color: Colors.grey[700])),
              ),
            ] else if (_items == null || _items!.isEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Tidak ada detail barang untuk transaksi ini.',
                  style: TextStyle(color: Colors.grey[700]),
                ),
              ),
            ] else ...[
              Expanded(
                child: ListView.separated(
                  itemCount: _items!.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (context, index) {
                    final it = _items![index];
                    final name = it['name'] ?? 'Item';
                    final qty = it['quantity'] ?? it['qty'] ?? 1;
                    final price = (it['price'] ?? 0).toDouble();
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(name),
                      subtitle: Text('Qty: $qty'),
                      trailing: Text('Rp ${price.toStringAsFixed(2)}'),
                    );
                  },
                ),
              ),
            ],

            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total Pembayaran',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                Text(
                  'Rp ${widget.transaction.amount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
