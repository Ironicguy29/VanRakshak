#!/usr/bin/env python3
"""
VanRakshak Project Management Menu
A unified CLI tool to manage all project components
"""

import os
import sys
import subprocess
import json
import time
import webbrowser
from typing import Optional
from datetime import datetime

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    MAGENTA = '\033[35m'
    YELLOW = '\033[33m'
    CYAN = '\033[36m'
    WHITE = '\033[97m'
    BG_BLUE = '\033[44m'
    BG_GREEN = '\033[42m'
    BG_RED = '\033[41m'


class VanRakshakMenu:
    def __init__(self):
        self.project_root = os.path.dirname(os.path.abspath(__file__))
        self.server_path = os.path.join(self.project_root, "server")
        self.firmware_path = os.path.join(self.project_root, "firmware", "esp32")
        self.simulator_path = os.path.join(self.project_root, "simulator")
        self.esp32_devices = []  # Store detected ESP32 devices

    def clear_screen(self):
        """Clear the terminal screen"""
        os.system('cls' if os.name == 'nt' else 'clear')

    def detect_esp32_devices(self):
        """Detect connected ESP32 devices"""
        try:
            pio_path = os.path.expandvars(r"%USERPROFILE%\.platformio\penv\Scripts\platformio.exe")
            if os.path.exists(pio_path):
                result = subprocess.run(f'"{pio_path}" device list',
                                        shell=True,
                                        capture_output=True,
                                        text=True,
                                        timeout=3)
                if result.returncode == 0:
                    # Parse device list
                    devices = []
                    for line in result.stdout.split('\n'):
                        if 'COM' in line or '/dev/tty' in line or 'USB' in line:
                            devices.append(line.strip())
                    self.esp32_devices = devices[:3]  # Keep max 3 devices
                else:
                    self.esp32_devices = []
            else:
                self.esp32_devices = []
        except Exception:
            self.esp32_devices = []

    def check_port_3000(self):
        """Check and auto-kill process on port 3000"""
        try:
            result = subprocess.run("netstat -ano | findstr :3000",
                                    shell=True,
                                    capture_output=True,
                                    text=True,
                                    timeout=2)
            if "LISTENING" in result.stdout:
                # Extract PID
                for line in result.stdout.split('\n'):
                    if "LISTENING" in line:
                        parts = line.split()
                        if len(parts) >= 5:
                            pid = parts[-1]
                            try:
                                subprocess.run(f"taskkill /F /PID {pid}",
                                               shell=True,
                                               capture_output=True,
                                               timeout=2)
                            except Exception:
                                pass
        except Exception:
            pass

    def print_header(self):
        """Print the application header"""
        # Detect devices before showing header
        self.detect_esp32_devices()

        print(f"\n{Colors.BOLD}{Colors.CYAN}")
        print("╔" + "═" * 70 + "╗")
        print("║" + " " * 70 + "║")
        print("║" + " " * 15 + "🐾 VanRakshak - Guardian Band Manager 🐾" + " " * 15 + "║")
        print("║" + " " * 70 + "║")
        print("╚" + "═" * 70 + "╝")
        print(f"{Colors.ENDC}")

        # Show current time and status
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"{Colors.MAGENTA}⏰ Current Time: {current_time}{Colors.ENDC}")
        print(f"{Colors.YELLOW}📍 Project Root: {os.path.basename(self.project_root)}{Colors.ENDC}")

        # Show ESP32 device status
        if self.esp32_devices:
            print(f"\n{Colors.OKGREEN}📡 ESP32 Devices Connected:{Colors.ENDC}")
            for device in self.esp32_devices:
                print(f"{Colors.CYAN}  ├─ {device}{Colors.ENDC}")
        else:
            print(f"\n{Colors.WARNING}📡 ESP32 Devices: No devices detected{Colors.ENDC}")

        print()  # Extra spacing

    def print_menu(self):
        """Display the main menu"""
        self.clear_screen()
        self.print_header()

        # Menu sections with enhanced design
        print(f"{Colors.BOLD}{Colors.WHITE}{Colors.BG_BLUE}  🚀 SERVER MANAGEMENT  {Colors.ENDC}")
        print(f"{Colors.CYAN}  ┌────────────────────────────────────────────────────────┐{Colors.ENDC}")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}1.{Colors.ENDC}  🟢 Start Backend Server (Dev Mode)")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}2.{Colors.ENDC}  🔵 Start Backend Server (Production)")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}3.{Colors.ENDC}  📦 Install Server Dependencies")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}4.{Colors.ENDC}  🔨 Build Server (TypeScript)")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}5.{Colors.ENDC}  🌐 Open Backend (localhost:3000)")
        print(f"{Colors.CYAN}  └────────────────────────────────────────────────────────┘{Colors.ENDC}\n")

        print(f"{Colors.BOLD}{Colors.WHITE}{Colors.BG_GREEN}  🗄️  DATABASE  {Colors.ENDC}")
        print(f"{Colors.CYAN}  ┌────────────────────────────────────────────────────────┐{Colors.ENDC}")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}6.{Colors.ENDC}  � Start MongoDB Server (Local)")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}7.{Colors.ENDC}  📊 Check MongoDB Status")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}8.{Colors.ENDC}  🔌 Install MongoDB Dependencies")
        print(f"{Colors.CYAN}  └────────────────────────────────────────────────────────┘{Colors.ENDC}\n")

        print(f"{Colors.BOLD}{Colors.WHITE}{Colors.BG_BLUE}  🎨 FRONTEND  {Colors.ENDC}")
        print(f"{Colors.CYAN}  ┌────────────────────────────────────────────────────────┐{Colors.ENDC}")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}9.{Colors.ENDC}  �️  Open Frontend Dashboard")
        print(f"{Colors.CYAN}  └────────────────────────────────────────────────────────┘{Colors.ENDC}\n")

        print(f"{Colors.BOLD}{Colors.WHITE}{Colors.BG_BLUE}  📡 ESP32 FIRMWARE  {Colors.ENDC}")
        print(f"{Colors.CYAN}  ┌────────────────────────────────────────────────────────┐{Colors.ENDC}")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}10.{Colors.ENDC} 🔨 Build ESP32 Firmware")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}11.{Colors.ENDC} 📤 Upload Firmware to ESP32")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}12.{Colors.ENDC} 📟 Monitor Serial Port")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}13.{Colors.ENDC} ⚡ Complete Flow (Build→Upload→Monitor)")
        print(f"{Colors.CYAN}  └────────────────────────────────────────────────────────┘{Colors.ENDC}\n")

        print(f"{Colors.BOLD}{Colors.WHITE}{Colors.BG_BLUE}  🧪 TESTING & SIMULATION  {Colors.ENDC}")
        print(f"{Colors.CYAN}  ┌────────────────────────────────────────────────────────┐{Colors.ENDC}")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}14.{Colors.ENDC} 🐍 Run Simulator (Python)")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}15.{Colors.ENDC} 🔍 Test API Endpoints")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}16.{Colors.ENDC} 📱 Test SMS/Twilio")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}17.{Colors.ENDC} ✅ Test All Components")
        print(f"{Colors.CYAN}  └────────────────────────────────────────────────────────┘{Colors.ENDC}\n")

        print(f"{Colors.BOLD}{Colors.WHITE}{Colors.BG_BLUE}  🔧 UTILITIES  {Colors.ENDC}")
        print(f"{Colors.CYAN}  ┌────────────────────────────────────────────────────────┐{Colors.ENDC}")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}18.{Colors.ENDC} 💊 System Health Check")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}19.{Colors.ENDC} 🔌 View COM Ports")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}20.{Colors.ENDC} 🧹 Clean Build Files")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}21.{Colors.ENDC} 📂 Show Project Structure")
        print(f"{Colors.CYAN}  └────────────────────────────────────────────────────────┘{Colors.ENDC}\n")

        print(f"{Colors.BOLD}{Colors.WHITE}{Colors.BG_BLUE}  � DOCUMENTATION  {Colors.ENDC}")
        print(f"{Colors.CYAN}  ┌────────────────────────────────────────────────────────┐{Colors.ENDC}")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}22.{Colors.ENDC} 📖 Quick Start Guide")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.OKGREEN}23.{Colors.ENDC} 📄 View README")
        print(f"{Colors.CYAN}  └────────────────────────────────────────────────────────┘{Colors.ENDC}\n")

        print(f"{Colors.BOLD}{Colors.FAIL}  ❌ EXIT  {Colors.ENDC}")
        print(f"{Colors.CYAN}  ┌────────────────────────────────────────────────────────┐{Colors.ENDC}")
        print(f"{Colors.CYAN}  │{Colors.ENDC} {Colors.FAIL}0.{Colors.ENDC}  👋 Exit Program")
        print(f"{Colors.CYAN}  └────────────────────────────────────────────────────────┘{Colors.ENDC}\n")

    def run_command(self, command: str, cwd: Optional[str] = None, shell: bool = True, background: bool = False, new_terminal: bool = False):
        """Execute a shell command"""
        try:
            print(f"\n{Colors.WARNING}⚙️  Executing: {command}{Colors.ENDC}\n")

            if new_terminal:
                # Always run in a new terminal window
                if os.name == 'nt':  # Windows
                    # Use 'start' command to open a new cmd window
                    if cwd:
                        full_command = f'start cmd /k "cd /d {cwd} && {command}"'
                    else:
                        full_command = f'start cmd /k "{command}"'
                    subprocess.Popen(full_command, shell=True)
                else:  # Unix/Linux/Mac
                    # Try different terminal emulators
                    terminals = ['gnome-terminal', 'xterm', 'konsole']
                    for term in terminals:
                        try:
                            if cwd:
                                subprocess.Popen([term, '--', 'bash', '-c', f'cd {cwd} && {command}; exec bash'])
                            else:
                                subprocess.Popen([term, '--', 'bash', '-c', f'{command}; exec bash'])
                            break
                        except FileNotFoundError:
                            continue
                print(f"{Colors.OKGREEN}✓ Command started in new terminal{Colors.ENDC}")
                time.sleep(1)
            elif background:
                if os.name == 'nt':  # Windows
                    subprocess.Popen(command, cwd=cwd, shell=shell, creationflags=subprocess.CREATE_NEW_CONSOLE)
                else:  # Unix/Linux/Mac
                    subprocess.Popen(command, cwd=cwd, shell=shell)
                print(f"{Colors.OKGREEN}✓ Process started in background{Colors.ENDC}")
                time.sleep(2)
            else:
                result = subprocess.run(command, cwd=cwd, shell=shell, capture_output=False)
                if result.returncode == 0:
                    print(f"\n{Colors.OKGREEN}✓ Command completed successfully{Colors.ENDC}")
                else:
                    print(f"\n{Colors.FAIL}✗ Command failed with exit code {result.returncode}{Colors.ENDC}")
                return result.returncode
        except Exception as e:
            print(f"\n{Colors.FAIL}✗ Error: {str(e)}{Colors.ENDC}")
            return 1

    def start_server_dev(self):
        """Start backend server in development mode"""
        print(f"\n{Colors.HEADER}Starting Backend Server (Dev Mode)...{Colors.ENDC}")

        # Auto-kill any process on port 3000
        print(f"{Colors.CYAN}Checking port 3000...{Colors.ENDC}")
        self.check_port_3000()
        time.sleep(1)

        self.run_command("npm run dev", cwd=self.server_path, new_terminal=True)

    def start_server_prod(self):
        """Start backend server in production mode"""
        print(f"\n{Colors.HEADER}Starting Backend Server (Production Mode)...{Colors.ENDC}")
        self.run_command("node dist/index.js", cwd=self.server_path, new_terminal=True)

    def install_server_deps(self):
        """Install server dependencies"""
        print(f"\n{Colors.HEADER}Installing Server Dependencies...{Colors.ENDC}")
        self.run_command("npm install", cwd=self.server_path, new_terminal=True)

    def build_server(self):
        """Build server TypeScript code"""
        print(f"\n{Colors.HEADER}Building Server (TypeScript Compilation)...{Colors.ENDC}")
        self.run_command("npm run build", cwd=self.server_path, new_terminal=True)

    def open_backend(self):
        """Open backend webpage in browser"""
        print(f"\n{Colors.HEADER}Opening Backend Webpage...{Colors.ENDC}")
        backend_url = "http://localhost:3000"

        # Check if server might be running
        print(f"{Colors.OKCYAN}Opening: {backend_url}{Colors.ENDC}")
        print(f"{Colors.WARNING}Note: Make sure the backend server is running (Option 1 or 2){Colors.ENDC}\n")

        try:
            webbrowser.open(backend_url)
            print(f"{Colors.OKGREEN}✓ Browser opened{Colors.ENDC}")

            # Show available endpoints
            print(f"\n{Colors.OKCYAN}Available API Endpoints:{Colors.ENDC}")
            print(f"  • GET  {backend_url}/")
            print(f"  • POST {backend_url}/location")
            print(f"  • POST {backend_url}/vitals")
            print(f"  • GET  {backend_url}/health")
        except Exception as e:
            print(f"{Colors.FAIL}✗ Failed to open browser: {str(e)}{Colors.ENDC}")

    def start_mongodb(self):
        """Start MongoDB server locally"""
        print(f"\n{Colors.HEADER}Starting MongoDB Server...{Colors.ENDC}")

        # Check common MongoDB paths
        mongo_paths = [
            r"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
            r"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe",
            r"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe",
            r"C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe",
            "/usr/local/bin/mongod",
            "/usr/bin/mongod"
        ]

        mongo_found = None
        for path in mongo_paths:
            if os.path.exists(path):
                mongo_found = path
                break

        if mongo_found:
            print(f"{Colors.OKGREEN}✓ MongoDB found at: {mongo_found}{Colors.ENDC}")

            # Create data directory if not exists
            data_dir = os.path.join(self.project_root, "mongodb_data")
            os.makedirs(data_dir, exist_ok=True)

            if os.name == 'nt':
                command = f'"{mongo_found}" --dbpath "{data_dir}"'
            else:
                command = f'{mongo_found} --dbpath "{data_dir}"'

            print(f"{Colors.CYAN}Data directory: {data_dir}{Colors.ENDC}")
            self.run_command(command, new_terminal=True)
        else:
            print(f"{Colors.FAIL}✗ MongoDB not found!{Colors.ENDC}")
            print(f"\n{Colors.WARNING}Please install MongoDB:{Colors.ENDC}")
            print(f"{Colors.CYAN}Windows: https://www.mongodb.com/try/download/community{Colors.ENDC}")
            print(f"{Colors.CYAN}Ubuntu: sudo apt install mongodb{Colors.ENDC}")
            print(f"{Colors.CYAN}macOS: brew install mongodb-community{Colors.ENDC}")

    def check_mongodb_status(self):
        """Check MongoDB connection status"""
        print(f"\n{Colors.HEADER}Checking MongoDB Status...{Colors.ENDC}")

        try:
            # Try to check if mongosh or mongo is available
            result = subprocess.run("mongosh --version", shell=True,
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print(f"{Colors.OKGREEN}✓ MongoDB Shell (mongosh) is installed{Colors.ENDC}")
                print(f"{Colors.CYAN}Version: {result.stdout.strip()}{Colors.ENDC}")

                # Try to connect
                print(f"\n{Colors.CYAN}Testing connection to localhost:27017...{Colors.ENDC}")
                connect_result = subprocess.run(
                    'mongosh --eval "db.adminCommand({ ping: 1 })" --quiet',
                    shell=True, capture_output=True, text=True, timeout=5
                )

                if connect_result.returncode == 0:
                    print(f"{Colors.OKGREEN}✓ MongoDB server is running and accessible!{Colors.ENDC}")
                else:
                    print(f"{Colors.WARNING}⚠ MongoDB shell found but server not responding{Colors.ENDC}")
                    print(f"{Colors.CYAN}Start MongoDB with option 6{Colors.ENDC}")
            else:
                # Try legacy mongo command
                result = subprocess.run("mongo --version", shell=True,
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"{Colors.OKGREEN}✓ MongoDB (legacy) is installed{Colors.ENDC}")
                else:
                    print(f"{Colors.FAIL}✗ MongoDB shell not found{Colors.ENDC}")

        except subprocess.TimeoutExpired:
            print(f"{Colors.WARNING}⚠ Connection timeout - MongoDB may not be running{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.FAIL}✗ Error checking MongoDB: {str(e)}{Colors.ENDC}")

    def install_mongodb_deps(self):
        """Install MongoDB dependencies for Node.js server"""
        print(f"\n{Colors.HEADER}Installing MongoDB Dependencies...{Colors.ENDC}")
        print(f"{Colors.CYAN}Installing: mongodb, mongoose{Colors.ENDC}\n")
        self.run_command("npm install mongodb mongoose",
                        cwd=self.server_path, new_terminal=True)

    def open_frontend(self):
        """Open frontend dashboard in browser"""
        print(f"\n{Colors.HEADER}Opening Frontend Dashboard...{Colors.ENDC}")

        # Check for common frontend paths
        frontend_paths = [
            os.path.join(self.project_root, "frontend", "index.html"),
            os.path.join(self.project_root, "client", "index.html"),
            os.path.join(self.project_root, "web", "index.html"),
            os.path.join(self.project_root, "public", "index.html"),
        ]

        frontend_found = None
        for path in frontend_paths:
            if os.path.exists(path):
                frontend_found = path
                break

        if frontend_found:
            print(f"{Colors.OKCYAN}Opening: {frontend_found}{Colors.ENDC}")
            try:
                webbrowser.open(f"file:///{frontend_found}")
                print(f"{Colors.OKGREEN}✓ Browser opened{Colors.ENDC}")
            except Exception as e:
                print(f"{Colors.FAIL}✗ Failed to open browser: {str(e)}{Colors.ENDC}")
        else:
            print(f"{Colors.WARNING}⚠ Frontend HTML file not found.{Colors.ENDC}")
            print(f"{Colors.OKCYAN}Would you like to create a simple dashboard?{Colors.ENDC}")
            choice = input("Create dashboard? (y/n): ").strip().lower()
            if choice == 'y':
                self.create_simple_dashboard()

    def create_simple_dashboard(self):
        """Create a simple HTML dashboard"""
        frontend_dir = os.path.join(self.project_root, "frontend")
        os.makedirs(frontend_dir, exist_ok=True)

        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VanRakshak - Guardian Band Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
            text-align: center;
        }
        h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 1.2em;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .card h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        .status {
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin: 10px 0;
        }
        .status.online {
            background: #d4edda;
            color: #155724;
        }
        .status.offline {
            background: #f8d7da;
            color: #721c24;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            margin: 5px;
            transition: all 0.3s;
        }
        button:hover {
            background: #764ba2;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .endpoint {
            background: #f8f9fa;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            font-family: monospace;
        }
        .endpoint .method {
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-weight: bold;
            margin-right: 10px;
        }
        .get { background: #28a745; }
        .post { background: #007bff; }
        #response {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🐾 VanRakshak Dashboard</h1>
            <p class="subtitle">Guardian Band Monitoring System</p>
        </header>

        <div class="grid">
            <div class="card">
                <h2>🚀 Server Status</h2>
                <div id="serverStatus" class="status offline">Checking...</div>
                <button onclick="checkServer()">Check Connection</button>
            </div>

            <div class="card">
                <h2>📡 API Endpoints</h2>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span>/</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span>/location</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span>/vitals</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span>/health</span>
                </div>
            </div>

            <div class="card">
                <h2>🧪 Test Actions</h2>
                <button onclick="testHealth()">Test Health Endpoint</button>
                <button onclick="testLocation()">Send Test Location</button>
                <button onclick="testVitals()">Send Test Vitals</button>
            </div>
        </div>

        <div class="card">
            <h2>📊 Response</h2>
            <div id="response">Click a test button to see API response...</div>
        </div>
    </div>

    <script>
        const API_URL = 'http://localhost:3000';

        async function checkServer() {
            const statusEl = document.getElementById('serverStatus');
            statusEl.textContent = 'Checking...';
            statusEl.className = 'status';

            try {
                const response = await fetch(API_URL + '/health');
                if (response.ok) {
                    statusEl.textContent = '✓ Server Online';
                    statusEl.className = 'status online';
                } else {
                    statusEl.textContent = '✗ Server Error';
                    statusEl.className = 'status offline';
                }
            } catch (error) {
                statusEl.textContent = '✗ Server Offline';
                statusEl.className = 'status offline';
            }
        }

        async function testHealth() {
            showResponse('Testing /health endpoint...');
            try {
                const response = await fetch(API_URL + '/health');
                const data = await response.json();
                showResponse(JSON.stringify(data, null, 2));
            } catch (error) {
                showResponse('Error: ' + error.message);
            }
        }

        async function testLocation() {
            showResponse('Sending test location data...');
            const testData = {
                animalId: 'GB-test-001',
                latitude: 28.6139,
                longitude: 77.2090,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch(API_URL + '/location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testData)
                });
                const data = await response.json();
                showResponse(JSON.stringify(data, null, 2));
            } catch (error) {
                showResponse('Error: ' + error.message);
            }
        }

        async function testVitals() {
            showResponse('Sending test vitals data...');
            const testData = {
                animalId: 'GB-test-001',
                heartRate: 75,
                temperature: 38.5,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch(API_URL + '/vitals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testData)
                });
                const data = await response.json();
                showResponse(JSON.stringify(data, null, 2));
            } catch (error) {
                showResponse('Error: ' + error.message);
            }
        }

        function showResponse(text) {
            document.getElementById('response').textContent = text;
        }

        // Check server status on load
        checkServer();

        // Auto-refresh status every 10 seconds
        setInterval(checkServer, 10000);
    </script>
