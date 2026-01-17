import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:openmart/presentation/controllers/auth_provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'dart:async';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  File? _profileImage;
  final ImagePicker _imagePicker = ImagePicker();
  bool _isLoadingImage = false;

  @override
  void initState() {
    super.initState();
    _loadProfileImage();
  }

  Future<void> _loadProfileImage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final imagePath = prefs.getString('profile_image_path');

      if (imagePath != null && imagePath.isNotEmpty) {
        final file = File(imagePath);
        if (await file.exists()) {
          setState(() {
            _profileImage = file;
          });
        } else {
          // File tidak ada, hapus dari preferences
          await prefs.remove('profile_image_path');
        }
      }
    } catch (e) {
      print('Error loading profile image: $e');
    }
  }

  Future<void> _pickImageFromCamera() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
      );

      if (image != null) {
        setState(() {
          _isLoadingImage = true;
        });

        // Save image to app documents directory
        final appDir = await getApplicationDocumentsDirectory();
        final fileName = 'profile_${DateTime.now().millisecondsSinceEpoch}.jpg';
        final savedImage = await File(
          image.path,
        ).copy('${appDir.path}/$fileName');

        // Save path to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('profile_image_path', savedImage.path);

        setState(() {
          _profileImage = savedImage;
          _isLoadingImage = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Foto profil berhasil disimpan'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isLoadingImage = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _pickImageFromGallery() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
      );

      if (image != null) {
        setState(() {
          _isLoadingImage = true;
        });

        // Save image to app documents directory
        final appDir = await getApplicationDocumentsDirectory();
        final fileName = 'profile_${DateTime.now().millisecondsSinceEpoch}.jpg';
        final savedImage = await File(
          image.path,
        ).copy('${appDir.path}/$fileName');

        // Delete old image if exists
        if (_profileImage != null && await _profileImage!.exists()) {
          try {
            await _profileImage!.delete();
          } catch (e) {
            print('Error deleting old image: $e');
          }
        }

        // Save path to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('profile_image_path', savedImage.path);

        setState(() {
          _profileImage = savedImage;
          _isLoadingImage = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Foto profil berhasil disimpan'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isLoadingImage = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      body: Column(
        children: [
          Expanded(
            flex: 2,
            child: _TopPortion(
              profileImage: _profileImage,
              onChangePhoto: _pickImageFromCamera,
            ),
          ),
          Expanded(
            flex: 3,
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  Text(
                    user?.name ?? 'Guest',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      user?.email ?? '',
                      style: const TextStyle(color: Colors.black54),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      FloatingActionButton.extended(
                        onPressed: _isLoadingImage
                            ? null
                            : _pickImageFromCamera,
                        heroTag: 'camera',
                        elevation: 0,
                        backgroundColor: _isLoadingImage
                            ? Colors.grey
                            : const Color.fromARGB(255, 123, 118, 118),
                        label: const Text("Kamera"),
                        icon: const Icon(Icons.camera_alt),
                      ),
                      const SizedBox(width: 16),
                      FloatingActionButton.extended(
                        onPressed: _isLoadingImage
                            ? null
                            : _pickImageFromGallery,
                        heroTag: 'gallery',
                        elevation: 0,
                        backgroundColor: _isLoadingImage
                            ? Colors.grey
                            : const Color.fromARGB(255, 123, 118, 118),
                        label: const Text("Galeri"),
                        icon: const Icon(Icons.image),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ProfileInfoItem {
  final String title;
  final int value;
  const ProfileInfoItem(this.title, this.value);
}

class _TopPortion extends StatelessWidget {
  final File? profileImage;
  final VoidCallback onChangePhoto;

  const _TopPortion({this.profileImage, required this.onChangePhoto});

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Container(
          margin: const EdgeInsets.only(
            top: 100,
            left: 20,
            right: 20,
            bottom: 50,
          ),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.topRight,
              colors: [Color(0xff0043ba), Color(0xff006df1)],
            ),
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(50),
              bottomRight: Radius.circular(50),
              topLeft: Radius.circular(50),
              topRight: Radius.circular(50),
            ),
          ),
        ),
        Align(
          alignment: Alignment.bottomCenter,
          child: SizedBox(
            width: 150,
            height: 150,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    image: profileImage != null
                        ? DecorationImage(
                            fit: BoxFit.cover,
                            image: FileImage(profileImage!),
                          )
                        : null,
                    color: Colors.grey[300],
                  ),
                  child: profileImage == null
                      ? const Icon(Icons.person, size: 80, color: Colors.grey)
                      : null,
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: onChangePhoto,
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor: Theme.of(
                        context,
                      ).scaffoldBackgroundColor,
                      child: Container(
                        margin: const EdgeInsets.all(8.0),
                        decoration: const BoxDecoration(
                          color: Color.fromARGB(255, 110, 32, 205),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
