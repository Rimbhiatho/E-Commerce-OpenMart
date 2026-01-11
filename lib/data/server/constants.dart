class AppConstants {
  // For Android Emulator, use 10.0.2.2 instead of localhost
  // For iOS Simulator, use localhost
  // For real device, use your machine's IP address
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  static const String authTokenKey = 'auth_token';
  static const String userDataKey = 'user_data';

  // API Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String profileEndpoint = '/auth/profile';
  static const String productsEndpoint = '/products';
  static const String categoriesEndpoint = '/categories';
  static const String ordersEndpoint = '/orders';
}

