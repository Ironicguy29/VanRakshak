# 🐾 VanRakshak Menu System Guide

## Overview
The enhanced `menu.py` provides a unified, beautiful CLI interface to manage all VanRakshak project components.

## 🎨 New Features

### Enhanced UI/UX
- **Beautiful Box-Drawing Borders**: Unicode characters for clean sectioned menus
- **Color-Coded Sections**: Each category has distinct colors and backgrounds
- **Real-Time Status**: Shows current time and project root
- **Visual Feedback**: Enhanced icons and progress indicators
- **Improved Navigation**: Clear numbering (0-23) with categorized options

### 🗄️ MongoDB Integration (NEW!)

#### Option 6: Start MongoDB Server (Local)
- Automatically detects MongoDB installation on Windows/Linux/Mac
- Creates local data directory at `mongodb_data/` in project root
- Starts MongoDB in a new terminal window
- Supports multiple MongoDB versions (4.4, 5.0, 6.0, 7.0)

**Common Paths Checked:**
- Windows: `C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe`
- Linux: `/usr/bin/mongod`, `/usr/local/bin/mongod`
- macOS: `/usr/local/bin/mongod`

#### Option 7: Check MongoDB Status
- Verifies MongoDB shell (mongosh) installation
- Tests connection to `localhost:27017`
- Shows version information
- Displays connection status with colored feedback

#### Option 8: Install MongoDB Dependencies
- Installs `mongodb` and `mongoose` packages for Node.js server
- Runs in separate terminal for clean output
- Prepares server for database operations

### 📊 Enhanced System Health Check (Option 18)

The system health check now includes:
- ✅ Node.js version check
- ✅ npm version check
- ✅ Python version check
- ✅ PlatformIO installation
- ✅ MongoDB Shell detection
- ✅ Server dependencies verification
- ✅ Server build status
- ✅ **Backend server running status** (checks port 3000)

**Visual Summary:**
- Shows X/Y components operational
- Color-coded results:
  - 🎉 Green: All systems go!
  - ⚠️  Yellow: Some attention needed
  - ❌ Red: Multiple issues detected

## 🚀 Quick Start

### Launch the Menu
```bash
python menu.py
```

### First Time Setup Flow
1. **Install Server Dependencies** (Option 3)
2. **Build Server** (Option 4)
3. **Install MongoDB Dependencies** (Option 8) - if using database
4. **Start MongoDB** (Option 6) - if using database
5. **Start Backend Server** (Option 1)
6. **Run System Health Check** (Option 18)

## 📋 Menu Categories

### 🚀 Server Management (Options 1-5)
- Development and production server control
- Dependency management
- Build system
- Quick browser access

### 🗄️ Database (Options 6-8)
- **NEW:** MongoDB server control
- Connection testing
- Dependency installation

### 🎨 Frontend (Option 9)
- Dashboard access
- Auto-create dashboard if missing

### 📡 ESP32 Firmware (Options 10-13)
- PlatformIO build system
- Upload to device
- Serial monitoring
- Complete workflow automation

### 🧪 Testing & Simulation (Options 14-17)
- Python simulator
- API endpoint testing
- SMS/Twilio integration tests
- Comprehensive test suite

### 🔧 Utilities (Options 18-21)
- Enhanced health check
- COM port detection
- Build cleanup
- Project structure viewer

### 📚 Documentation (Options 22-23)
- Quick start guide
- README viewer

## 🎨 Visual Enhancements

### Color Scheme
- **Cyan Borders**: Clean box drawing
- **Green Numbers**: Menu options
- **Blue Backgrounds**: Section headers
- **Magenta/Yellow**: Status information
- **Green Checkmarks**: Success states
- **Yellow Warnings**: Attention needed
- **Red X-marks**: Errors/failures

### Icons Used
- 🚀 Server operations
- 🗄️ Database
- 🎨 Frontend
- 📡 Firmware
- 🧪 Testing
- 🔧 Tools
- 📚 Docs
- 🟢 Active/Running
- 🔵 Production
- ✅ Success
- ⚠️  Warning
- ❌ Error
- 🏥 Health Check

## 💡 Tips

### Terminal Windows
Most operations open in **new terminal windows** to:
- Keep output clean and organized
- Allow multiple parallel tasks
- Prevent menu from being cluttered
- Enable easy task monitoring

### Background Processes
Long-running tasks (servers, monitors) run in background terminals:
- Backend server (Dev/Prod)
- MongoDB server
- ESP32 serial monitor
- Simulator

### Status Checking
Use **Option 18** frequently to:
- Verify all tools are installed
- Check if services are running
- Get version information
- Diagnose issues quickly

## 🔧 Troubleshooting

### MongoDB Not Found
If Option 6 fails:
1. Install MongoDB Community Edition
2. Add to PATH (usually automatic)
3. Verify with `mongosh --version`
4. Restart terminal/menu

### Backend Server Issues
If port 3000 in use:
- Menu automatically detects via health check
- Manually stop: `netstat -ano | findstr :3000`
- Kill process: `taskkill /F /PID <pid>`

### PlatformIO Issues
If firmware options fail:
1. Install PlatformIO Core
2. Or use PlatformIO IDE extension for VS Code
3. Verify: `platformio --version`

## 📦 Dependencies

### System Requirements
- Python 3.7+
- Node.js 14+
- npm 6+

### Optional (based on features)
- PlatformIO (for ESP32 firmware)
- MongoDB 4.4+ (for database features)
- Twilio account (for SMS testing)

## 🎯 Best Practices

1. **Always run health check first** (Option 18)
2. **Start MongoDB before backend** if using database
3. **Build before upload** for firmware
4. **Use new terminals** for better visibility
5. **Check status after installations**

## 🆘 Support

Issues? Check:
1. System health check results
2. Terminal output from operations
3. Project README and QUICK_START guides
4. Individual component documentation in `docs/`

---

**Version:** 2.0 - Enhanced UI/UX + MongoDB Support  
**Updated:** October 2025
