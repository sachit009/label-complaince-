# Proguard rules for LM Scan
-keepclassmembers class com.lmscan.compliance.WebAppInterface {
    public *;
}
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
