import UIKit
import WebKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window?.backgroundColor = CliniverseBridgeViewController.releaseBackground
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}

    func applicationDidEnterBackground(_ application: UIApplication) {}

    func applicationWillEnterForeground(_ application: UIApplication) {}

    func applicationDidBecomeActive(_ application: UIApplication) {}

    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

@objc(CliniverseBridgeViewController)
final class CliniverseBridgeViewController: CAPBridgeViewController {

    static let releaseBackground = UIColor(
        red: 8.0 / 255.0,
        green: 12.0 / 255.0,
        blue: 22.0 / 255.0,
        alpha: 1.0
    )

    private var launchOverlay: UIView?
    private var progressObservation: NSKeyValueObservation?
    private var launchTimeout: DispatchWorkItem?

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()

        guard let webView = webView else { return }
        let topInset = view.safeAreaInsets.top
        let releaseFrame = CGRect(
            x: view.bounds.minX,
            y: view.bounds.minY + topInset,
            width: view.bounds.width,
            height: max(0, view.bounds.height - topInset)
        )

        if webView.frame != releaseFrame {
            webView.frame = releaseFrame
        }
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(CliniverseStoreKitPlugin())
        installLaunchOverlay()
        observeInitialNavigation()
    }

    deinit {
        progressObservation?.invalidate()
        launchTimeout?.cancel()
    }

    private func installLaunchOverlay() {
        guard launchOverlay == nil else { return }

        view.backgroundColor = Self.releaseBackground

        let overlay = UIView()
        overlay.translatesAutoresizingMaskIntoConstraints = false
        overlay.backgroundColor = Self.releaseBackground
        overlay.isAccessibilityElement = true
        overlay.accessibilityLabel = "Cliniverse AI is starting securely"

        let artwork = UIImageView(image: UIImage(named: "Splash"))
        artwork.translatesAutoresizingMaskIntoConstraints = false
        artwork.contentMode = .scaleAspectFill
        artwork.clipsToBounds = true
        artwork.backgroundColor = Self.releaseBackground

        let title = UILabel()
        title.text = "Cliniverse AI"
        title.textAlignment = .center
        title.textColor = .white
        title.font = .preferredFont(forTextStyle: .headline)
        title.adjustsFontForContentSizeCategory = true

        let subtitle = UILabel()
        subtitle.text = "Clinical learning and workflow support"
        subtitle.textAlignment = .center
        subtitle.textColor = UIColor(
            red: 203.0 / 255.0,
            green: 213.0 / 255.0,
            blue: 225.0 / 255.0,
            alpha: 1.0
        )
        subtitle.font = .preferredFont(forTextStyle: .footnote)
        subtitle.adjustsFontForContentSizeCategory = true
        subtitle.numberOfLines = 2

        let status = UILabel()
        status.text = "Starting securely…"
        status.textAlignment = .center
        status.textColor = UIColor(
            red: 94.0 / 255.0,
            green: 234.0 / 255.0,
            blue: 212.0 / 255.0,
            alpha: 1.0
        )
        status.font = .preferredFont(forTextStyle: .caption1)
        status.adjustsFontForContentSizeCategory = true

        let spinner = UIActivityIndicatorView(style: .medium)
        spinner.color = status.textColor
        spinner.startAnimating()

        let stack = UIStackView(arrangedSubviews: [title, subtitle, spinner, status])
        stack.translatesAutoresizingMaskIntoConstraints = false
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 8

        overlay.addSubview(artwork)
        overlay.addSubview(stack)
        view.addSubview(overlay)

        NSLayoutConstraint.activate([
            overlay.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            overlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            overlay.topAnchor.constraint(equalTo: view.topAnchor),
            overlay.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            artwork.leadingAnchor.constraint(equalTo: overlay.leadingAnchor),
            artwork.trailingAnchor.constraint(equalTo: overlay.trailingAnchor),
            artwork.topAnchor.constraint(equalTo: overlay.topAnchor),
            artwork.bottomAnchor.constraint(equalTo: overlay.bottomAnchor),
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: overlay.safeAreaLayoutGuide.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: overlay.safeAreaLayoutGuide.trailingAnchor, constant: -24),
            stack.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
            stack.bottomAnchor.constraint(equalTo: overlay.safeAreaLayoutGuide.bottomAnchor, constant: -34),
        ])

        launchOverlay = overlay
    }

    private func observeInitialNavigation() {
        guard let webView = webView else { return }

        progressObservation = webView.observe(\.estimatedProgress, options: [.initial, .new]) { [weak self] observedWebView, _ in
            guard observedWebView.estimatedProgress >= 1.0, !observedWebView.isLoading else { return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                guard observedWebView.estimatedProgress >= 1.0, !observedWebView.isLoading else { return }
                self?.dismissLaunchOverlay()
            }
        }

        let timeout = DispatchWorkItem { [weak self] in
            guard let self = self, self.launchOverlay != nil, let webView = self.webView else { return }

            webView.evaluateJavaScript("document.readyState") { [weak self] result, error in
                DispatchQueue.main.async {
                    guard let self = self, self.launchOverlay != nil else { return }

                    if error == nil,
                       let readyState = result as? String,
                       readyState == "interactive" || readyState == "complete" {
                        self.dismissLaunchOverlay()
                        return
                    }

                    self.showOfflineRecovery()
                }
            }
        }
        launchTimeout = timeout
        DispatchQueue.main.asyncAfter(deadline: .now() + 15, execute: timeout)
    }

    private func showOfflineRecovery() {
        guard let fallbackURL = bridge?.config.errorPathURL else {
            dismissLaunchOverlay()
            return
        }

        webView?.stopLoading()
        webView?.load(URLRequest(
            url: fallbackURL,
            cachePolicy: .reloadIgnoringLocalCacheData,
            timeoutInterval: 10
        ))

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            self?.dismissLaunchOverlay()
        }
    }

    private func dismissLaunchOverlay() {
        guard let overlay = launchOverlay else { return }

        launchTimeout?.cancel()
        launchTimeout = nil
        progressObservation?.invalidate()
        progressObservation = nil
        launchOverlay = nil

        UIView.animate(withDuration: 0.2, animations: {
            overlay.alpha = 0
        }, completion: { _ in
            overlay.removeFromSuperview()
        })
    }
}
