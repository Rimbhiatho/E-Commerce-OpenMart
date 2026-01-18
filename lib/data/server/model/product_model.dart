class ProductModel {
  final int id;
  final String title;
  final String description;
  final double price;
  final String category;
  final String image;
  final int stock;

  ProductModel({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.category,
    required this.image,
    this.stock = 0,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    // Safe parsing for id
    final id = json['id'] != null
        ? (json['id'] is String ? int.parse(json['id']) : json['id'] as int)
        : 0;

    // Safe parsing for stock
    final stock = json['stock'] != null
        ? (json['stock'] is String
              ? int.parse(json['stock'].toString())
              : json['stock'] as int)
        : 0;

    // Safe parsing for price
    final price = json['price'] != null
        ? (json['price'] is String
              ? double.parse(json['price'])
              : (json['price'] as num).toDouble())
        : 0.0;

    // Get image URL - try imageUrl first, then image
    final imageUrl = json['imageUrl'] ?? json['image'] ?? '';

    return ProductModel(
      id: id,
      title: json['name'] ?? json['title'] ?? 'Unknown',
      description: json['description'] ?? 'No description',
      price: price,
      category: json['category'] ?? json['categoryId'] ?? 'Uncategorized',
      image: imageUrl,
      stock: stock,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'price': price,
      'category': category,
      'image': image,
      'stock': stock,
    };
  }
}
