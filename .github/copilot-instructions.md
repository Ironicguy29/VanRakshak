# Copilot Custom Instructions for VanRakshak Project

This file provides workspace-specific custom instructions for GitHub Copilot in the VanRakshak project. The project involves an ESP32-based pet collar with GPS tracking, SIM7000 cellular module, vitals monitoring, geofencing, a Node.js/TypeScript server, and a Python simulator.

## Project Overview
- **Firmware (ESP32)**: Handles GPS, cellular communication, vitals sensors, geofencing logic.
- **Server**: Node.js with TypeScript for backend API, data storage, notifications.
- **Simulator**: Python-based tool for testing collar behavior without hardware.

## Coding Best Practices
- **General**:
	- Write clean, readable code with comments for complex logic.
	- Use version control (Git) and commit frequently.
	- Follow security best practices: avoid hardcoding secrets, use environment variables.
	- Test code thoroughly; include unit tests where possible.

- **Firmware (ESP32)**:
	- Use PlatformIO for build and dependency management.
	- Optimize for low power consumption.
	- Handle GPS and cellular errors gracefully.
	- Implement geofencing with efficient algorithms.

- **Server (Node.js/TypeScript)**:
	- Use Express.js for APIs.
	- Validate inputs and sanitize data.
	- Implement authentication (e.g., JWT).
	- Use databases like MongoDB or PostgreSQL for data persistence.

- **Simulator (Python)**:
	- Use libraries like `requests` for API calls, `geopy` for GPS simulation.
	- Ensure modularity for easy testing of different scenarios.

## Development Workflow
- Scaffold projects using appropriate tools (e.g., PlatformIO for firmware, npm for server).
- Compile and test incrementally.
- Document APIs and code in README.md and inline comments.
- Use VS Code tasks for build/run commands.

## Additional Rules
- Avoid verbose outputs; keep responses concise.
- If generating code, ensure it aligns with project requirements.
- For Azure-related features (if added), follow Azure best practices.
