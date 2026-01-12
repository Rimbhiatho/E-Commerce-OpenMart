import 'dart:async';
import 'dart:convert';
import 'package:openmart/data/server/constants.dart';
import 'package:openmart/data/server/model/user_model.dart';
import 'package:openmart/data/server/service/auth_api_service.dart';

/// Abstract interface for authentication repository
abstract class AuthRepository {
  Future<AuthResponse> login(String email, String password);
  Future<AuthResponse> register(
    String email,
    String password,
    String name, {
    String role,
  });
  Future<UserModel> getProfile(String token);
  Future<void> logout();
  String? getStoredToken();
  UserModel? getStoredUser();
  bool isAuthenticated();
}

/// Default implementation of AuthRepository
class AuthRepositoryImpl implements AuthRepository {
  final AuthApiService authApiService;

  AuthRepositoryImpl({required this.authApiService});

  @override
  Future<AuthResponse> login(String email, String password) {
    return authApiService.login(email, password);
  }

  @override
  Future<AuthResponse> register(
    String email,
    String password,
    String name, {
    String role = 'customer',
  }) {
    return authApiService.register(email, password, name, role: role);
  }

  @override
  Future<UserModel> getProfile(String token) {
    return authApiService.getProfile(token);
  }

  @override
  Future<void> logout() {
    return authApiService.logout();
  }

  @override
  String? getStoredToken() {
    // Ambil dari static prefs yang sudah di-cache
    return AuthApiService.staticPrefs?.getString(AppConstants.authTokenKey);
  }

  @override
  UserModel? getStoredUser() {
    // Ambil dari static prefs yang sudah di-cache
    final userData = AuthApiService.staticPrefs?.getString(
      AppConstants.userDataKey,
    );
    if (userData != null) {
      try {
        return UserModel.fromJson(jsonDecode(userData));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  @override
  bool isAuthenticated() {
    // Ambil dari static prefs yang sudah di-cache
    return AuthApiService.staticPrefs?.containsKey(AppConstants.authTokenKey) ??
        false;
  }
}
