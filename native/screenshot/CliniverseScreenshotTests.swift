import XCTest

final class CliniverseScreenshotTests: XCTestCase {
    private let app = XCUIApplication()
    private let waitTimeout: TimeInterval = 20

    override func setUpWithError() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
        app.launch()
    }

    override func tearDownWithError() throws {
        if let run = testRun, run.failureCount > 0 {
            let screenshot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
            screenshot.name = "failure-screen"
            screenshot.lifetime = .keepAlways
            add(screenshot)

            let hierarchy = XCTAttachment(string: app.debugDescription)
            hierarchy.name = "failure-accessibility-hierarchy"
            hierarchy.lifetime = .keepAlways
            add(hierarchy)
        }
        app.terminate()
    }

    func testAppleReleaseScreenshots() throws {
        try runStep("Sign in with the protected reviewer account") {
            try signInIfNeeded()
        }

        try runStep("Capture Home") {
            try waitForText("One clear path through healthcare intelligence.")
            capture("01-home")
        }

        try runStep("Capture Care") {
            try openTab("Care", waitingFor: "Care Workflow Simulation")
            capture("02-care")
        }

        try runStep("Capture Care detail") {
            let patient = app.buttons["Open Hassan Al-Amri simulated case"]
            try reveal(patient, maximumSwipes: 6)
            patient.tap()
            try waitForText("PATIENT JOURNEY")
            capture("03-care-detail")
        }

        try runStep("Close Care detail") {
            let close = app.buttons["Close"]
            XCTAssertTrue(close.waitForExistence(timeout: waitTimeout), "Care detail did not expose its Close control")
            close.tap()
        }

        try runStep("Capture Intelligence release boundary") {
            try openTab("Intelligence", waitingFor: "Clinical Intelligence is not enabled in this release build.")
            capture("04-intelligence")
        }

        try runStep("Capture Atlas") {
            try openTab("Atlas", waitingFor: "CURATED CAPABILITY LIBRARY")
            capture("05-atlas")
        }

        try runStep("Capture Me privacy surface") {
            try openTab("Me", waitingFor: "ONE ACCOUNT DESTINATION")
            let privacyLink = app.links["Privacy"]
            try reveal(privacyLink, maximumSwipes: 10)
            privacyLink.tap()
            try waitForText("Release safety boundary")

            let emailField = app.textFields["Email"]
            XCTAssertFalse(emailField.exists, "Reviewer email must not be present in the privacy screenshot")
            capture("06-me-privacy")
        }
    }

    private func runStep(_ name: String, body: () throws -> Void) rethrows {
        try XCTContext.runActivity(named: name) { _ in
            try body()
        }
    }

    private func signInIfNeeded() throws {
        let homeTitle = app.staticTexts["One clear path through healthcare intelligence."]
        if homeTitle.waitForExistence(timeout: 4) {
            return
        }

        let emailEntry = app.buttons
            .matching(NSPredicate(format: "label ==[c] %@", "Continue with email"))
            .firstMatch
        XCTAssertTrue(emailEntry.waitForExistence(timeout: waitTimeout), "Release sign-in screen did not load")

        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]

        // The native web view can expose server-rendered controls before React
        // finishes hydrating them. A tap during that short window is visible to
        // XCUITest but has no JavaScript handler yet. Retry the same semantic
        // control on a bounded schedule and require the form transition before
        // entering any reviewer value.
        for attempt in 0..<3 {
            if emailField.exists && passwordField.exists {
                break
            }

            XCTAssertTrue(emailEntry.waitForExistence(timeout: waitTimeout), "Release sign-in screen disappeared before the email form opened")
            if attempt == 0 {
                Thread.sleep(forTimeInterval: 2)
            } else {
                settle()
            }
            XCTAssertTrue(emailEntry.isHittable, "Email sign-in action is not tappable")
            emailEntry.tap()

            if emailField.waitForExistence(timeout: 6) && passwordField.waitForExistence(timeout: 2) {
                break
            }
        }

        XCTAssertTrue(emailField.exists, "Reviewer email field is missing")
        XCTAssertTrue(passwordField.exists, "Reviewer password field is missing")

        let environment = ProcessInfo.processInfo.environment
        guard
            let email = environment["SCREENSHOT_REVIEW_EMAIL"],
            !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
            let password = environment["SCREENSHOT_REVIEW_PASSWORD"],
            password.count >= 8
        else {
            XCTFail("Secure screenshot reviewer credentials are not configured")
            return
        }

        emailField.tap()
        emailField.typeText(email)
        passwordField.tap()
        passwordField.typeText(password)

        let continueButton = app.buttons["Continue"]
        XCTAssertTrue(continueButton.waitForExistence(timeout: waitTimeout), "Email sign-in action is missing")
        continueButton.tap()

        XCTAssertTrue(homeTitle.waitForExistence(timeout: waitTimeout), "Reviewer account could not reach the release Home surface")
    }

    private func openTab(_ label: String, waitingFor expectedText: String) throws {
        let tab = app.buttons[label]
        XCTAssertTrue(tab.waitForExistence(timeout: waitTimeout), "Missing \(label) navigation tab")
        tab.tap()
        try waitForText(expectedText)
        settle()
    }

    private func waitForText(_ text: String) throws {
        let element = app.staticTexts[text]
        XCTAssertTrue(element.waitForExistence(timeout: waitTimeout), "Expected release text did not appear: \(text)")
        settle()
    }

    private func reveal(_ element: XCUIElement, maximumSwipes: Int) throws {
        // WKWebView may omit an off-screen DOM node from the accessibility
        // hierarchy until the viewport approaches it. Search the bounded page
        // range first instead of waiting for an element that cannot become
        // discoverable without scrolling.
        for swipe in 0...maximumSwipes {
            if element.exists && element.isHittable {
                return
            }
            if swipe < maximumSwipes {
                app.swipeUp()
                settle()
            }
        }
        XCTFail("Expected release element could not be discovered and brought on screen")
    }

    private func capture(_ name: String) {
        settle()
        XCTAssertEqual(app.keyboards.count, 0, "A keyboard must never appear in App Store screenshots")

        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    private func settle() {
        Thread.sleep(forTimeInterval: 0.8)
    }
}
