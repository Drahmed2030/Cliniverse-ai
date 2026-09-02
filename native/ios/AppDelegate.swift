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

    private static var bootstrapSafeAreaInsets: UIEdgeInsets {
        let bounds = UIScreen.main.bounds
        let longEdge = max(bounds.width, bounds.height)
        let portrait = bounds.height >= bounds.width

        if UIDevice.current.userInterfaceIdiom == .pad {
            return UIEdgeInsets(top: 24, left: 0, bottom: 20, right: 0)
        }
        if !portrait {
            return UIEdgeInsets(top: 0, left: 59, bottom: 21, right: 59)
        }
        if longEdge <= 736 {
            return UIEdgeInsets(top: 20, left: 0, bottom: 0, right: 0)
        }
        return UIEdgeInsets(top: 59, left: 0, bottom: 34, right: 0)
    }

    private static func releaseSafeAreaScript(_ insets: UIEdgeInsets) -> String {
        return """
        (() => {
          const stateKey = '__cliniverseNativeSafeAreaContract';
          const nextValues = {
            '--cliniverse-native-safe-area-top': '\(Double(insets.top))px',
            '--cliniverse-native-safe-area-right': '\(Double(insets.right))px',
            '--cliniverse-native-safe-area-bottom': '\(Double(insets.bottom))px',
            '--cliniverse-native-safe-area-left': '\(Double(insets.left))px',
          };
          const state = window[stateKey] || {
            values: nextValues,
            observer: null,
            scheduled: false,
            apply: null,
          };
          state.values = nextValues;

          const enforcePixels = (style, name, value) => {
            const current = Number.parseFloat(style.getPropertyValue(name));
            const expected = Number.parseFloat(value);
            const priority = style.getPropertyPriority(name);
            if (!Number.isFinite(current) || Math.abs(current - expected) > 0.01 || priority !== 'important') {
              style.setProperty(name, value, 'important');
            }
          };

          const applyCliniverseSafeArea = () => {
            const root = document.documentElement;
            if (!root) return null;

            Object.entries(state.values).forEach(([name, value]) => {
              enforcePixels(root.style, name, value);
            });

            // Keep the native release header below system chrome even if a
            // framework render rewrites its inline safe-area expression.
            const top = Number.parseFloat(state.values['--cliniverse-native-safe-area-top']);
            const header = document.querySelector('[data-release-header-inner]');
            if (header instanceof HTMLElement && Number.isFinite(top)) {
              enforcePixels(header.style, 'padding-top', `${10 + top}px`);
              enforcePixels(header.style, 'min-height', `${68 + top}px`);
            }

            const computedRoot = getComputedStyle(root);
            const computedHeader = header instanceof HTMLElement ? getComputedStyle(header) : null;
            return {
              top: computedRoot.getPropertyValue('--cliniverse-native-safe-area-top').trim(),
              right: computedRoot.getPropertyValue('--cliniverse-native-safe-area-right').trim(),
              bottom: computedRoot.getPropertyValue('--cliniverse-native-safe-area-bottom').trim(),
              left: computedRoot.getPropertyValue('--cliniverse-native-safe-area-left').trim(),
              headerPaddingTop: computedHeader?.paddingTop || 'missing',
              headerMinY: header instanceof HTMLElement ? header.getBoundingClientRect().top : null,
              readyState: document.readyState,
            };
          };
          state.apply = applyCliniverseSafeArea;
          window[stateKey] = state;

          const installCliniverseSafeArea = () => {
            const root = document.documentElement;
            if (!root) return null;
            const result = state.apply();
            if (!state.observer) {
              state.observer = new MutationObserver((mutations) => {
                const relevant = mutations.some((mutation) =>
                  mutation.type === 'childList' ||
                  mutation.target === root ||
                  (mutation.target instanceof HTMLElement && mutation.target.matches('[data-release-header-inner]'))
                );
                if (!relevant || state.scheduled) return;
                state.scheduled = true;
                requestAnimationFrame(() => {
                  state.scheduled = false;
                  state.apply();
                });
              });
              state.observer.observe(root, {
                attributes: true,
                attributeFilter: ['style'],
                childList: true,
                subtree: true,
              });
            }
            return result;
          };

          if (!document.documentElement) {
            document.addEventListener('DOMContentLoaded', installCliniverseSafeArea, { once: true });
            return null;
          }
          return installCliniverseSafeArea();
        })();
        """
    }

    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        let bootstrap = WKUserScript(
            source: Self.releaseSafeAreaScript(Self.bootstrapSafeAreaInsets),
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        configuration.userContentController.addUserScript(bootstrap)
        return super.webView(with: frame, configuration: configuration)
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
        bridge?.registerPluginInstance(CliniverseStoreKitPlugin())
        installLaunchOverlay()
        observeInitialNavigation()
    }

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        synchronizeReleaseSafeArea()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        synchronizeReleaseSafeArea()
    }

    deinit {
        progressObservation?.invalidate()
        launchTimeout?.cancel()
    }

    private func synchronizeReleaseSafeArea() {
        guard let webView = webView else { return }

        let viewInsets = view.safeAreaInsets
        let windowInsets = view.window?.safeAreaInsets ?? .zero
        let statusBarBottom = view.window?.windowScene?.statusBarManager?.statusBarFrame.maxY ?? 0
        let measuredInsets = UIEdgeInsets(
            top: max(max(viewInsets.top, windowInsets.top), statusBarBottom),
            left: max(viewInsets.left, windowInsets.left),
            bottom: max(viewInsets.bottom, windowInsets.bottom),
            right: max(viewInsets.right, windowInsets.right)
        )
        // A WKWebView that extends under the status bar can report a zero top
        // inset while still reporting the home-indicator bottom inset. Resolve
        // every edge independently so one valid measured edge cannot erase the
        // deterministic bootstrap clearance required by another edge.
        let bootstrapInsets = Self.bootstrapSafeAreaInsets
        let resolvedInsets = UIEdgeInsets(
            top: max(measuredInsets.top, bootstrapInsets.top),
            left: max(measuredInsets.left, bootstrapInsets.left),
            bottom: max(measuredInsets.bottom, bootstrapInsets.bottom),
            right: max(measuredInsets.right, bootstrapInsets.right)
        )

        webView.evaluateJavaScript(Self.releaseSafeAreaScript(resolvedInsets)) { result, error in
            if let error = error {
                print("[CliniverseSafeArea] injectionError=\(error.localizedDescription)")
                return
            }
            guard let contract = result as? [String: Any] else {
                print("[CliniverseSafeArea] nativeTop=\(Double(resolvedInsets.top)) result=pending")
                return
            }
            let cssTop = contract["top"] as? String ?? "missing"
            let headerPaddingTop = contract["headerPaddingTop"] as? String ?? "missing"
            let headerMinY = contract["headerMinY"].map { String(describing: $0) } ?? "missing"
            let readyState = contract["readyState"] as? String ?? "unknown"
            print(
                "[CliniverseSafeArea] nativeTop=\(Double(resolvedInsets.top)) " +
                "cssTop=\(cssTop) headerPaddingTop=\(headerPaddingTop) " +
                "headerMinY=\(headerMinY) ready=\(readyState)"
            )
        }
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
                self?.synchronizeReleaseSafeArea()
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
                        self.synchronizeReleaseSafeArea()
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
