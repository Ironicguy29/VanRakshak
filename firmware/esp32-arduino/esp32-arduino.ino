/*
 * The Guardian Band - ESP32 Wildlife Tracker
 * Arduino IDE Compatible Version
 * 
 * Hardware: ESP32 DevKit C
 * Cellular: SIM800L (2G/GSM)
 * GPS: NEO-6M
 * Temperature: DS18B20
 * Accelerometer: GY-61 (ADXL335)
 * 
 * Network: Airtel India
 * Server: Local PC at 192.168.0.177:3000
 */

#include <Arduino.h>

// Connectivity
#include <TinyGsmClient.h>
#include <TinyGPSPlus.h>

// Sensors
#include <OneWire.h>
#include <DallasTemperature.h>

// =============================================================================
// CONFIGURATION
// =============================================================================

// GPIO PIN ASSIGNMENTS
#define MODEM_RX_PIN 26         // ESP32 RX ← SIM800L TX
#define MODEM_TX_PIN 27         // ESP32 TX → SIM800L RX
#define GPS_RX_PIN 16           // ESP32 RX ← NEO-6M TX
#define GPS_TX_PIN 17           // ESP32 TX → NEO-6M RX
#define TEMP_ONEWIRE_PIN 4      // DS18B20 Data pin with 4.7kΩ pull-up
#define ACCEL_X_PIN 34          // GY-61 X-axis (ADC1_CH6)
#define ACCEL_Y_PIN 35          // GY-61 Y-axis (ADC1_CH7)  
#define ACCEL_Z_PIN 32          // GY-61 Z-axis (ADC1_CH4)

// CELLULAR NETWORK CONFIGURATION (Airtel India)
#define APN "airtelgprs.com"    // Also try "www" if this doesn't work
#define APN_USER ""
#define APN_PASS ""

// SERVER CONFIGURATION
#define SERVER_HOST "192.168.0.177"  // Your local PC IP address
#define SERVER_PORT 3000
#define SERVER_PATH "/api/v1/ingest"

// DEVICE IDENTIFICATION
#define DEVICE_ID "GB-esp32-0001"

// TIMING CONFIGURATION
#define UPLOAD_INTERVAL_MS 15000   // 15 seconds for testing
#define GPS_TIMEOUT_MS 30000
#define MODEM_TIMEOUT_MS 10000

// SENSOR CONFIGURATION
#define ACCEL_RANGE_G 3
#define ADC_RESOLUTION 4096        // 12-bit ADC
#define ACCEL_ZERO_G_OFFSET 1650   // 0g offset (ADC counts)
#define ACCEL_SENSITIVITY 330      // mV/g for ADXL335

// =============================================================================
// HARDWARE SETUP
// =============================================================================

// UARTs
HardwareSerial SerialAT(1); // SIM800L
HardwareSerial SerialGPS(2); // NEO-6M

// TinyGSM Modem
#define TINY_GSM_MODEM_SIM800
TinyGsm modem(SerialAT);
TinyGsmClient client(modem);

// GPS
TinyGPSPlus gps;

// DS18B20 Temperature Sensor
OneWire oneWire(TEMP_ONEWIRE_PIN);
DallasTemperature tempSensor(&oneWire);

// Accelerometer Data Structure
struct AccelData {
  float x, y, z;
};

// Timing
unsigned long lastSend = 0;

// =============================================================================
// SETUP FUNCTIONS
// =============================================================================

void setupModem() {
  Serial.println("[MODEM] Initializing SIM800L...");
  SerialAT.begin(9600, SERIAL_8N1, MODEM_RX_PIN, MODEM_TX_PIN);
  delay(3000); // SIM800L needs time to start
  
  Serial.println("[MODEM] Restarting modem...");
  if (!modem.restart()) {
    Serial.println("[MODEM] Restart failed, continuing anyway...");
  }
  
  delay(1000);
  
  Serial.println("[MODEM] Connecting to cellular network...");
  Serial.print("[MODEM] APN: ");
  Serial.println(APN);
  
  if (modem.gprsConnect(APN, APN_USER, APN_PASS)) {
    Serial.println("[MODEM] ✓ Connected to cellular network!");
  } else {
    Serial.println("[MODEM] ✗ Failed to connect. Check SIM card and APN settings.");
  }
}

void setupGPS() {
  Serial.println("[GPS] Initializing NEO-6M...");
  SerialGPS.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("[GPS] ✓ GPS module initialized");
  Serial.println("[GPS] Waiting for GPS fix (may take 1-5 minutes)...");
}

void setupSensors() {
  Serial.println("[SENSORS] Initializing...");
  
  // Temperature sensor
  tempSensor.begin();
  Serial.println("[SENSORS] ✓ DS18B20 temperature sensor ready");
  
  // Accelerometer (analog)
  analogReadResolution(12); // 12-bit ADC resolution
  Serial.println("[SENSORS] ✓ GY-61 (ADXL335) accelerometer ready");
}

// =============================================================================
// SENSOR READING FUNCTIONS
// =============================================================================

