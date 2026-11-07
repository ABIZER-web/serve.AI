import 'package:flutter_tts/flutter_tts.dart';
import '../models/order.dart';

class MobileTtsService {
  static final MobileTtsService _instance = MobileTtsService._internal();
  factory MobileTtsService() => _instance;
  MobileTtsService._internal();

  final FlutterTts _flutterTts = FlutterTts();
  final Set<String> _announcedOrderIds = {};
  bool _isInitialized = false;

  Future<void> init() async {
    if (_isInitialized) return;
    try {
      await _flutterTts.setLanguage("en-IN");
      await _flutterTts.setSpeechRate(0.9);
      await _flutterTts.setVolume(1.0);
      await _flutterTts.setPitch(1.0);
      _isInitialized = true;
    } catch (e) {
      // Graceful fallback
    }
  }

  Future<void> speakOrder(RestaurantOrder order, {bool force = false}) async {
    if (!force && _announcedOrderIds.contains(order.id)) return;
    _announcedOrderIds.add(order.id);

    await init();

    final itemsSummary = order.items
        .map((i) => "${i.quantity} ${i.name}")
        .join(", ");

    final text =
        "Attention staff! New order received for Table ${order.tableNumber}. Order number ${order.orderNumber}. $itemsSummary. Total bill is ${order.grandTotal.toInt()} rupees.";

    try {
      await _flutterTts.speak(text);
    } catch (e) {
      // Ignored if device audio is off
    }
  }

  Future<void> testSpeech() async {
    await init();
    await _flutterTts.speak(
      "Attention staff! A new order has been received for Table Five. Order number one zero zero one. Please accept and prepare the order.",
    );
  }
}

