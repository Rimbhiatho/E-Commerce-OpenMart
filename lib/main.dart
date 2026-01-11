import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'login_page.dart';
import 'dart:async';
import 'package:openmart/data/server/service/auth_api_service.dart';
import 'package:openmart/data/server/repository/auth_repository.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize SharedPreferences
  await AuthApiService.init();
  
  runApp(const OpenMartApp());
}

class OpenMartApp extends StatelessWidget {
  const OpenMartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Provide AuthApiService
        Provider<AuthApiService>(
          create: (_) => AuthApiService(),
        ),
        // Provide AuthRepository
        Provider<AuthRepository>(
          create: (context) => AuthRepositoryImpl(
            authApiService: context.read<AuthApiService>(),
          ),
        ),
        // Provide AuthProvider
        ChangeNotifierProvider<AuthProvider>(
          create: (context) => AuthProvider(
            authRepository: context.read<AuthRepository>(),
          ),
        ),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'OpenMart',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        home: const SplashScreen(),
      ),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 3), () {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginPage()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/Logo and name.png', width: 150, height: 150),
          ],
        ),
      ),
    );
  }
}