</body>
</html>"""

        html_path = os.path.join(frontend_dir, "index.html")
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"\n{Colors.OKGREEN}✓ Dashboard created at: {html_path}{Colors.ENDC}")

        # Open the newly created dashboard
        try:
            webbrowser.open(f"file:///{html_path}")
            print(f"{Colors.OKGREEN}✓ Browser opened{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.FAIL}✗ Failed to open browser: {str(e)}{Colors.ENDC}")

    def build_firmware(self):
        """Build ESP32 firmware using PlatformIO"""
        print(f"\n{Colors.HEADER}Building ESP32 Firmware...{Colors.ENDC}")
        pio_path = os.path.expandvars(r"%USERPROFILE%\.platformio\penv\Scripts\platformio.exe")
        if os.name == 'nt':
            self.run_command(f'"{pio_path}" run', cwd=self.firmware_path, new_terminal=True)
        else:
            self.run_command("platformio run", cwd=self.firmware_path, new_terminal=True)

    def upload_firmware(self):
        """Upload firmware to ESP32"""
        print(f"\n{Colors.HEADER}Uploading Firmware to ESP32...{Colors.ENDC}")
        pio_path = os.path.expandvars(r"%USERPROFILE%\.platformio\penv\Scripts\platformio.exe")
        if os.name == 'nt':
            self.run_command(f'"{pio_path}" run --target upload', cwd=self.firmware_path, new_terminal=True)
        else:
            self.run_command("platformio run --target upload", cwd=self.firmware_path, new_terminal=True)

    def monitor_serial(self):
        """Monitor ESP32 serial port"""
        print(f"\n{Colors.HEADER}Monitoring ESP32 Serial Port...{Colors.ENDC}")
        print(f"{Colors.WARNING}Press Ctrl+C in the terminal window to stop monitoring{Colors.ENDC}\n")
        pio_path = os.path.expandvars(r"%USERPROFILE%\.platformio\penv\Scripts\platformio.exe")
        if os.name == 'nt':
            self.run_command(f'"{pio_path}" device monitor', cwd=self.firmware_path, new_terminal=True)
        else:
            self.run_command("platformio device monitor", cwd=self.firmware_path, new_terminal=True)

    def build_upload_monitor(self):
        """Complete firmware workflow: build, upload, and monitor"""
        print(f"\n{Colors.HEADER}Complete ESP32 Workflow (Build → Upload → Monitor)...{Colors.ENDC}")
        print(f"{Colors.WARNING}Each step will open in a separate terminal window{Colors.ENDC}\n")

        print(f"{Colors.OKCYAN}Step 1/3: Building firmware...{Colors.ENDC}")
        self.build_firmware()
        time.sleep(2)

        print(f"{Colors.OKCYAN}Step 2/3: Uploading firmware...{Colors.ENDC}")
        self.upload_firmware()
        time.sleep(2)

        print(f"{Colors.OKCYAN}Step 3/3: Starting monitor...{Colors.ENDC}")
        self.monitor_serial()

    def run_simulator(self):
        """Run the Python simulator"""
        print(f"\n{Colors.HEADER}Starting Simulator...{Colors.ENDC}")
        animal_id = input(f"{Colors.OKCYAN}Enter Animal ID (default: GB-sim-0001): {Colors.ENDC}") or "GB-sim-0001"
        self.run_command(f"python simulate.py --animalId {animal_id}", cwd=self.simulator_path, new_terminal=True)

    def test_api(self):
        """Test API endpoints"""
        print(f"\n{Colors.HEADER}Testing API Endpoints...{Colors.ENDC}")
        choice = input(f"{Colors.OKCYAN}Choose test:\n1. Quick test\n2. All APIs test\n3. Breach test\nEnter choice: {Colors.ENDC}")

        if choice == "1":
            self.run_command("npx ts-node tests/quick-sms-test.ts", cwd=self.server_path, new_terminal=True)
        elif choice == "2":
            self.run_command("npx ts-node tests/test-all-apis-fixed.ts", cwd=self.server_path, new_terminal=True)
        elif choice == "3":
            self.run_command("npx ts-node tests/sms-breach-test.ts", cwd=self.server_path, new_terminal=True)
        else:
            print(f"{Colors.FAIL}Invalid choice{Colors.ENDC}")

    def test_sms(self):
        """Test SMS/Twilio connection"""
        print(f"\n{Colors.HEADER}Testing SMS/Twilio Connection...{Colors.ENDC}")
        self.run_command("npx ts-node tests/check-twilio-numbers.ts", cwd=self.server_path, new_terminal=True)

    def test_all(self):
        """Run all tests"""
        print(f"\n{Colors.HEADER}Running All Component Tests...{Colors.ENDC}")
        print(f"{Colors.WARNING}Each test will open in a separate terminal window{Colors.ENDC}\n")

        # Test server build
        print(f"\n{Colors.OKCYAN}1/3 Testing Server Build...{Colors.ENDC}")
        self.build_server()
        time.sleep(1)

        # Test firmware build
        print(f"\n{Colors.OKCYAN}2/3 Testing Firmware Build...{Colors.ENDC}")
        self.build_firmware()
        time.sleep(1)

        # Test SMS
        print(f"\n{Colors.OKCYAN}3/3 Testing SMS Connection...{Colors.ENDC}")
        self.test_sms()

    def check_status(self):
        """Check system status"""
        print(f"\n{Colors.BOLD}{Colors.HEADER}═══════════════════════════════════════════════════════════{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.HEADER}              🏥 SYSTEM HEALTH CHECK                        {Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.HEADER}═══════════════════════════════════════════════════════════{Colors.ENDC}\n")

        status_items = []

        # Check Node.js
        print(f"{Colors.CYAN}🔍 Checking Node.js...{Colors.ENDC}")
        result = subprocess.run("node --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"{Colors.OKGREEN}  ✓ Node.js: {result.stdout.strip()}{Colors.ENDC}")
            status_items.append(("Node.js", True, result.stdout.strip()))
        else:
            print(f"{Colors.FAIL}  ✗ Node.js not found{Colors.ENDC}")
            status_items.append(("Node.js", False, "Not found"))

        # Check npm
        print(f"\n{Colors.CYAN}🔍 Checking npm...{Colors.ENDC}")
        result = subprocess.run("npm --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"{Colors.OKGREEN}  ✓ npm: {result.stdout.strip()}{Colors.ENDC}")
            status_items.append(("npm", True, result.stdout.strip()))
        else:
            print(f"{Colors.FAIL}  ✗ npm not found{Colors.ENDC}")
            status_items.append(("npm", False, "Not found"))

        # Check Python
        print(f"\n{Colors.CYAN}🔍 Checking Python...{Colors.ENDC}")
        result = subprocess.run("python --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"{Colors.OKGREEN}  ✓ Python: {result.stdout.strip()}{Colors.ENDC}")
            status_items.append(("Python", True, result.stdout.strip()))
        else:
            print(f"{Colors.FAIL}  ✗ Python not found{Colors.ENDC}")
            status_items.append(("Python", False, "Not found"))

        # Check PlatformIO
        print(f"\n{Colors.CYAN}🔍 Checking PlatformIO...{Colors.ENDC}")
        pio_path = os.path.expandvars(r"%USERPROFILE%\.platformio\penv\Scripts\platformio.exe")
        if os.path.exists(pio_path) or subprocess.run("platformio --version", shell=True, capture_output=True).returncode == 0:
            result = subprocess.run(f'"{pio_path}" --version' if os.name == 'nt' else "platformio --version",
                                  shell=True, capture_output=True, text=True)
            print(f"{Colors.OKGREEN}  ✓ PlatformIO: {result.stdout.strip()}{Colors.ENDC}")
            status_items.append(("PlatformIO", True, result.stdout.strip()))
        else:
            print(f"{Colors.FAIL}  ✗ PlatformIO not found{Colors.ENDC}")
            status_items.append(("PlatformIO", False, "Not found"))

        # Check MongoDB
        print(f"\n{Colors.CYAN}🔍 Checking MongoDB...{Colors.ENDC}")
        try:
            result = subprocess.run("mongosh --version", shell=True,
                                  capture_output=True, text=True, timeout=3)
            if result.returncode == 0:
                version = result.stdout.strip().split('\n')[0]
                print(f"{Colors.OKGREEN}  ✓ MongoDB Shell: {version}{Colors.ENDC}")
                status_items.append(("MongoDB", True, version))
            else:
                print(f"{Colors.WARNING}  ⚠ MongoDB Shell not found{Colors.ENDC}")
                status_items.append(("MongoDB", False, "Not installed"))
        except Exception:
            print(f"{Colors.WARNING}  ⚠ MongoDB Shell not found{Colors.ENDC}")
            status_items.append(("MongoDB", False, "Not installed"))

        # Check server dependencies
        print(f"\n{Colors.CYAN}🔍 Checking Server Dependencies...{Colors.ENDC}")
        if os.path.exists(os.path.join(self.server_path, "node_modules")):
            print(f"{Colors.OKGREEN}  ✓ Server dependencies installed{Colors.ENDC}")
            status_items.append(("Server Deps", True, "Installed"))
        else:
            print(f"{Colors.WARNING}  ⚠ Server dependencies not found (run option 3){Colors.ENDC}")
            status_items.append(("Server Deps", False, "Not installed"))

        # Check if server is built
        print(f"\n{Colors.CYAN}🔍 Checking Server Build...{Colors.ENDC}")
        if os.path.exists(os.path.join(self.server_path, "dist")):
            print(f"{Colors.OKGREEN}  ✓ Server is built{Colors.ENDC}")
            status_items.append(("Server Build", True, "Built"))
        else:
            print(f"{Colors.WARNING}  ⚠ Server not built (run option 4){Colors.ENDC}")
            status_items.append(("Server Build", False, "Not built"))

        # Check if backend server is running
        print(f"\n{Colors.CYAN}🔍 Checking Backend Server...{Colors.ENDC}")
        result = subprocess.run("netstat -ano | findstr :3000", shell=True,
                              capture_output=True, text=True)
        if "LISTENING" in result.stdout:
            print(f"{Colors.OKGREEN}  ✓ Backend server is running on port 3000{Colors.ENDC}")
            status_items.append(("Backend", True, "Running"))
        else:
            print(f"{Colors.WARNING}  ⚠ Backend server not running{Colors.ENDC}")
            status_items.append(("Backend", False, "Not running"))

        # Summary
        passed = sum(1 for _, status, _ in status_items if status)
        total = len(status_items)

        print(f"\n{Colors.BOLD}{Colors.HEADER}═══════════════════════════════════════════════════════════{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.CYAN}📊 SUMMARY: {passed}/{total} components operational{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.HEADER}═══════════════════════════════════════════════════════════{Colors.ENDC}\n")

        if passed == total:
            print(f"{Colors.BOLD}{Colors.OKGREEN}🎉 All systems operational!{Colors.ENDC}\n")
        elif passed >= total * 0.7:
            print(f"{Colors.BOLD}{Colors.WARNING}⚠️  Some components need attention{Colors.ENDC}\n")
        else:
            print(f"{Colors.BOLD}{Colors.FAIL}❌ Multiple issues detected. Please review above.{Colors.ENDC}\n")

    def view_com_ports(self):
        """View available COM ports"""
        print(f"\n{Colors.HEADER}Available COM Ports{Colors.ENDC}\n")
        pio_path = os.path.expandvars(r"%USERPROFILE%\.platformio\penv\Scripts\platformio.exe")
        if os.name == 'nt':
            self.run_command(f'"{pio_path}" device list', cwd=self.firmware_path, new_terminal=True)
        else:
            self.run_command("platformio device list", cwd=self.firmware_path, new_terminal=True)

    def clean_build(self):
        """Clean build files"""
        print(f"\n{Colors.HEADER}Cleaning Build Files...{Colors.ENDC}")
        print(f"{Colors.WARNING}Cleanup operations will run in separate terminals{Colors.ENDC}\n")

        # Clean server build
        print(f"\n{Colors.OKCYAN}Cleaning server build...{Colors.ENDC}")
        if os.path.exists(os.path.join(self.server_path, "dist")):
            if os.name == 'nt':
                self.run_command("rmdir /s /q dist", cwd=self.server_path, new_terminal=True)
            else:
                self.run_command("rm -rf dist", cwd=self.server_path, new_terminal=True)

        time.sleep(1)

        # Clean PlatformIO build
        print(f"\n{Colors.OKCYAN}Cleaning firmware build...{Colors.ENDC}")
        pio_path = os.path.expandvars(r"%USERPROFILE%\.platformio\penv\Scripts\platformio.exe")
        if os.name == 'nt':
            self.run_command(f'"{pio_path}" run --target clean', cwd=self.firmware_path, new_terminal=True)
        else:
            self.run_command("platformio run --target clean", cwd=self.firmware_path, new_terminal=True)

        print(f"\n{Colors.OKGREEN}✓ Cleanup commands initiated{Colors.ENDC}")

    def show_structure(self):
        """Show project structure"""
        print(f"\n{Colors.HEADER}VanRakshak Project Structure{Colors.ENDC}\n")
        structure = """
