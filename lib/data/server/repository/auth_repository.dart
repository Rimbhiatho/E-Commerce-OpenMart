import 'dart:async';
import 'package:openmart/data/server/model/user_model.dart';
import 'package:openmart/data/server/service/auth_api_service.dart';

/// Abstract interface for authentication repository
abstract class AuthRepository {
  Future<AuthResponse> login(String email, String password);
  Future<AuthResponse> register(String email, String password, String name, {String role});
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
  Future<AuthResponse> register(String email, String password, String name, 
      {String role = 'customer'}) {
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
    return authApiService.getStoredToken();
  }

  @override
  UserModel? getStoredUser() {
    return authApiService.getStoredUser();
  }

  @override
  bool isAuthenticated() {
    return authApiService.isAuthenticated();
  }
}



