#pragma once

/*
 * The Guardian Band - ESP32 Configuration
 * 
 * Pin assignments based on ESP32 DevKit C
 * See docs/connections.md for complete wiring diagrams
 */

// =============================================================================
// GPIO PIN ASSIGNMENTS
// =============================================================================

// UART Pins for SIM800L Cellular Modem
#define MODEM_RX_PIN 26         // ESP32 RX ← SIM800L TX
#define MODEM_TX_PIN 27         // ESP32 TX → SIM800L RX
#define MODEM_BAUD_RATE 9600    // SIM800L default communication speed

// UART Pins for NEO-6M GPS Module  
#define GPS_RX_PIN 16           // ESP32 RX ← NEO-6M TX
#define GPS_TX_PIN 17           // ESP32 TX → NEO-6M RX
#define GPS_BAUD_RATE 9600      // NEO-6M communication speed

// 1-Wire Pin for DS18B20 Temperature Sensor
#define TEMP_ONEWIRE_PIN 4      // Digital pin with 4.7kΩ pull-up to 3.3V

// ADC Pins for GY-61 Accelerometer (ADXL335)
#define ACCEL_X_PIN 34          // X-axis analog output (ADC1_CH6)
#define ACCEL_Y_PIN 35          // Y-axis analog output (ADC1_CH7)  
#define ACCEL_Z_PIN 32          // Z-axis analog output (ADC1_CH4)

// I2C Pins (optional for MAX30102 only)
#define I2C_SDA_PIN 21          // I2C Data line
#define I2C_SCL_PIN 22          // I2C Clock line
// Note: MAX30102 address = 0x57

// Optional pins for future expansion
#define LED_STATUS_PIN 2        // Built-in LED for status indication
#define BATTERY_ADC_PIN 36      // ADC pin for battery voltage monitoring
// #define MODEM_RESET_PIN 5    // Optional: SIM7000 reset control
// #define MODEM_POWER_PIN 18   // Optional: SIM7000 power control

// =============================================================================
// CELLULAR NETWORK CONFIGURATION
// =============================================================================

// APN Settings - Configure for your cellular carrier
#define APN "airtelgprs.com"    // Airtel India APN (also try "www" if this doesn't work)
#define APN_USER ""             // Usually empty for most carriers
#define APN_PASS ""             // Usually empty for most carriers

// Common APN examples:
// Verizon:  "vzwinternet"
// AT&T:     "broadband" 
// T-Mobile: "fast.t-mobile.com"
// 1NCE IoT: "iot.1nce.net"

// =============================================================================
// SERVER CONFIGURATION  
// =============================================================================

#define SERVER_HOST "192.168.0.177"  // Your local PC IP address (Wi-Fi 2)
#define SERVER_PORT 3000           // Server port number
#define SERVER_PATH "/api/v1/ingest" // API endpoint path

// Examples:
// Local development: "192.168.1.100" or "localhost" 
// Cloud deployment:  "your-domain.com" or "api.guardian-band.com"
// Use IP address to avoid DNS lookup overhead

// =============================================================================
// DEVICE IDENTIFICATION
// =============================================================================

#define DEVICE_ID "GB-esp32-0001"  // Unique device identifier
// Format: GB-[type]-[number] (e.g., GB-esp32-0001, GB-field-0042)

// =============================================================================
// TIMING CONFIGURATION
// =============================================================================

#define UPLOAD_INTERVAL_MS 15000   // Time between data uploads (milliseconds)
#define GPS_TIMEOUT_MS 30000       // Max time to wait for GPS fix
#define MODEM_TIMEOUT_MS 10000     // Max time for cellular operations

// Recommended intervals:
// Development: 15000ms (15 seconds) - fast testing
// Field deployment: 300000ms (5 minutes) - battery conservation
// Emergency mode: 60000ms (1 minute) - frequent updates

// =============================================================================
// SENSOR CONFIGURATION
// =============================================================================

// Temperature sensor settings
#define TEMP_PRECISION 12          // DS18B20 precision (9-12 bits)
#define TEMP_CONVERSION_TIME 750   // Time to wait for conversion (ms)

// GY-61 (ADXL335) Accelerometer settings  
#define ACCEL_RANGE_G 3            // ±3g range for ADXL335
#define ADC_RESOLUTION 4096        // 12-bit ADC (0-4095)
#define ACCEL_ZERO_G_OFFSET 1650   // Typical 0g offset (ADC counts)
#define ACCEL_SENSITIVITY 330      // mV/g (330mV per g for ADXL335)

// Battery monitoring
#define BATTERY_VOLTAGE_DIVIDER 2.0 // Voltage divider ratio (if used)
#define BATTERY_LOW_THRESHOLD 3.3   // Low battery alert threshold (volts)