AccelData readAccelerometer() {
  AccelData accel;
  
  // Read raw ADC values
  int rawX = analogRead(ACCEL_X_PIN);
  int rawY = analogRead(ACCEL_Y_PIN);
  int rawZ = analogRead(ACCEL_Z_PIN);
  
  // Convert to g-force (3.3V supply, 330mV/g sensitivity)
  accel.x = ((rawX - ACCEL_ZERO_G_OFFSET) * 3.3 / ADC_RESOLUTION) / 0.33;
  accel.y = ((rawY - ACCEL_ZERO_G_OFFSET) * 3.3 / ADC_RESOLUTION) / 0.33;
  accel.z = ((rawZ - ACCEL_ZERO_G_OFFSET) * 3.3 / ADC_RESOLUTION) / 0.33;
  
  return accel;
}

// =============================================================================
// COMMUNICATION FUNCTIONS
// =============================================================================

void sendTelemetry(float lat, float lon, float tempC, AccelData &accel) {
  Serial.println("[HTTP] Preparing to send data...");
  
  // Check GPRS connection
  if (!modem.isGprsConnected()) {
    Serial.println("[HTTP] GPRS disconnected, reconnecting...");
    modem.gprsConnect(APN, APN_USER, APN_PASS);
    delay(2000);
  }
  
  // Connect to server
  Serial.print("[HTTP] Connecting to ");
  Serial.print(SERVER_HOST);
  Serial.print(":");
  Serial.println(SERVER_PORT);
  
  if (client.connect(SERVER_HOST, SERVER_PORT)) {
    Serial.println("[HTTP] ✓ Connected to server");
    
    // Build JSON payload
    String payload = String("{\"deviceId\":\"") + DEVICE_ID + "\"," +
      "\"location\":{\"lat\":" + String(lat, 6) + ",\"lon\":" + String(lon, 6) + "}," +
      "\"vitals\":{\"tempC\":" + String(tempC, 2) + "}," +
      "\"motion\":{\"ax\":" + String(accel.x, 3) + ",\"ay\":" + String(accel.y, 3) + ",\"az\":" + String(accel.z, 3) + "}}";

    // Build HTTP request
    String req = String("POST ") + SERVER_PATH + " HTTP/1.1\r\n" +
                 "Host: " + SERVER_HOST + "\r\n" +
                 "Content-Type: application/json\r\n" +
                 "Connection: close\r\n" +
                 "Content-Length: " + payload.length() + "\r\n\r\n" +
                 payload;
    
    // Send request
    client.print(req);
    Serial.print("[HTTP] Sent: ");
    Serial.println(payload);
    
    // Wait for response
    unsigned long start = millis();
    while (client.connected() && millis() - start < 5000) {
      while (client.available()) {
        char c = client.read();
        Serial.print(c);
      }
    }
    Serial.println();
    
    client.stop();
    Serial.println("[HTTP] ✓ Request complete");
  } else {
    Serial.println("[HTTP] ✗ Connection failed!");
    Serial.println("[HTTP] Check server IP and network connectivity");
  }
}

// =============================================================================
// MAIN PROGRAM
// =============================================================================

void setup() {
  // Initialize serial for debugging
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n\n=====================================");
  Serial.println("   Guardian Band - Wildlife Tracker");
  Serial.println("=====================================");
  Serial.print("Device ID: ");
  Serial.println(DEVICE_ID);
  Serial.print("Server: ");
  Serial.print(SERVER_HOST);
  Serial.print(":");
  Serial.println(SERVER_PORT);
  Serial.println("=====================================\n");
  
  // Initialize hardware
  setupModem();
  setupGPS();
  setupSensors();
  
  Serial.println("\n[SYSTEM] ✓ All systems initialized!");
  Serial.println("[SYSTEM] Starting main loop...\n");
}

void loop() {
  // Process GPS data
  while (SerialGPS.available()) {
    gps.encode(SerialGPS.read());
  }

  // Read temperature
  tempSensor.requestTemperatures();
  float tempC = tempSensor.getTempCByIndex(0);

  // Read accelerometer
  AccelData accel = readAccelerometer();

  // Check if it's time to send data
  if (gps.location.isValid() && millis() - lastSend > UPLOAD_INTERVAL_MS) {
    // Display readings
    Serial.println("─────────────────────────────────────");
    Serial.print("[DATA] GPS: ");
    Serial.print(gps.location.lat(), 6);
    Serial.print(", ");
    Serial.println(gps.location.lng(), 6);
    
    Serial.print("[DATA] Temperature: ");
    Serial.print(tempC);
    Serial.println(" °C");
    
    Serial.print("[DATA] Accelerometer: X:");
    Serial.print(accel.x, 3);
    Serial.print(" Y:");
    Serial.print(accel.y, 3);
    Serial.print(" Z:");
    Serial.println(accel.z, 3);
    Serial.println("─────────────────────────────────────");
    
    // Send to server
    sendTelemetry(gps.location.lat(), gps.location.lng(), tempC, accel);
    lastSend = millis();
    Serial.println();
  } else if (!gps.location.isValid()) {
    // GPS status update every 5 seconds
    static unsigned long lastGpsStatus = 0;
    if (millis() - lastGpsStatus > 5000) {
      Serial.print("[GPS] Waiting for fix... Satellites: ");
      Serial.println(gps.satellites.value());
      lastGpsStatus = millis();
    }
  }

  delay(100);
}
