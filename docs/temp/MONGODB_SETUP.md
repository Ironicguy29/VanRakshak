# 🗄️ MongoDB Integration Guide for VanRakshak

## Overview
VanRakshak now supports MongoDB for persistent data storage, enabling you to:
- Store animal location history
- Track vital signs over time
- Maintain geofence configurations
- Log breach events
- Store alert history

## 🚀 Quick Setup

### Step 1: Install MongoDB

#### Windows
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run installer (default options recommended)
3. MongoDB should auto-start as a Windows Service

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Step 2: Install MongoDB Shell (mongosh)
```bash
# Windows (via installer or chocolatey)
choco install mongodb-shell

# Ubuntu/Debian
sudo apt install -y mongodb-mongosh

# macOS
brew install mongosh
```

### Step 3: Verify Installation
```bash
mongosh --version
```

## 🎯 Using MongoDB with VanRakshak Menu

### Option 6: Start MongoDB Server
```
➜ Enter your choice: 6
```
This will:
- Detect your MongoDB installation
- Create a local data directory at `VanRakshak/mongodb_data/`
- Start MongoDB server in a new terminal
- Listen on default port `27017`

**Note:** Keep the MongoDB terminal open while using the application.

### Option 7: Check MongoDB Status
```
➜ Enter your choice: 7
```
This verifies:
- ✅ MongoDB Shell installation
- ✅ Connection to localhost:27017
- ✅ Server responsiveness
- ℹ️ Version information

### Option 8: Install MongoDB Dependencies
```
➜ Enter your choice: 8
```
Installs Node.js packages:
- `mongodb` - Official MongoDB driver
- `mongoose` - ODM (Object Data Modeling) library

## 📊 Database Schema (Recommended)

### Collections

