class ProductModel {
  final int id;
  final String title;
  final String description;
  final double price;
  final String category;
  final String image;

  ProductModel({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.category,
    required this.image,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      category: json['category'],
      image: json['id'] == 1
          ? 'https://content.wolfswinkel.nl/1556616841/dossier-art/FJALLRAVEN_24225/F24225-030_%20FJALLRAVEN%20FOLDSACK%20No.3%20DARK%20GREY.jpg?size=product-detail&format=jpg'
          : json['image'],
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
    };
  }
}
