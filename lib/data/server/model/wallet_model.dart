/// Wallet model classes for wallet data

class WalletModel {
  final double balance;
  final List<WalletTransaction> transactions;

  WalletModel({required this.balance, this.transactions = const []});

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      balance: (json['balance'] ?? 0).toDouble(),
      transactions:
          (json['transactions'] as List<dynamic>?)
              ?.map((e) => WalletTransaction.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'balance': balance,
      'transactions': transactions.map((e) => e.toMap()).toList(),
    };
  }
}

class WalletTransaction {
  final String id;
  final String userId;
  final String type;
  final double amount;
  final double balanceBefore;
  final double balanceAfter;
  final String description;
  final DateTime createdAt;

  WalletTransaction({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.balanceBefore,
    required this.balanceAfter,
    required this.description,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) {
    return WalletTransaction(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      type: json['type'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      balanceBefore: (json['balanceBefore'] ?? 0).toDouble(),
      balanceAfter: (json['balanceAfter'] ?? 0).toDouble(),
      description: json['description'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'type': type,
      'amount': amount,
      'balanceBefore': balanceBefore,
      'balanceAfter': balanceAfter,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class TopUpRequest {
  final double amount;
  final String? description;

  TopUpRequest({required this.amount, this.description});

  Map<String, dynamic> toJson() {
    return {'amount': amount, 'description': description};
  }
}

class WalletBalanceResponse {
  final double balance;

  WalletBalanceResponse({required this.balance});

  factory WalletBalanceResponse.fromJson(Map<String, dynamic> json) {
    return WalletBalanceResponse(balance: (json['balance'] ?? 0).toDouble());
  }
}
