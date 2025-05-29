# Playwright Java with Cucumber Framework

An end-to-end test automation framework built using **Playwright** with **Java** and **Cucumber**, designed for scalable, maintainable, and readable UI testing.

---

## 🚀 Overview

This project demonstrates how to create a powerful and flexible test automation framework using:

- **Playwright Java** for fast and reliable browser automation
- **Cucumber BDD** for readable test scenarios
- **ExtentReports** for rich HTML reporting
- **Parallel Execution** using JUnit/TestNG

- **Maven** for build and dependency management

---


## 🧭 Architecture Flow

![Framework Architecture](/images/playwright-architecture.png)

This flow shows how feature files trigger the step definitions which in turn call page objects and utilities to drive browser automation.

---

## 📁 Project Structure

```plaintext
src/
├── test/
│   ├── java/
│   │   ├── stepdefinitions/
│   │   ├── pages/
│   │   ├── runners/
│   │   └── utils/
│   ├── resources/
│   │   └── features/
├── main/
│   └── java/
└── reports/
```

---

## 📸 Sample Screenshots

![Framework Overview](https://raw.githubusercontent.com/soumya-ranjan-000/image-hosting/refs/heads/main/playwright_cucumber.png)
![Test Execution](https://raw.githubusercontent.com/soumya-ranjan-000/image-hosting/refs/heads/main/scenario_execution.png)

---

## 🧪 Sample Feature

```gherkin
Feature: Login functionality

  Scenario: Valid login
    Given I launch the application
    When I enter valid credentials
    Then I should see the dashboard
```

---
## 🛠️ How to Run ?

### Clone the repo:
    git clone https://github.com/soumya-ranjan-000/playwright-java-cucumber

### Navigate to the project:
    cd playwright-java-cucumber

### Run tests:
    mvn clean test


---


## 🧠 Related Blog
📖 How I Built a Scalable Playwright Java Framework

(Replace with your actual blog post link if available)


---


## 🔗 GitHub Repository

🔗 View Source on GitHub


---


## 📈 Highlights

- Fast execution with Playwright

- Clean and reusable step definitions

- Cloud support for cross-browser testing

- Beautiful and detailed reporting

- Easy integration into CI/CD pipelines

---



## 🎥 Demo Video

Watch a short walkthrough of the framework:

<iframe width="100%" height="400" src="https://www.youtube.com/watch?v=iUtnZpzkbG8&list=PLGoWuvyH709vpTCVrjaJtaaFfite9U6u8" title="Playwright Java Cucumber Demo" frameborder="0" allowfullscreen></iframe>

*(Replace `your-video-id` with the actual YouTube video ID)*

---