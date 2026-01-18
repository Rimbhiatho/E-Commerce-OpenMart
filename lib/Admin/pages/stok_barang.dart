import 'package:flutter/material.dart';

class StokBarangPage extends StatelessWidget {
  const StokBarangPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kelola Stok Barang'),
      ),
      body: const Center(
        child: Text(
          'Halaman Pengaturan Stok Barang\n(Tambah, Ubah, Hapus)',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}

