# 🤖 Agentic Self-Healing Selenium Robot Framework
> **"Zero-Maintenance" Automation that Fixes Itself using Gemini 2.0.**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Framework-Robot](https://img.shields.io/badge/Framework-Robot%20Framework-brightgreen.svg)](https://robotframework.org/)
[![AI-Gemini](https://img.shields.io/badge/AI-Gemini%202.0-orange.svg)](https://deepmind.google/technologies/gemini/)

---

##  🌟 1. Project Overview
This is a **Next-Generation Automated Testing Framework** designed to solve the single biggest pain point in Selenium automation: **Brittle Locators.**

Traditional automation scripts fail whenever the UI changes (ID changes, Class renaming, structural shifts). This framework uses **Generative AI (Gemini 2.0)** to "heal" itself at runtime. When a locator fails, the AI Agent steps in, analyzes the page (DOM + Vision), finds the new element, and seamlessly continues the test.

Here's a visual comparison of how traditional automation struggles versus the self-healing approach:

![App Screenshot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/img1.png?raw=true)

### 🎯 Who is it for?
* **QA Engineers** tired of fixing broken scripts after every deployment.
* **SDETs** building robust, low-maintenance frameworks.
* **DevOps Teams** practicing CI/CD where flaky tests block deployments.

###  😎 How & When to use?
Use this framework for E2E UI Testing of dynamic web applications. Run it in your CI/CD pipeline or locally. It shines when testing applications with frequent UI updates or AB testing.

---

## 🧠 2. Multi-Level Healing Strategy

Unlike basic "fuzzy matching," this framework implements a sophisticated **Agentic Intelligence** layer:

| Level | Strategy | Description |
| :--- | :--- | :--- |
| **🧠 L3** | **Semantic Healing** | Sends the **Live DOM** to Gemini. The AI understands the "intent" (e.g., "Find the Login Button") even if the ID is gone. |
| **👁️ L4** | **Multi-Modal Vision** | Compares **Healthy Snapshots** vs. **Broken Live State**. Gemini uses visual reasoning to find elements that have changed tags (e.g., `<button>` to `<div>`). |
| **⚡ L5** | **Agentic Update** | The framework **automatically rewrites your source code** (JSON Page Objects) with the fixed locator. |

![App Screenshot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/img2.png?raw=true)

![App Screenshot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/img3.png?raw=true)

---

##  🧬 Differential Healing (Snapshots)
It saves a "Minified DOM Snapshot" of every element during successful runs. When a failure occurs, it compares the Last Known Good State vs. Current Broken State to understand exactly how the element evolved.

##  ⚡ Level 5: Agentic Live-Correction
This is the "Zero-Maintenance" magic.

*   **Detect**: Test fails.
*   **Heal**: AI finds the new locator.
*   **Update**: The Agent automatically rewrites your source code (JSON Page Objects) with the new locator.
*   **Commit**: (Optional) It can even create a Git branch and push the fix!

**Real-World Fit:** In Agile/DevOps, UI changes daily. Traditional scripts require a 1:1 ratio of development to maintenance time. This framework decouples test logic from locator fragility, allowing QAs to focus on expanding coverage rather than maintaining existence.

![App Screenshot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/img4.png?raw=true)

## 🛠️ 3. Execution Workflow

The diagram below shows how the framework handles a failure and recovers automatically:

![App Screenshot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/img5.png?raw=true)

## 4. Directory Structure

![App Screenshot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/img6.png?raw=true)

---

## Screenshots

![Jenkins Screenshot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/jenkins_build_result.png?raw=true)

![Jenkins Screenshot](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/jenkins_build_result_2.png?raw=true)

### Auto Pull Requst Creation from Jenkins after sucessfull build:

![PR Creation 1](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/Auto%20PR%20Creation%201.png?raw=true)

![PR Creation 2](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/Auto%20PR%20Creation%202.png?raw=true)

![PR Creation 3](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/Auto%20PR%20Creation%203.png?raw=true)

![PR Creation 4](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/Auto%20PR%20Creation%204.png?raw=true)

![PR Creation 5](https://github.com/soumya-ranjan-000/image-hosting/blob/main/Self-Healing%20Selenium%20Robot%20Framework/Auto%20PR%20Creation%205.png?raw=true)

## Demo Video

### Local Execution:

[Watch demo](https://youtu.be/qzRNMPxzt8I)

---

### Jenkins Execution:

[Watch it running on jenkins](https://youtu.be/IFJchvDbRck)