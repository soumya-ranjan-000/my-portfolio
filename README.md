# My Portfolio

This is a personal portfolio website built using React, Vite, and Tailwind CSS.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)

## Features
- Responsive layout
- Project routing with dynamic markdown rendering
- Hosted with free CI/CD pipeline

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/soumya-ranjan-000/my-portfolio.git
   cd my-portfolio
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage
The application is served via Vite. The main entry point is typically found in `src/main.jsx`.

## Project Structure
- `src/`: Contains the main application source code.
    - `components/`: Reusable UI components.
    - `data/`: Data handling logic (e.g., storage-targets.json).
    - `pages/`: Page components for routing.
    - `hooks/`: Custom hooks.

## Dependencies
The project relies on the following key technologies:
- **React**: For building the user interface.
- **Tailwind CSS**: For styling.
- **Vite**: For the build tooling and development server.

## Dependencies in package.json
The project has the following core dependencies:
- `react`
- `react-dom`
- `@octokit/rest` (for GitHub API interaction)
- `framer-motion`
- `react-markdown`
- `react-router-dom`