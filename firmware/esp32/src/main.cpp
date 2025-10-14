#include <Arduino.h>

// Connectivity
#include <TinyGsmClient.h>
#include <TinyGPSPlus.h>

// Sensors
#include <OneWire.h>
#include <DallasTemperature.h>

#include "config.h"

// UARTs
HardwareSerial SerialAT(1); // SIM800L
HardwareSerial SerialGPS(2); // NEO-6M

TinyGsm modem(SerialAT);
TinyGPSPlus gps;

// DS18B20
OneWire oneWire(TEMP_ONEWIRE_PIN);
DallasTemperature tempSensor(&oneWire);

// GY-61 accelerometer (analog readings)
struct AccelData {
  float x, y, z;
};

// Networking
TinyGsmClient client(modem);

unsigned long lastSend = 0;

void setupModem() {
  Serial.println("[MODEM] SIM800L Init");
  SerialAT.begin(9600, SERIAL_8N1, MODEM_RX_PIN, MODEM_TX_PIN);
  delay(1000); // SIM800L needs longer startup time
  if (!modem.restart()) {
    Serial.println("[MODEM] SIM800L restart failed, continuing");
  }
  modem.gprsConnect(APN, APN_USER, APN_PASS);
}

void setupGPS() {
  Serial.println("[GPS] Init");
  SerialGPS.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
}

void setupSensors() {
  tempSensor.begin();
  // Setup ADC for GY-61 accelerometer
  analogReadResolution(12); // 12-bit ADC resolution
  Serial.println("[ACCEL] GY-61 (ADXL335) initialized");
}

AccelData readAccelerometer() {
  AccelData accel;
  
  // Read raw ADC values
  int rawX = analogRead(ACCEL_X_PIN);
  int rawY = analogRead(ACCEL_Y_PIN);
  int rawZ = analogRead(ACCEL_Z_PIN);
  
  // Convert to g-force (assuming 3.3V supply and 330mV/g sensitivity)
  accel.x = ((rawX - ACCEL_ZERO_G_OFFSET) * 3.3 / ADC_RESOLUTION) / 0.33;
  accel.y = ((rawY - ACCEL_ZERO_G_OFFSET) * 3.3 / ADC_RESOLUTION) / 0.33;
  accel.z = ((rawZ - ACCEL_ZERO_G_OFFSET) * 3.3 / ADC_RESOLUTION) / 0.33;
  
  return accel;
}

void sendTelemetry(float lat, float lon, float tempC, AccelData &accel) {
  if (!modem.isGprsConnected()) {
    modem.gprsConnect(APN, APN_USER, APN_PASS);
  }
  if (client.connect(SERVER_HOST, SERVER_PORT)) {
    String payload = String("{\"deviceId\":\"") + DEVICE_ID + "\"," +
      "\"location\":{\"lat\":" + String(lat, 6) + ",\"lon\":" + String(lon, 6) + "}," +
      "\"vitals\":{\"tempC\":" + String(tempC, 2) + "}," +
      "\"motion\":{\"ax\":" + String(accel.x, 3) + ",\"ay\":" + String(accel.y, 3) + ",\"az\":" + String(accel.z, 3) + "}}";

    String req = String("POST ") + SERVER_PATH + " HTTP/1.1\r\n" +
                 "Host: " + SERVER_HOST + "\r\n" +
                 "Content-Type: application/json\r\n" +
                 "Connection: close\r\n" +
                 "Content-Length: " + payload.length() + "\r\n\r\n" +
                 payload;
    client.print(req);
    Serial.println("[HTTP] Sent: " + payload);
    unsigned long start = millis();
    while (client.connected() && millis() - start < 5000) {
      while (client.available()) {
        client.read();
      }
    }
    client.stop();
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  setupModem();
  setupGPS();
  setupSensors();
}

void loop() {
  // GPS reading
  while (SerialGPS.available()) {
    gps.encode(SerialGPS.read());
  }

  // Temperature
  tempSensor.requestTemperatures();
  float tempC = tempSensor.getTempCByIndex(0);

  // GY-61 Accelerometer
  AccelData accel = readAccelerometer();

  if (gps.location.isValid() && millis() - lastSend > UPLOAD_INTERVAL_MS) {
    Serial.print("[GPS] Lat: "); Serial.print(gps.location.lat(), 6);
    Serial.print(" Lon: "); Serial.print(gps.location.lng(), 6);
    Serial.print(" [TEMP] "); Serial.print(tempC); Serial.print("°C");
    Serial.print(" [ACCEL] X:"); Serial.print(accel.x); 
    Serial.print(" Y:"); Serial.print(accel.y);
    Serial.print(" Z:"); Serial.println(accel.z);
    
    sendTelemetry(gps.location.lat(), gps.location.lng(), tempC, accel);
    lastSend = millis();
  }

  delay(100);
}
