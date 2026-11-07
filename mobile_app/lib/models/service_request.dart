class TableServiceRequest {
  final String id;
  final String tableNumber;
  final String requestType; // 'call_waiter', 'water', 'plates', 'napkins', 'cutlery', 'assistance', 'bill', 'cleaning'
  final String title;
  final String? notes;
  final String status; // 'pending', 'accepted', 'in_progress', 'completed'
  final DateTime createdAt;

  TableServiceRequest({
    required this.id,
    required this.tableNumber,
    required this.requestType,
    required this.title,
    this.notes,
    required this.status,
    required this.createdAt,
  });

  factory TableServiceRequest.fromJson(Map<String, dynamic> json) {
    return TableServiceRequest(
      id: json['id'] ?? '',
      tableNumber: json['tableNumber'] ?? 'T-05',
      requestType: json['requestType'] ?? 'call_waiter',
      title: json['title'] ?? 'Service Request',
      notes: json['notes'],
      status: json['status'] ?? 'pending',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  TableServiceRequest copyWith({String? status}) {
    return TableServiceRequest(
      id: id,
      tableNumber: tableNumber,
      requestType: requestType,
      title: title,
      notes: notes,
      status: status ?? this.status,
      createdAt: createdAt,
    );
  }
}
