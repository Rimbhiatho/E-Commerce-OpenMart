import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:openmart/data/server/constants.dart';
import 'package:openmart/data/server/model/user_model.dart';

/// AuthApiService handles all authentication-related API calls
/// and manages token storage using SharedPreferences
class AuthApiService {
  static const Duration timeout = Duration(seconds: 15);

  final String baseUrl = AppConstants.baseUrl;

  // Singleton pattern untuk menghindari race condition
  static final AuthApiService instance = AuthApiService._();
  factory AuthApiService() => instance;
  AuthApiService._();

  static SharedPreferences? staticPrefs;

  // Initialize SharedPreferences dengan cara yang aman
  static Future<SharedPreferences> ensureInitialized() async {
    staticPrefs ??= await SharedPreferences.getInstance();
    return staticPrefs!;
  }

  AuthApiService.withPrefs(SharedPreferences prefs) {
    staticPrefs = prefs;
  }

  Future<SharedPreferences> get prefsInstance async {
    return ensureInitialized();
  }

  /// Login with email and password
  /// Returns AuthResponse with user and token on success
  /// Throws exception on failure
  Future<AuthResponse> login(String email, String password) async {
    final prefs = await prefsInstance;
    final response = await http
        .post(
          Uri.parse('$baseUrl${AppConstants.loginEndpoint}'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'email': email, 'password': password}),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      final authResponse = AuthResponse.fromJson(json['data']);
      await _saveAuthData(authResponse, prefs);
      return authResponse;
    } else {
      throw Exception(json['message'] ?? 'Login failed');
    }
  }

  /// Register a new user
  /// Returns AuthResponse with user and token on success
  Future<AuthResponse> register(
    String email,
    String password,
    String name, {
    String role = 'customer',
  }) async {
    final prefs = await prefsInstance;
    final response = await http
        .post(
          Uri.parse('$baseUrl${AppConstants.registerEndpoint}'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': email,
            'password': password,
            'name': name,
            'role': role,
          }),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 201 && json['success'] == true) {
      final authResponse = AuthResponse.fromJson(json['data']);
      await _saveAuthData(authResponse, prefs);
      return authResponse;
    } else {
      throw Exception(json['message'] ?? 'Registration failed');
    }
  }

  /// Get user profile with authorization token
  Future<UserModel> getProfile(String token) async {
    final response = await http
        .get(
          Uri.parse('$baseUrl${AppConstants.profileEndpoint}'),
          headers: _getAuthHeaders(token),
        )
        .timeout(timeout);

    final Map<String, dynamic> json = _parseResponse(response);

    if (response.statusCode == 200 && json['success'] == true) {
      return UserModel.fromJson(json['data']);
    } else {
      throw Exception(json['message'] ?? 'Failed to get profile');
    }
  }

  /// Logout - clears all stored authentication data
  Future<void> logout() async {
    final prefs = await prefsInstance;
    await prefs.remove(AppConstants.authTokenKey);
    await prefs.remove(AppConstants.userDataKey);
  }

  /// Save authentication data to SharedPreferences
  Future<void> _saveAuthData(
    AuthResponse authResponse,
    SharedPreferences prefs,
  ) async {
    await prefs.setString(AppConstants.authTokenKey, authResponse.token);
    await prefs.setString(
      AppConstants.userDataKey,
      jsonEncode(authResponse.user.toMap()),
    );
  }

  /// Get stored authentication token - sync version using cached staticPrefs
  String? getStoredToken() {
    return staticPrefs?.getString(AppConstants.authTokenKey);
  }

  /// Get stored user data - sync version using cached staticPrefs
  UserModel? getStoredUser() {
    final userData = staticPrefs?.getString(AppConstants.userDataKey);
    if (userData != null) {
      try {
        return UserModel.fromJson(jsonDecode(userData));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /// Check if user is authenticated - sync version using cached staticPrefs
  bool isAuthenticated() {
    return staticPrefs?.containsKey(AppConstants.authTokenKey) ?? false;
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
