import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order.dart';
import '../models/service_request.dart';
import '../services/tts_service.dart';

class OrderNotifier extends StateNotifier<List<RestaurantOrder>> {
  OrderNotifier() : super(_initialOrders);

  static final List<RestaurantOrder> _initialOrders = [
    RestaurantOrder(
      id: 'ord-1001',
      orderNumber: 'ORD-1001',
      tableNumber: 'T-05',
      customerName: 'Rahul Sharma',
      customerPhone: '+91 99887 76655',
      status: 'preparing',
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      specialInstructions: 'Less spicy, extra cheese on the pizza.',
      subtotal: 687,
      grandTotal: 668,
      createdAt: DateTime.now().subtract(const Duration(minutes: 8)),
      items: [
        OrderItem(name: 'Paneer Pizza', variantName: 'Medium (9")', quantity: 2, unitPrice: 249, totalPrice: 498),
        OrderItem(name: 'Cold Coffee', variantName: 'Standard', quantity: 1, unitPrice: 89, totalPrice: 89),
        OrderItem(name: 'French Fries', variantName: 'Peri-Peri', quantity: 1, unitPrice: 100, totalPrice: 100),
      ],
    ),
    RestaurantOrder(
      id: 'ord-1002',
      orderNumber: 'ORD-1002',
      tableNumber: 'T-02',
      customerName: 'Priya Patel',
      customerPhone: '+91 98112 33445',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'counter',
      specialInstructions: 'Quick service requested.',
      subtotal: 249,
      grandTotal: 261,
      createdAt: DateTime.now().subtract(const Duration(minutes: 2)),
      items: [
        OrderItem(name: 'Veg Burger', variantName: 'Single Patty', quantity: 1, unitPrice: 149, totalPrice: 149),
        OrderItem(name: 'French Fries', variantName: 'Classic Salted', quantity: 1, unitPrice: 100, totalPrice: 100),
      ],
    ),
    RestaurantOrder(
      id: 'ord-0998',
      orderNumber: 'ORD-0998',
      tableNumber: 'T-07',
      customerName: 'Amit Verma',
      status: 'preparing',
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      subtotal: 428,
      grandTotal: 449,
      createdAt: DateTime.now().subtract(const Duration(minutes: 12)),
      items: [
        OrderItem(name: 'Pasta Alfredo', quantity: 1, unitPrice: 229, totalPrice: 229),
        OrderItem(name: 'Margherita Pizza', quantity: 1, unitPrice: 199, totalPrice: 199),
      ],
    ),
    RestaurantOrder(
      id: 'ord-0997',
      orderNumber: 'ORD-0997',
      tableNumber: 'T-04',
      customerName: 'Suresh Iyer',
      status: 'ready',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      subtotal: 299,
      grandTotal: 314,
      createdAt: DateTime.now().subtract(const Duration(minutes: 18)),
      items: [
        OrderItem(name: 'Special Royal Thali', quantity: 1, unitPrice: 299, totalPrice: 299),
      ],
    ),
  ];

  void updateStatus(String orderId, String newStatus) {
    state = [
      for (final o in state)
        if (o.id == orderId) o.copyWith(status: newStatus) else o
    ];
  }

  void addOrder(RestaurantOrder newOrder) {
    state = [newOrder, ...state];
    MobileTtsService().speakOrder(newOrder);
  }
}

final ordersProvider = StateNotifierProvider<OrderNotifier, List<RestaurantOrder>>((ref) {
  return OrderNotifier();
});

class ServiceRequestNotifier extends StateNotifier<List<TableServiceRequest>> {
  ServiceRequestNotifier() : super(_initialRequests);

  static final List<TableServiceRequest> _initialRequests = [
    TableServiceRequest(
      id: 'sr-101',
      tableNumber: 'T-05',
      requestType: 'water',
      title: 'Drinking Water Refill',
      notes: 'Please bring cold water bottle',
      status: 'pending',
      createdAt: DateTime.now().subtract(const Duration(minutes: 3)),
    ),
    TableServiceRequest(
      id: 'sr-102',
      tableNumber: 'T-02',
      requestType: 'call_waiter',
      title: 'Call Waiter Assistance',
      notes: 'Need recommendation for dessert',
      status: 'in_progress',
      createdAt: DateTime.now().subtract(const Duration(minutes: 7)),
    ),
    TableServiceRequest(
      id: 'sr-103',
      tableNumber: 'T-07',
      requestType: 'bill',
      title: 'Request Bill at Table',
      notes: 'Splitting payment with card & UPI',
      status: 'completed',
      createdAt: DateTime.now().subtract(const Duration(minutes: 20)),
    ),
  ];

  void updateRequestStatus(String id, String newStatus) {
    state = [
      for (final r in state)
        if (r.id == id) r.copyWith(status: newStatus) else r
    ];
  }

  void addRequest(TableServiceRequest request) {
    state = [request, ...state];
  }
}

final serviceRequestsProvider = StateNotifierProvider<ServiceRequestNotifier, List<TableServiceRequest>>((ref) {
  return ServiceRequestNotifier();
});

