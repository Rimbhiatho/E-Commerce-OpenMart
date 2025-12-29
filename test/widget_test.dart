import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:openmart/main.dart';

void main() {
  testWidgets('OpenMart app smoke test', (WidgetTester tester) async {
    // Build OpenMart app
    await tester.pumpWidget(const OpenMartApp());

    // Verify app title is shown
    expect(find.text('OpenMart'), findsOneWidget);

    // Verify welcome text is shown
    expect(find.text('Welcome to OpenMart'), findsOneWidget);

    // Verify Scaffold exists
    expect(find.byType(Scaffold), findsOneWidget);
  });
}
