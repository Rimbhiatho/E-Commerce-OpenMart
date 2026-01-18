/// Order model classes for order data

class OrderModel {
  final String id;
  final String userId;
  final String userName;
  final List<OrderItem> items;
  final double totalAmount;
  final String status;
  final String paymentStatus;
  final String createdAt;
  final String updatedAt;
  final String? notes;
  final String? shippingAddress;
  final String? paymentMethod;

  OrderModel({
    required this.id,
    required this.userId,
    required this.userName,
    required this.items,
    required this.totalAmount,
    required this.status,
    required this.paymentStatus,
    required this.createdAt,
    required this.updatedAt,
    this.notes,
    this.shippingAddress,
    this.paymentMethod,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List?) ?? [];
    return OrderModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? json['user']?['name'] ?? json['user']?['email'] ?? 'Unknown User',
      items: itemsList
          .map((item) => OrderItem.fromJson(item))
          .toList(),
      // Support both totalAmount (backend) and totalPrice (fallback)
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'pending',
      paymentStatus: json['paymentStatus'] ?? 'unpaid',
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']).toIso8601String() 
          : '',
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']).toIso8601String() 
          : '',
      notes: json['notes'],
      shippingAddress: json['shippingAddress'],
      paymentMethod: json['paymentMethod'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'items': items.map((e) => e.toMap()).toList(),
      'totalAmount': totalAmount,
      'status': status,
      'paymentStatus': paymentStatus,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'notes': notes,
      'shippingAddress': shippingAddress,
      'paymentMethod': paymentMethod,
    };
  }
}

class OrderItem {
  final String productId;
  final String productName;
  final String imageUrl;
  final double price;
  final int quantity;

  OrderItem({
    required this.productId,
    required this.productName,
    required this.imageUrl,
    required this.price,
    required this.quantity,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    // Handle nested product object
    final product = json['product'] as Map<String, dynamic>?;
    
    return OrderItem(
      productId: json['productId'] ?? product?['id'] ?? '',
      productName: json['productName'] ?? json['name'] ?? json['title'] ?? product?['name'] ?? product?['title'] ?? 'Unknown Product',
      imageUrl: json['imageUrl'] ?? json['image'] ?? product?['imageUrl'] ?? product?['image'] ?? '',
      // Support both unitPrice (backend) and price (fallback)
      price: (json['unitPrice'] as num?)?.toDouble() ?? (json['price'] as num?)?.toDouble() ?? (json['totalPrice'] as num?)?.toDouble() ?? product?['price']?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? json['qty'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'productName': productName,
      'imageUrl': imageUrl,
      'price': price,
      'quantity': quantity,
    };
  }
}

/// Order list response from API
class OrderListResponse {
  final List<OrderModel> orders;
  final int totalCount;
  final int page;
  final int totalPages;

  OrderListResponse({
    required this.orders,
    required this.totalCount,
    required this.page,
    required this.totalPages,
  });

  factory OrderListResponse.fromJson(Map<String, dynamic> json) {
    final ordersList = (json['data'] is List) 
        ? json['data'] 
        : (json['orders'] as List?) ?? (json['data']?['orders'] as List?) ?? [];
        
    return OrderListResponse(
      orders: ordersList
          .map((order) => OrderModel.fromJson(order))
          .toList(),
      totalCount: (json['totalCount'] as num?)?.toInt() ?? (json['data']?['totalCount'] as num?)?.toInt() ?? ordersList.length,
      page: (json['page'] as num?)?.toInt() ?? (json['data']?['page'] as num?)?.toInt() ?? 1,
      totalPages: (json['totalPages'] as num?)?.toInt() ?? (json['data']?['totalPages'] as num?)?.toInt() ?? 1,
    );
  }
}