📦 VanRakshak/
├── 📁 docs/              # Documentation
├── 📁 firmware/
│   └── 📁 esp32/         # ESP32 firmware (PlatformIO)
├── 📁 server/            # Node.js + TypeScript backend
│   ├── 📁 src/           # Source files
│   └── 📁 tests/         # API tests
├── 📁 simulator/         # Python simulator
└── 📄 menu.py            # This menu program
        """
        print(structure)

    def view_quick_start(self):
        """View quick start guide"""
        quick_start = os.path.join(self.project_root, "QUICK_START.md")
        if os.path.exists(quick_start):
            with open(quick_start, 'r', encoding='utf-8') as f:
                print(f"\n{Colors.HEADER}Quick Start Guide{Colors.ENDC}\n")
                print(f.read())
        else:
            print(f"{Colors.FAIL}Quick start guide not found{Colors.ENDC}")

    def view_readme(self):
        """View README"""
        readme = os.path.join(self.project_root, "README.md")
        if os.path.exists(readme):
            with open(readme, 'r', encoding='utf-8') as f:
                print(f"\n{Colors.HEADER}README{Colors.ENDC}\n")
                print(f.read())
        else:
            print(f"{Colors.FAIL}README not found{Colors.ENDC}")

    def run(self):
        """Main menu loop"""
        while True:
            self.print_menu()
            choice = input(f"{Colors.BOLD}{Colors.CYAN}➜ Enter your choice (0-21): {Colors.ENDC}").strip()

            if choice == "0":
                print(f"\n{Colors.BOLD}{Colors.OKGREEN}╔════════════════════════════════════════╗{Colors.ENDC}")
                print(f"{Colors.BOLD}{Colors.OKGREEN}║  Thank you for using VanRakshak! 👋   ║{Colors.ENDC}")
                print(f"{Colors.BOLD}{Colors.OKGREEN}╚════════════════════════════════════════╝{Colors.ENDC}\n")
                sys.exit(0)
            elif choice == "1":
                self.start_server_dev()
            elif choice == "2":
                self.start_server_prod()
            elif choice == "3":
                self.install_server_deps()
            elif choice == "4":
                self.build_server()
            elif choice == "5":
                self.open_backend()
            elif choice == "6":
                self.start_mongodb()
            elif choice == "7":
                self.check_mongodb_status()
            elif choice == "8":
                self.install_mongodb_deps()
            elif choice == "9":
                self.open_frontend()
            elif choice == "10":
                self.build_firmware()
            elif choice == "11":
                self.upload_firmware()
            elif choice == "12":
                self.monitor_serial()
            elif choice == "13":
                self.build_upload_monitor()
            elif choice == "14":
                self.run_simulator()
            elif choice == "15":
                self.test_api()
            elif choice == "16":
                self.test_sms()
            elif choice == "17":
                self.test_all()
            elif choice == "18":
                self.check_status()
            elif choice == "19":
                self.view_com_ports()
            elif choice == "20":
                self.clean_build()
            elif choice == "21":
                self.show_structure()
            else:
                print(f"\n{Colors.FAIL}❌ Invalid choice. Please try again.{Colors.ENDC}")

            input(f"\n{Colors.BOLD}{Colors.YELLOW}⏸  Press Enter to continue...{Colors.ENDC}")

if __name__ == "__main__":
    try:
        menu = VanRakshakMenu()
        menu.run()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Program interrupted by user{Colors.ENDC}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.FAIL}Unexpected error: {str(e)}{Colors.ENDC}")
        sys.exit(1)