#### 1. `animals`
```javascript
{
  _id: ObjectId,
  animalId: "GB-001",
  name: "Raja",
  species: "Elephant",
  age: 15,
  guardianPhone: "+919876543210",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### 2. `locations`
```javascript
{
  _id: ObjectId,
  animalId: "GB-001",
  latitude: 28.6139,
  longitude: 77.2090,
  timestamp: ISODate,
  accuracy: 10.5,
  altitude: 215.3,
  speed: 2.5
}
```

#### 3. `vitals`
```javascript
{
  _id: ObjectId,
  animalId: "GB-001",
  heartRate: 75,
  temperature: 38.5,
  timestamp: ISODate,
  battery: 85,
  signalStrength: -67
}
```

#### 4. `geofences`
```javascript
{
  _id: ObjectId,
  animalId: "GB-001",
  name: "Safe Zone 1",
  centerLat: 28.6139,
  centerLng: 77.2090,
  radiusMeters: 500,
  active: true,
  createdAt: ISODate
}
```

#### 5. `breaches`
```javascript
{
  _id: ObjectId,
  animalId: "GB-001",
  geofenceId: ObjectId,
  latitude: 28.6200,
  longitude: 77.2150,
  distance: 523.7,
  timestamp: ISODate,
  alertSent: true,
  guardianNotified: true
}
```

## 🔧 Server Integration Example

### Install Dependencies
```bash
cd server
npm install mongodb mongoose
```

### Create Database Connection (`server/src/database.ts`)
```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vanrakshak';

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Schemas
const locationSchema = new mongoose.Schema({
  animalId: { type: String, required: true, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  accuracy: Number,
  altitude: Number,
  speed: Number
});

const vitalSchema = new mongoose.Schema({
  animalId: { type: String, required: true, index: true },
  heartRate: { type: Number, required: true },
  temperature: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  battery: Number,
  signalStrength: Number
});

export const Location = mongoose.model('Location', locationSchema);
export const Vital = mongoose.model('Vital', vitalSchema);
```

### Update Server Index (`server/src/index.ts`)
```typescript
import express from 'express';
import { connectDatabase, Location, Vital } from './database.js';

const app = express();
app.use(express.json());

// Connect to database
await connectDatabase();

// POST /location - Save location to database
app.post('/location', async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    
    // ... existing geofence logic ...
    
    res.json({ 
      ok: true, 
      message: 'Location saved',
      id: location._id 
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// POST /vitals - Save vitals to database
app.post('/vitals', async (req, res) => {
  try {
    const vital = new Vital(req.body);
    await vital.save();
    
    res.json({ 
      ok: true, 
      message: 'Vitals saved',
      id: vital._id 
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// GET /history/:animalId - Get location history
app.get('/history/:animalId', async (req, res) => {
  try {
    const locations = await Location
      .find({ animalId: req.params.animalId })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({ ok: true, locations });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// GET /vitals/:animalId - Get vitals history
app.get('/vitals/:animalId', async (req, res) => {
  try {
    const vitals = await Vital
      .find({ animalId: req.params.animalId })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({ ok: true, vitals });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
```

### Environment Configuration (`.env`)
```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vanrakshak

# Optional: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vanrakshak?retryWrites=true&w=majority

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
GUARDIAN_PHONE_NUMBER=+919876543210
```

## 🌐 MongoDB Atlas (Cloud Alternative)

### Why Use Atlas?
- No local MongoDB installation needed
- Free tier available (512MB storage)
- Automatic backups
- Global deployment
- Web-based dashboard

### Setup Steps
1. Visit https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string
6. Update `.env` with connection string

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/vanrakshak?retryWrites=true&w=majority
```

## 📊 MongoDB Compass (GUI Tool)

### Install Compass
- Download: https://www.mongodb.com/try/download/compass
- GUI for viewing/managing data
- Query builder
- Performance metrics

### Connect to Local MongoDB
```
Connection String: mongodb://localhost:27017
```

## 🔍 Useful Commands

### MongoDB Shell (mongosh)
```javascript
// Connect
mongosh

// Show databases
show dbs

// Use VanRakshak database
use vanrakshak

// Show collections
show collections

// Find all locations
db.locations.find()

// Find by animal ID
db.locations.find({ animalId: "GB-001" })

// Count documents
db.locations.countDocuments()

// Latest location
db.locations.find().sort({ timestamp: -1 }).limit(1)

// Vitals in last hour
db.vitals.find({ 
  timestamp: { $gte: new Date(Date.now() - 3600000) }
})

// Create index
db.locations.createIndex({ animalId: 1, timestamp: -1 })

// Drop collection
db.locations.drop()
```

## 🎯 Testing with Simulator

Update simulator to verify data storage:
```python
# simulator/simulate.py
import requests
import time

def test_database_storage():
    # Send location
    response = requests.post('http://localhost:3000/location', json={
        'animalId': 'GB-sim-001',
        'latitude': 28.6139,
        'longitude': 77.2090
    })
    print(f"Location saved: {response.json()}")
    
    # Get history
    response = requests.get('http://localhost:3000/history/GB-sim-001')
    print(f"History: {response.json()}")
```

## 🚨 Troubleshooting

### MongoDB Won't Start
**Error:** "Address already in use"
```bash
# Check if MongoDB is already running
netstat -ano | findstr :27017

# Kill process if needed
taskkill /F /PID <pid>
```

**Error:** "Data directory not found"
```bash
# Create manually
mkdir mongodb_data

# Or let menu.py create it automatically (Option 6)
```

### Connection Refused
1. Verify MongoDB is running: `mongosh --eval "db.adminCommand({ ping: 1 })"`
2. Check firewall settings
3. Verify port 27017 is accessible
4. Check MongoDB logs in data directory

### Mongoose Connection Error
```typescript
// Add better error handling
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});
```

## 📈 Performance Tips

1. **Create Indexes**
   ```javascript
   db.locations.createIndex({ animalId: 1, timestamp: -1 })
   db.vitals.createIndex({ animalId: 1, timestamp: -1 })
   ```

2. **Limit Query Results**
   ```javascript
   .limit(100)  // Don't fetch unlimited data
   ```

3. **Use Projections**
   ```javascript
   .find({}, { latitude: 1, longitude: 1 })  // Only fetch needed fields
   ```

4. **Regular Cleanup**
   ```javascript
   // Delete old data (>30 days)
   db.locations.deleteMany({ 
     timestamp: { $lt: new Date(Date.now() - 30*24*3600000) }
   })
   ```

## 🎓 Learning Resources

- MongoDB University (Free): https://university.mongodb.com/
- Mongoose Docs: https://mongoosejs.com/docs/guide.html
- MongoDB Manual: https://docs.mongodb.com/manual/

---

**Next Steps:**
1. ✅ Install MongoDB (Option 6)
2. ✅ Check status (Option 7)  
3. ✅ Install dependencies (Option 8)
4. ✅ Update server code
5. ✅ Test with simulator
6. ✅ View data in Compass

**Happy Coding! 🐾**
