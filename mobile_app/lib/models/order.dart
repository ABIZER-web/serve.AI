class OrderItem {
  final String name;
  final String? variantName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  OrderItem({
    required this.name,
    this.variantName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      name: json['name'] ?? '',
      variantName: json['variantName'],
      quantity: json['quantity'] ?? 1,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class RestaurantOrder {
  final String id;
  final String orderNumber;
  final String tableNumber;
  final String customerName;
  final String? customerPhone;
  final String status; // 'pending', 'accepted', 'preparing', 'ready', 'served', 'completed'
  final String paymentStatus;
  final String paymentMethod;
  final String? specialInstructions;
  final List<OrderItem> items;
  final double subtotal;
  final double grandTotal;
  final DateTime createdAt;

  RestaurantOrder({
    required this.id,
    required this.orderNumber,
    required this.tableNumber,
    required this.customerName,
    this.customerPhone,
    required this.status,
    required this.paymentStatus,
    required this.paymentMethod,
    this.specialInstructions,
    required this.items,
    required this.subtotal,
    required this.grandTotal,
    required this.createdAt,
  });

  RestaurantOrder copyWith({String? status, String? paymentStatus}) {
    return RestaurantOrder(
      id: id,
      orderNumber: orderNumber,
      tableNumber: tableNumber,
      customerName: customerName,
      customerPhone: customerPhone,
      status: status ?? this.status,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentMethod: paymentMethod,
      specialInstructions: specialInstructions,
      items: items,
      subtotal: subtotal,
      grandTotal: grandTotal,
      createdAt: createdAt,
    );
  }
}

