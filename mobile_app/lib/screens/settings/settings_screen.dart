import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/tts_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool voiceAnnouncements = true;
  String selectedLanguage = 'en-IN';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Staff & App Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Voice Announcements Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'AI Voice Order Announcements',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Speak Incoming Orders',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    subtitle: const Text(
                      'Speaks Table Number, Items, and Amount via TTS',
                      style: TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                    value: voiceAnnouncements,
                    activeTrackColor: AppTheme.primaryColor,
                    onChanged: (val) {
                      setState(() => voiceAnnouncements = val);
                    },
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFEDD5),
                      foregroundColor: AppTheme.primaryColor,
                    ),
                    onPressed: () {
                      MobileTtsService().testSpeech();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Testing AI Voice Announcement speech...')),
                      );
                    },
                    icon: const Icon(Icons.volume_up, size: 18),
                    label: const Text('Test Voice Announcement'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Restaurant Info
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Connected Restaurant',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                  ),
                  Divider(height: 20),
                  Text('Restaurant: Food House (Indiranagar)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  SizedBox(height: 4),
                  Text('GSTIN: 29AABCU9603R1ZM', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  SizedBox(height: 4),
                  Text('Staff Role: Chef Vikram (Kitchen & Floor)', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
