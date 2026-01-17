import 'dart:convert';

/// Cart item model for Flutter frontend
class CartItemModel {
  final String id;
  final String userId;
  final String productId;
  final String title;
  final String imageUrl;
  final double price;
  final int quantity;
  final String createdAt;
  final String updatedAt;

  CartItemModel({
    required this.id,
    required this.userId,
    required this.productId,
    required this.title,
    required this.imageUrl,
    required this.price,
    required this.quantity,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      productId: json['productId'] ?? '',
      title: json['title'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt'] ?? '',
      updatedAt: json['updatedAt'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'productId': productId,
      'title': title,
      'imageUrl': imageUrl,
      'price': price,
      'quantity': quantity,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  /// Convert to local CartItem format for CartProvider
  Map<String, dynamic> toLocalMap() {
    return {
      'id': int.tryParse(productId) ?? 0,
      'title': title,
      'description': '',
      'price': price,
      'category': '',
      'image': imageUrl,
    };
  }
}

/// Cart response from API
class CartResponse {
  final List<CartItemModel> items;
  final int itemCount;
  final double totalPrice;

  CartResponse({
    required this.items,
    required this.itemCount,
    required this.totalPrice,
  });

  factory CartResponse.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List?) ?? [];
    return CartResponse(
      items: itemsList
          .map((item) => CartItemModel.fromJson(item))
          .toList(),
      itemCount: (json['itemCount'] as num?)?.toInt() ?? 0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

/// Add to cart request body
class AddToCartRequest {
  final String productId;
  final String title;
  final String imageUrl;
  final double price;
  final int quantity;

  AddToCartRequest({
    required this.productId,
    required this.title,
    required this.imageUrl,
    required this.price,
    this.quantity = 1,
  });

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'title': title,
      'imageUrl': imageUrl,
      'price': price,
      'quantity': quantity,
    };
  }
}

/// Update quantity request body
class UpdateQuantityRequest {
  final int quantity;

  UpdateQuantityRequest({required this.quantity});

  Map<String, dynamic> toJson() {
    return {
      'quantity': quantity,
    };
  }
}

