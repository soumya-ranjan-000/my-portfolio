# Robot Framework with Playwright

This document outlines the integration of Robot Framework with Playwright for robust web automation and testing.

## Needs

Combining Robot Framework's keyword-driven testing approach with Playwright's modern, fast, and reliable browser automation capabilities offers several benefits:

*   **Readability:** Robot Framework's syntax allows for highly readable test cases, even for non-technical stakeholders.
*   **Cross-Browser Support:** Playwright supports Chromium, Firefox, and WebKit, enabling comprehensive cross-browser testing.
*   **Reliability:** Playwright's auto-wait capabilities and robust element selectors reduce flakiness in tests.
*   **Developer Experience:** Playwright provides powerful debugging tools, including trace viewers, codegen, and browser inspection.
*   **Scalability:** Both tools are designed to handle large test suites efficiently.

## Setup

To get started, you'll need Python and `pip`.

1.  **Install Robot Framework:**
    ```bash
    pip install robotframework
    ```
2.  **Install Robot Framework Playwright Library:**
    ```bash
    pip install robotframework-browser
    ```
    This library acts as the bridge, providing keywords to interact with Playwright. It also installs Playwright and its browser binaries.
3.  **Install Browser Binaries (if not done automatically or for specific versions):**
    ```bash
    rfbrowser init
    ```

## Project Structure

A typical project structure might look like this:

```
robot-playwright-project/
├── tests/
│   ├── login_tests.robot
│   ├── product_page_tests.robot
│   └── resources/
│       ├── common_keywords.robot
│       └── locators.py  # For Python-based locators if preferred
├── resources/
│   ├── config.py      # Configuration variables (e.g., base URL)
│   └── environment.robot # Setup/teardown for the entire test suite
├── output/            # Generated reports and logs
├── README.md
└── requirements.txt
```

**Example `tests/login_tests.robot`:**

```robotframework
***Settings***
Library    Browser
Resource   resources/common_keywords.robot

***Test Cases***
Successful Login
    Open Browser To Login Page
    Input Username    testuser
    Input Password    password123
    Click Login Button
    Verify User Is Logged In

Invalid Login
    Open Browser To Login Page
    Input Username    invaliduser
    Input Password    wrongpassword
    Click Login Button
    Verify Login Error Message
```

**Example `tests/resources/common_keywords.robot`:**

```robotframework
***Settings***
Library    Browser
Variables  ../../resources/config.py

***Keywords***
Open Browser To Login Page
    New Browser    chromium    headless=${HEADLESS_MODE}
    New Page    ${BASE_URL}/login

Input Username
    [Arguments]    ${username}
    Fill Text    id=username    ${username}

Input Password
    [Arguments]    ${password}
    Fill Text    id=password    ${password}

Click Login Button
    Click    button=Login

Verify User Is Logged In
    Get Text    .welcome-message    ==    Welcome, testuser!

Verify Login Error Message
    Get Text    .error-message    ==    Invalid credentials
```

**Example `resources/config.py`:**

```python
BASE_URL = "http://localhost:8080"
HEADLESS_MODE = True # Set to False for visual debugging
```

## Execution

Navigate to your project root in the terminal and run Robot Framework:

```bash
robot tests/
```

To run a specific test file:

```bash
robot tests/login_tests.robot
```

To run tests with specific tags:

```bash
robot --include smoke tests/
```

You can also pass variables from the command line:

```bash
robot -v BASE_URL:http://my-staging.com tests/
```

## Reporting

After execution, Robot Framework generates comprehensive reports in the `output/` directory by default:

*   `log.html`: Detailed log of all test steps and their results.
*   `report.html`: An overview report of the test run, including statistics and pass/fail rates.
*   `output.xml`: An XML file containing all execution details, which can be used for further processing.

To view the reports, simply open `report.html` or `log.html` in your web browser.

## Links

*   [Robot Framework Official Website](https://robotframework.org/)
*   [Robot Framework Browser Library Documentation](https://robotframework-browser.org/)
*   [Playwright Official Website](https://playwright.dev/)
*   [Playwright Python Documentation](https://playwright.dev/python/)

## Images

![Project ScreenShot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/robot_playwright/IDE1.png?raw=true "Project ScreenShot")



