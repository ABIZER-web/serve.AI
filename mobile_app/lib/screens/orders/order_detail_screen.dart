import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/order_provider.dart';
import '../../services/tts_service.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    final order = orders.firstWhere(
      (o) => o.id == orderId,
      orElse: () => orders.first,
    );
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Details'),
        actions: [
          IconButton(
            onPressed: () {
              MobileTtsService().speakOrder(order, force: true);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Replaying AI Voice Order Announcement...')),
              );
            },
            icon: const Icon(Icons.volume_up_rounded, color: AppTheme.primaryColor),
            tooltip: 'Replay AI Announcement',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Banner Matching UI Reference
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFEDD5),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  order.status.toUpperCase(),
                  style: const TextStyle(
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Order Number & Table
            Center(
              child: Column(
                children: [
                  Text(
                    'Order #${order.orderNumber}',
                    style: GoogleFonts.newsreader(fontSize: 24, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Table ${order.tableNumber} • 2 min ago',
                    style: const TextStyle(fontSize: 13, color: Colors.grey, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Ordered Items Card Matching UI Reference
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Ordered Items',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const Divider(height: 20),
                    ...order.items.map((item) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Text(
                                  '${item.quantity} x ',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                Text(
                                  item.name,
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                ),
                              ],
                            ),
                            Text(
                              currencyFormat.format(item.totalPrice),
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                            ),
                          ],
                        ),
                      );
                    }),
                    const Divider(height: 24),

                    // Total Row Matching UI Reference
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                        ),
                        Text(
                          currencyFormat.format(order.grandTotal),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.secondaryColor,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            if (order.specialInstructions != null && order.specialInstructions!.isNotEmpty) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline, color: Colors.amber, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Instructions: "${order.specialInstructions}"',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF78350F)),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 30),

            // Bottom Action Bump Button Matching UI Reference
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final nextStatus = order.status == 'pending'
                      ? 'preparing'
                      : order.status == 'preparing'
                          ? 'ready'
                          : 'served';
                  ref.read(ordersProvider.notifier).updateStatus(order.id, nextStatus);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Order #${order.orderNumber} updated to $nextStatus')),
                  );
                },
                child: Text(
                  order.status == 'pending'
                      ? 'Accept & Start Prep'
                      : order.status == 'preparing'
                          ? 'Mark as Ready'
                          : 'Mark as Served',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
