import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:openmart/data/server/constants.dart';
import 'package:openmart/data/server/model/user_model.dart';

class AuthApiService {
  final String baseUrl = AppConstants.baseUrl;

  /// Login with email and password
  /// Returns AuthResponse with user and token on success
  /// Throws exception on failure
  Future<AuthResponse> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl${AppConstants.loginEndpoint}'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return AuthResponse.fromJson(json['data']);
    } else {
      throw Exception(json['message'] ?? 'Login failed');
    }
  }

  /// Register a new user
  /// Returns AuthResponse with user and token on success
  Future<AuthResponse> register(String email, String password, String name, 
      {String role = 'customer'}) async {
    final response = await http.post(
      Uri.parse('$baseUrl${AppConstants.registerEndpoint}'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'name': name,
        'role': role,
      }),
    );

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 201 && json['success'] == true) {
      return AuthResponse.fromJson(json['data']);
    } else {
      throw Exception(json['message'] ?? 'Registration failed');
    }
  }

  /// Get user profile with authorization token
  Future<UserModel> getProfile(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl${AppConstants.profileEndpoint}'),
      headers: _getAuthHeaders(token),
    );

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return UserModel.fromJson(json['data']);
    } else {
      throw Exception(json['message'] ?? 'Failed to get profile');
    }
  }

  /// Helper to parse JSON response
  Map<String, dynamic> _parseResponse(http.Response response) {
    try {
      return json.decode(response.body) as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Invalid response format: ${response.body}');
    }
  }

  /// Helper to get headers with authorization
  Map<String, String> _getAuthHeaders(String token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }
}

