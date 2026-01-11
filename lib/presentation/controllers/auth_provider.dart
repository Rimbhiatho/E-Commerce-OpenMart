import 'package:flutter/foundation.dart';
import 'package:openmart/data/server/model/user_model.dart';
import 'package:openmart/data/server/repository/auth_repository.dart';

/// AuthProvider manages authentication state using the Provider pattern
/// It handles login, logout, and user session persistence
class AuthProvider with ChangeNotifier {
  final AuthRepository authRepository;

  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;

  // Getters
  UserModel? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  AuthProvider({required this.authRepository}) {
    _loadStoredSession();
  }

  /// Load stored session data on initialization
  void _loadStoredSession() {
    _token = authRepository.getStoredToken();
    _user = authRepository.getStoredUser();
    
    if (_token != null) {
      notifyListeners();
    }
  }

  /// Attempt to login with email and password
  /// Returns true on success, false on failure
  Future<bool> login(String email, String password) async {
    if (_isLoading) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await authRepository.login(email, password);
      _user = response.user;
      _token = response.token;
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

  /// Register a new user
  /// Returns true on success, false on failure
  Future<bool> register(
    String email,
    String password,
    String name, {
    String role = 'customer',
  }) async {
    if (_isLoading) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await authRepository.register(
        email,
        password,
        name,
        role: role,
      );
      _user = response.user;
      _token = response.token;
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

  /// Logout the current user
  /// Clears all session data
  Future<void> logout() async {
    await authRepository.logout();
    _user = null;
    _token = null;
    _error = null;
    notifyListeners();
  }

  /// Clear any error state
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Refresh user profile from server
  Future<bool> refreshProfile() async {
    if (_token == null) return false;

    try {
      final profile = await authRepository.getProfile(_token!);
      _user = profile;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}

