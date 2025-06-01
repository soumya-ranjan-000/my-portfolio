# Cucumber Test Report Dashboard with MongoDB & Grafana for advanced analysis

Boared with Cucumber report/ Extent report?  Here is a custom dashboared, which will help QA and StackHolders to take business decision based on high level analaysis of test cases using grafana.

 ![ CucumberMongoUploader](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/grafana%20dashboard.png?raw=true)



---

## 🚀 Overview

This project demonstrates a complete automated test reporting solution using:

- **Cucumber BDD framework** for test execution

- **MongoDB** for storing test result data

- **Java application (library + uploader)** for pushing test results

- **REST API** to serve data to external tools

- **Grafana** (Infinity Plugin) to visualize execution trends, status breakdowns, and failure diagnostics

---

## 🎯 Objectives

1. Automatically collect and store cucumber.json reports after test execution in the mongo db database.

2. Expose a RESTful API to fetch historical test data from MongoDB using springboot.

3. Integrate the API with Grafana to build dynamic, filterable dashboards.

4. Convert the uploader logic into a reusable Java library for any Cucumber-based project.

---
## 🧱 Architecture
##
    
        [Cucumber Tests]
            |
            v
        [Cucumber JSON Report (target/cucumber.json)]
            |
            v
        [CucumberMongoUploader (Java Library)]
            |
            v
        [MongoDB]
            |
            v
        [Java API Layer (Spring Boot)]
            |
            v
        [Grafana Dashboard]

---

## 🛠️ Key Components

##

## ✅ 1. CucumberMongoUploader (Java Library) 

        Takes a cucumber.json file as input 

        Parses test results by feature, scenario, step

        Pushes structured documents to MongoDB

        Exposed as a library and distributed via GitHub Packages 
        
![ CucumberMongoUploader](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/ReportUploader.png?raw=true)

### Cucumber Plugin for report generation
![ cucumber plugin for json report](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/cucumber_plugin_for_report.png?raw=true)

### Add Aftersuite annotation to execute uploader after test report generation
![ aftersuite annotation cucumber](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/Add%20AfterSuite%20Annotation%20for%20report%20upload.png?raw=true)

![ uploader output](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/reportuploader_execution_output.png?raw=true)

###     MongoDB Output
![ MongoDb One](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/report%20in%20mongo.png?raw=true)

![ MongoDb two](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/report%20in%20mongo%202.png?raw=true)

##

## ✅ 2. REST API (Spring Boot)
##
        /api/reports: Fetch test results with filters (project, date, tag)

        /api/summary: Aggregated pass/fail/skipped counts

        /api/errors: Breakdown of failure messages

        Supports CORS for Grafana Cloud

        Dockerized for Render Deployment

        Deployed to Render.com

        Automatic redeploy on GitHub push

        Public endpoint ready for Grafana consumption
##        
### Swagger Page
![ Swagger Page Of Middle layer api](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/springboot-middle-layer.png?raw=true)

### Middle Layer - tellgrafan - REST API
![ Rest API in render](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/RestAPI%20deployement%20in%20render.png?raw=true)

### Springboot log in render
![ SpringBoot Logs in render](https://github.com/soumya-ranjan-000/image-hosting/blob/main/grafana_mogodb/api%20log%20in%20render.png?raw=true)

##
## ✅ 3. Grafana Integration
##
        Connected via Infinity Plugin (JSON API)

        Dashboards include:

        📅 Date range filters

        📊 Bar/line chart trends (weekly/monthly pass/fail)

        🧩 Pie charts for scenario status

        ❌ Error message breakdown

        🔁 Consistent tables showing scenarios, features, tags
##
---

## 🚀 Deployment
##
        🔹 MongoDB
        Hosted on MongoDB Atlas

        Collection: test_runs

        🔹 REST API (Render)
        Java 17 + Maven + Dockerfile

        Auto builds on GitHub commits

        🔹 Grafana Cloud
        Infinity plugin configured to hit Render API

        Shared dashboard JSON can be imported
##
---

## 🔄 Usage Flow
##
        1. Run Cucumber tests in any CI (GitHub Actions, Jenkins, local).

        2. After execution, @AfterSuite triggers CucumberMongoUploader.

        3. Results saved to MongoDB Atlas.

        4. Render-hosted Java API fetches Mongo data.

        5. Grafana pulls live data and shows:

            - Test trends

            - Pass/fail ratio

            - Skipped scenarios

            - Top failure reasons
##
---

## 📈 Dashboard Panels
##
        | Panel	                 | Description                              |
        |----------------------- |----------------------------------------- |
        |📊 Feature Bar Chart   | Pass/Fail/Skipped scenarios per feature   |
        | 📈 Weekly Trend Line  | Scenario results per week/month           |
        | ❌ Error Table	       | Breakdown of failure reasons              |
        | 📋 Scenario Table	    | All scenarios with status/timestamps      |
        | 🧩 Status Pie Chart   | Ratio of pass/fail/skipped scenarios      |
##
---

## 🔮 Future Enhancements
##
        🔗 Jenkins or GitHub Action plugins

        🔎 HTML report links per test run

        🚨 Slack/Email alerts for failures

        🔄 Jira integration for failure tracking
##    
---


## 📝 Final Thoughts

    This project provides complete visibility and traceability for test execution using a decoupled and scalable
    system. It is aimed at:

    ✅ QA/SDET Engineers

    ✅ DevOps Teams

    ✅ Engineering Managers

    Whether you're managing a large automation suite or just getting started, this project helps bridge the gap
    between test execution and insight-driven decisions.        

---

## 🧠 Related Blog

---


## 🔗 GitHub Repository

🔗 View Source on GitHub


---



## 🎥 Demo Video

Watch a short walkthrough of the framework:

<iframe width="100%" height="400" src="https://www.youtube.com/watch?v=iUtnZpzkbG8&list=PLGoWuvyH709vpTCVrjaJtaaFfite9U6u8" title="Playwright Java Cucumber Demo" frameborder="0" allowfullscreen></iframe>

*(Replace `your-video-id` with the actual YouTube video ID)*

---