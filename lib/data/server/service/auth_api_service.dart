import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:openmart/data/server/constants.dart';
import 'package:openmart/data/server/model/user_model.dart';

/// AuthApiService handles all authentication-related API calls
/// and manages token storage using SharedPreferences
class AuthApiService {
  final String baseUrl = AppConstants.baseUrl;
  final SharedPreferences _prefs;

  AuthApiService({SharedPreferences? prefs}) : _prefs = prefs ?? _staticPrefs;

  static late final SharedPreferences _staticPrefs;

  // Initialize SharedPreferences once
  static Future<SharedPreferences> init() async {
    _staticPrefs = await SharedPreferences.getInstance();
    return _staticPrefs;
  }

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
      final authResponse = AuthResponse.fromJson(json['data']);
      // Store token and user data
      await _saveAuthData(authResponse);
      return authResponse;
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
      final authResponse = AuthResponse.fromJson(json['data']);
      // Store token and user data
      await _saveAuthData(authResponse);
      return authResponse;
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

  /// Logout - clears all stored authentication data
  Future<void> logout() async {
    await _prefs.remove(AppConstants.authTokenKey);
    await _prefs.remove(AppConstants.userDataKey);
  }

  /// Save authentication data to SharedPreferences
  Future<void> _saveAuthData(AuthResponse authResponse) async {
    await _prefs.setString(AppConstants.authTokenKey, authResponse.token);
    await _prefs.setString(
      AppConstants.userDataKey, 
      jsonEncode(authResponse.user.toMap())
    );
  }

  /// Get stored authentication token
  String? getStoredToken() {
    return _prefs.getString(AppConstants.authTokenKey);
  }

  /// Get stored user data
  UserModel? getStoredUser() {
    final userData = _prefs.getString(AppConstants.userDataKey);
    if (userData != null) {
      try {
        return UserModel.fromJson(jsonDecode(userData));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /// Check if user is authenticated
  bool isAuthenticated() {
    return _prefs.containsKey(AppConstants.authTokenKey);
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

