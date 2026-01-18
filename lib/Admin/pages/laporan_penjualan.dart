import 'package:flutter/material.dart';

class LaporanPenjualanPage extends StatelessWidget {
  const LaporanPenjualanPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan Penjualan'),
      ),
      body: const Center(
        child: Text(
          'Halaman Laporan Penjualan\n(Daftar Transaksi User)',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}

