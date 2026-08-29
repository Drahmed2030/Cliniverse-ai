import XCTest

final class CliniverseScreenshotTests: XCTestCase {
    private let app = XCUIApplication()
    private let waitTimeout: TimeInterval = 20

    override func setUpWithError() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
        app.launch()
    }

    func testAppleReleaseScreenshots() throws {
        try signInIfNeeded()

        try waitForText("One clear path through healthcare intelligence.")
        capture("01-home")

        try openTab("Care", waitingFor: "Care Workflow Simulation")
        capture("02-care")

        let patient = app.staticTexts["Hassan Al-Amri"]
        try reveal(patient, maximumSwipes: 6)
        patient.tap()
        try waitForText("PATIENT JOURNEY")
        capture("03-care-detail")

        let close = app.buttons["Close"]
        XCTAssertTrue(close.waitForExistence(timeout: waitTimeout), "Care detail did not expose its Close control")
        close.tap()

        try openTab("Intelligence", waitingFor: "Clinical Intelligence is not enabled in this release build.")
        capture("04-intelligence")

        try openTab("Atlas", waitingFor: "CURATED CAPABILITY LIBRARY")
        capture("05-atlas")

        try openTab("Me", waitingFor: "ONE ACCOUNT DESTINATION")
        let privacyAndSupport = app.staticTexts["Privacy & Support"]
        try reveal(privacyAndSupport, maximumSwipes: 10)

        let emailField = app.textFields["Email"]
        for _ in 0..<4 where emailField.isHittable {
            app.swipeUp()
            settle()
        }
        XCTAssertTrue(privacyAndSupport.isHittable, "Privacy & Support must remain visible in the Me screenshot")
        XCTAssertFalse(emailField.isHittable, "Reviewer email must not be visible in the Me screenshot")
        capture("06-me-privacy")
    }

    private func signInIfNeeded() throws {
        let homeTitle = app.staticTexts["One clear path through healthcare intelligence."]
        if homeTitle.waitForExistence(timeout: 4) {
            return
        }

        let emailEntry = app.buttons["Continue with Email"]
        XCTAssertTrue(emailEntry.waitForExistence(timeout: waitTimeout), "Release sign-in screen did not load")
        emailEntry.tap()

        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]
        XCTAssertTrue(emailField.waitForExistence(timeout: waitTimeout), "Reviewer email field is missing")
        XCTAssertTrue(passwordField.waitForExistence(timeout: waitTimeout), "Reviewer password field is missing")

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
        XCTAssertTrue(element.waitForExistence(timeout: waitTimeout), "Expected release element is missing")
        for _ in 0..<maximumSwipes where !element.isHittable {
            app.swipeUp()
            settle()
        }
        XCTAssertTrue(element.isHittable, "Expected release element could not be brought on screen")
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
