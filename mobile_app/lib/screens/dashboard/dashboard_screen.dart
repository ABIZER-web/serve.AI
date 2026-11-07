import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/order_provider.dart';
import '../../services/tts_service.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    final newCount = orders.where((o) => o.status == 'pending').length;
    final prepCount = orders.where((o) => o.status == 'preparing').length;
    final readyCount = orders.where((o) => o.status == 'ready').length;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.restaurant, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 8),
            const Text(
              'Food House',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {
              MobileTtsService().testSpeech();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Playing AI Voice Order Announcement...')),
              );
            },
            icon: const Icon(Icons.volume_up_rounded, color: AppTheme.primaryColor),
            tooltip: 'Test AI Voice Announcement',
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none_rounded),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting Header Matching UI Reference
            Text(
              'Hello Chef! 👨‍🍳',
              style: GoogleFonts.newsreader(fontSize: 26, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 2),
            const Text(
              "Here's your restaurant status",
              style: TextStyle(fontSize: 13, color: Colors.grey, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),

            // 3 Order Status Cards Matching UI Reference
            Row(
              children: [
                Expanded(
                  child: _buildMetricBadge(
                    title: 'New Orders',
                    count: newCount,
                    color: AppTheme.dangerColor,
                    bgColor: const Color(0xFFFEE2E2),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricBadge(
                    title: 'Preparing',
                    count: prepCount,
                    color: AppTheme.primaryColor,
                    bgColor: const Color(0xFFFFEDD5),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricBadge(
                    title: 'Ready',
                    count: readyCount,
                    color: AppTheme.successColor,
                    bgColor: const Color(0xFFDCFCE7),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Today's Sales Card Matching UI Reference
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Today's Sales",
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.trending_up, color: AppTheme.successColor, size: 14),
                              SizedBox(width: 3),
                              Text(
                                '+20%',
                                style: TextStyle(
                                  color: AppTheme.successColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      currencyFormat.format(18750),
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.secondaryColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Smart Table Waiter Service Requests Section
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Row(
                  children: [
                    const Icon(Icons.notifications_active_rounded, size: 20, color: AppTheme.primaryColor),
                    const SizedBox(width: 6),
                    Text(
                      'Table Waiter Calls',
                      style: GoogleFonts.newsreader(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Text(
                  '${ref.watch(serviceRequestsProvider).where((r) => r.status != 'completed').length} Active',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Waiter Calls Cards
            ...ref.watch(serviceRequestsProvider).map((req) {
              final isPending = req.status == 'pending';
              final isInProgress = req.status == 'in_progress' || req.status == 'accepted';

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isPending
                      ? const Color(0xFFFFFBEB)
                      : isInProgress
                          ? const Color(0xFFEFF6FF)
                          : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isPending
                        ? const Color(0xFFFCD34D)
                        : isInProgress
                            ? const Color(0xFF93C5FD)
                            : Colors.grey.shade200,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isPending ? Colors.amber : (isInProgress ? Colors.blue : Colors.green),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        req.requestType == 'water'
                            ? Icons.water_drop
                            : req.requestType == 'bill'
                                ? Icons.receipt
                                : Icons.room_service,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Table ${req.tableNumber}',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: isPending
                                      ? Colors.amber.shade100
                                      : isInProgress
                                          ? Colors.blue.shade100
                                          : Colors.green.shade100,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  req.status.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold,
                                    color: isPending
                                        ? Colors.amber.shade900
                                        : isInProgress
                                            ? Colors.blue.shade900
                                            : Colors.green.shade900,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            req.title,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                          if (req.notes != null)
                            Text(
                              '"${req.notes}"',
                              style: const TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic),
                            ),
                        ],
                      ),
                    ),
                    if (isPending)
                      ElevatedButton(
                        onPressed: () {
                          ref.read(serviceRequestsProvider.notifier).updateRequestStatus(req.id, 'in_progress');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Attend', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      )
                    else if (isInProgress)
                      ElevatedButton(
                        onPressed: () {
                          ref.read(serviceRequestsProvider.notifier).updateRequestStatus(req.id, 'completed');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Done', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      )
                    else
                      const Icon(Icons.check_circle, color: Colors.green, size: 20),
                  ],
                ),
              );
            }),

            const SizedBox(height: 20),

            // Recent Orders Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Live Orders',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                ),
                TextButton(
                  onPressed: () => context.go('/orders'),
                  child: const Text('View All', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Order Cards List
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final order = orders[index];
                return InkWell(
                  onTap: () => context.push('/order/${order.id}'),
                  borderRadius: BorderRadius.circular(16),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFEDD5),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.receipt_long, color: AppTheme.primaryColor),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Order #${order.orderNumber}',
                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                                  ),
                                  Text(
                                    'Table ${order.tableNumber} • ${order.items.length} items',
                                    style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                currencyFormat.format(order.grandTotal),
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                              ),
                              const SizedBox(height: 2),
                              _buildStatusTag(order.status),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricBadge({
    required String title,
    required int count,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text(
            title,
            style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            '$count',
            style: TextStyle(color: color, fontSize: 24, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTag(String status) {
    Color bg = Colors.grey.shade200;
    Color fg = Colors.grey.shade800;

    if (status == 'pending') {
      bg = const Color(0xFFFEE2E2);
      fg = AppTheme.dangerColor;
    } else if (status == 'preparing') {
      bg = const Color(0xFFFFEDD5);
      fg = AppTheme.primaryColor;
    } else if (status == 'ready') {
      bg = const Color(0xFFDCFCE7);
      fg = AppTheme.successColor;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: fg, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }
}
