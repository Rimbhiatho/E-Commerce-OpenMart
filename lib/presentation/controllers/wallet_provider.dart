import 'package:flutter/foundation.dart';
import 'package:openmart/data/server/model/wallet_model.dart';
import 'package:openmart/data/server/service/wallet_api_service.dart';

/// WalletProvider manages wallet state using the Provider pattern
/// It handles balance, transactions, and wallet operations
class WalletProvider with ChangeNotifier {
  final WalletApiService walletApiService;

  double _balance = 0;
  List<WalletTransaction> _transactions = [];
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  // Getters
  double get balance => _balance;
  List<WalletTransaction> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isInitialized => _isInitialized;
  bool get hasEnoughBalance => _balance > 0;

  WalletProvider({WalletApiService? walletApiService})
    : walletApiService = walletApiService ?? WalletApiService.instance;

  /// Initialize wallet data by fetching balance and transactions
  Future<void> initializeWallet(String token) async {
    if (_isLoading) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final walletInfo = await walletApiService.getWalletInfo(token);
      _balance = walletInfo.balance;
      _transactions = walletInfo.transactions;
      _isInitialized = true;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Refresh wallet balance only
  Future<void> refreshBalance(String token) async {
    try {
      _balance = await walletApiService.getBalance(token);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Load all transactions
  Future<void> loadTransactions(String token) async {
    if (_isLoading) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _transactions = await walletApiService.getTransactions(token);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Top up wallet balance
  /// Returns true on success, false on failure
  Future<bool> topUp(String token, double amount, {String? description}) async {
    if (_isLoading) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final request = TopUpRequest(
        amount: amount,
        description: description ?? 'Top up',
      );
      final transaction = await walletApiService.topUp(token, request);

      // Update balance from transaction response
      _balance = transaction.balanceAfter;
      _transactions.insert(0, transaction);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Check if user has sufficient balance for a given amount
  bool hasSufficientBalance(double amount) {
    return _balance >= amount;
  }

  /// Get formatted balance string
  String getFormattedBalance() {
    return 'Rp ${_balance.toStringAsFixed(2)}';
  }

  /// Clear any error state
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Reset wallet state (for logout)
  void reset() {
    _balance = 0;
    _transactions = [];
    _error = null;
    _isInitialized = false;
    notifyListeners();
  }
}
