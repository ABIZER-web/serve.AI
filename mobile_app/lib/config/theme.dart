import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryColor = Color(0xFFF97316);
  static const Color secondaryColor = Color(0xFF171717);
  static const Color backgroundColor = Color(0xFFFAFAF9);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  static const Color successColor = Color(0xFF16A34A);
  static const Color warningColor = Color(0xFFF59E0B);
  static const Color dangerColor = Color(0xFFDC2626);
  static const Color blueColor = Color(0xFF2563EB);

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.plusJakartaSansTextTheme();

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: secondaryColor,
        surface: surfaceColor,
      ),
      scaffoldBackgroundColor: backgroundColor,
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.newsreader(fontSize: 32, fontWeight: FontWeight.bold, color: secondaryColor),
        displayMedium: GoogleFonts.newsreader(fontSize: 28, fontWeight: FontWeight.bold, color: secondaryColor),
        headlineLarge: GoogleFonts.newsreader(fontSize: 24, fontWeight: FontWeight.w800, color: secondaryColor),
        headlineMedium: GoogleFonts.newsreader(fontSize: 20, fontWeight: FontWeight.w700, color: secondaryColor),
        titleLarge: GoogleFonts.newsreader(fontSize: 18, fontWeight: FontWeight.w700, color: secondaryColor),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceColor,
        foregroundColor: secondaryColor,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.newsreader(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: secondaryColor,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFF3F4F6)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: GoogleFonts.plusJakartaSans(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      ),
    );
  }
}
