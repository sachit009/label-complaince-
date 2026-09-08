import UIKit
import WebKit
import AVFoundation

/**
 * Swift View Controller providing full-screen WKWebView for LM Scan.
 * Configured with WebRTC camera permissions, JavaScript messaging,
 * haptic feedback, and local/remote asset loading.
 */
class ViewController: UIViewController, WKUIDelegate, WKNavigationDelegate, WKScriptMessageHandler {

    private var webView: WKWebView!
    private let hapticGenerator = UIImpactFeedbackGenerator(style: .medium)

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.06, green: 0.07, blue: 0.09, alpha: 1.0)

        setupWebView()
        checkCameraPermissions()
        loadAppContent()
    }

    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true
        configuration.defaultWebpagePreferences = preferences

        // Allow inline video playback for camera feed
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Register Swift JS Bridge handler
        let contentController = WKUserContentController()
        contentController.add(self, name: "iosNative")
        configuration.userContentController = contentController

        webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.backgroundColor = .clear
        webView.isOpaque = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .always

        view.addSubview(webView)
    }

    private func checkCameraPermissions() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    if granted {
                        self.webView.reload()
                    }
                }
            }
        case .restricted, .denied:
            print("[LMScan] Camera access restricted or denied")
        case .authorized:
            break
        @unknown default:
            break
        }
    }

    private func loadAppContent() {
        // First try to load bundled www/index.html, or fallback to remote server
        if let indexPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www") {
            let indexUrl = URL(fileURLWithPath: indexPath)
            webView.loadFileURL(indexUrl, allowingReadAccessTo: indexUrl.deletingLastPathComponent())
        } else if let remoteUrl = URL(string: "http://localhost:8080") {
            let request = URLRequest(url: remoteUrl)
            webView.load(request)
        }
    }

    // MARK: - WKScriptMessageHandler
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "iosNative", let body = message.body as? [String: Any] else { return }

        if let action = body["action"] as? String {
            switch action {
            case "haptic":
                hapticGenerator.impactOccurred()
            case "alert":
                if let text = body["message"] as? String {
                    let alert = UIAlertController(title: "LM Scan", message: text, preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default))
                    present(alert, animated: true)
                }
            default:
                break
            }
        }
    }

    // MARK: - WKUIDelegate (Camera Permission in iOS 15+)
    @available(iOS 15.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        decisionHandler(.grant)
    }
}
