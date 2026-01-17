import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:openmart/data/server/constants.dart';
import 'package:openmart/data/server/model/wallet_model.dart';

/// WalletApiService handles all wallet-related API calls
class WalletApiService {
  static const Duration timeout = Duration(seconds: 15);
  final String baseUrl = AppConstants.baseUrl;

  // Singleton pattern
  static final WalletApiService instance = WalletApiService._();
  factory WalletApiService() => instance;
  WalletApiService._();

  /// Get authorization headers with Bearer token
  Map<String, String> _getAuthHeaders(String token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Helper to parse JSON response
  Map<String, dynamic> _parseResponse(http.Response response) {
    try {
      return json.decode(response.body) as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Invalid response format: ${response.body}');
    }
  }

  /// Get current wallet balance
  /// Requires authentication token
  Future<double> getBalance(String token) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl/wallet/balance'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      final balanceResponse = WalletBalanceResponse.fromJson(json['data']);
      return balanceResponse.balance;
    } else {
      throw Exception(json['message'] ?? 'Failed to get balance');
    }
  }

  /// Get full wallet info (balance + transactions)
  /// Requires authentication token
  Future<WalletModel> getWalletInfo(String token) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl/wallet'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return WalletModel.fromJson(json['data']);
    } else {
      throw Exception(json['message'] ?? 'Failed to get wallet info');
    }
  }

  /// Get transaction history
  /// Requires authentication token
  Future<List<WalletTransaction>> getTransactions(String token) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl/wallet/transactions'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      final List<dynamic> data = json['data'] ?? [];
      return data
          .map((e) => WalletTransaction.fromJson(e as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception(json['message'] ?? 'Failed to get transactions');
    }
  }

  /// Top up wallet balance
  /// Requires authentication token
  Future<WalletTransaction> topUp(
    String token,
    TopUpRequest request,
  ) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/wallet/top-up'),
          headers: _getAuthHeaders(token),
          body: jsonEncode(request.toJson()),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return WalletTransaction.fromJson(json['data']['transaction']);
    } else {
      throw Exception(json['message'] ?? 'Failed to top up wallet');
    }
  }
}

