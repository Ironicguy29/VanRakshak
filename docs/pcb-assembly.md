# PCB Layout and Assembly Guide

## PCB Design Considerations

### Layer Stack-Up (Recommended 4-layer)
```
Layer 1: Component + Signal traces
Layer 2: Ground plane
Layer 3: Power plane (3.3V)
Layer 4: Signal traces + components
```

### Component Placement

#### Critical Placement Rules
1. **ESP32**: Central location, easy access to all peripherals
2. **Antenna Keepouts**: 5mm clearance around GPS/cellular antennas
3. **Power Section**: Isolated from RF sections
4. **Crystal/Oscillator**: Close to ESP32, short traces, ground guard
5. **I2C Devices**: Close together, minimize trace lengths

#### Recommended Layout
```
    [GPS ANT]          [CELLULAR ANT]
         │                    │
    ┌────┴────┐         ┌────┴────┐
    │ NEO-6M  │         │ SIM7000 │
    │   GPS   │         │  Modem  │
    └─────────┘         └─────────┘
         │                    │
    ┌────┴────────────────────┴────┐
    │         ESP32               │
    │       DevKit C              │
    └─┬─────────────────────────┬─┘
      │                         │
 ┌────┴───┐               ┌────┴───┐
 │MPU6050 │               │DS18B20 │
 │  IMU   │               │ Temp   │
 └────────┘               └────────┘
      │                         │
 ┌────┴─────────────────────────┴───┐
 │        Power Section            │
 │   [TP4056] [LiPo] [Solar]       │
 └─────────────────────────────────┘
```

### Trace Routing Guidelines

#### Power Traces
- **VCC (3.3V)**: Minimum 0.5mm (20 mil) width
- **Battery (VIN)**: Minimum 0.8mm (30 mil) width  
- **Ground**: Flood fill, multiple vias to ground plane
- **Use ground plane**: Reduces noise, improves thermal performance

#### Signal Traces
- **UART**: 0.2mm (8 mil) minimum, keep differential pairs matched
- **I2C**: 0.2mm (8 mil), add test points for debugging
- **1-Wire**: 0.2mm (8 mil), route away from switching signals
- **Crystal**: Keep traces <5mm, surround with ground guard

#### RF Considerations
- **Antenna Traces**: 50Ω controlled impedance
- **Keep antennas separated**: Minimum 10mm between GPS and cellular
- **Ground plane stitching**: Use vias every 5mm along RF traces
- **Avoid routing under antennas**: Maintain ground plane clearance

## Component Footprints and Values

### Passive Components
```
Resistors (0603 package):
- R1: 4.7kΩ (DS18B20 pull-up)
- R2, R3: 4.7kΩ (I2C pull-ups SDA/SCL)
- R4, R5: 10kΩ (Battery voltage divider, optional)

Capacitors (0603 package):
- C1, C2: 100nF (decoupling for each IC)
- C3, C4: 10µF (power supply filtering)
- C5: 1000µF electrolytic (main power filter)

Inductors/Ferrites:
- L1: Ferrite bead on power input (noise suppression)
```

### Connectors
```
J1: USB-C or Micro-USB (charging/programming)
J2: JST-PH 2-pin (battery connection)
J3: JST-XH 4-pin (external sensor expansion)
J4: U.FL or SMA (GPS antenna)
J5: U.FL or SMA (cellular antenna)
J6: 6-pin programming header (optional)
```

### Test Points
```
TP1: VCC (3.3V)
TP2: VIN (Battery voltage)
TP3: GND
TP4: GPS_TX
TP5: GPS_RX
TP6: SIM_TX
TP7: SIM_RX
TP8: I2C_SDA
TP9: I2C_SCL
TP10: 1WIRE_DATA
```

## Assembly Process

### Step 1: Stencil and Paste Application
1. Align stencil with PCB fiducials
2. Apply solder paste evenly
3. Check for consistent paste height
4. Remove stencil carefully

### Step 2: Component Placement
**Order of placement:**
1. ESP32 module (largest component first)
2. Power management ICs (TP4056, regulators)
3. Sensors (MPU6050, MAX30102)
4. Communication modules (SIM7000, NEO-6M)
5. Passive components (resistors, capacitors)
6. Connectors and mechanical parts

### Step 3: Reflow Soldering
**Recommended profile:**
- Preheat: 150°C for 90 seconds
- Soak: 150-180°C for 120 seconds  
- Reflow: 235°C peak for 30 seconds
- Cool down: <3°C/second

### Step 4: Through-Hole Components
1. Insert connectors and headers
2. Wave solder or hand solder
3. Trim component leads

### Step 5: Post-Assembly Testing
1. **Visual inspection**: Check for bridges, tombstones
2. **Continuity testing**: Verify power/ground connections
3. **Power-on test**: Check current draw (<100mA idle)
4. **Functional test**: Program and test each peripheral

## Quality Control Checklist

### Pre-Assembly
- [ ] PCB dimensions match enclosure
- [ ] All components in stock and verified
- [ ] Stencil apertures correct size
- [ ] Pick and place programming verified

### During Assembly  
- [ ] Solder paste coverage adequate
- [ ] Component orientation correct
- [ ] No missing or misaligned parts
- [ ] Reflow profile within specification

### Post-Assembly
- [ ] No solder bridges or cold joints
- [ ] All test points accessible
- [ ] Connector retention adequate
- [ ] Antenna connections secure
- [ ] Programming/charging port functional

### Functional Testing
- [ ] Power consumption within limits
- [ ] GPS acquires satellites
- [ ] Cellular connects to network
- [ ] I2C devices respond at correct addresses
- [ ] Temperature reading accurate
- [ ] Battery charging functional
- [ ] Firmware uploads successfully

## Design for Manufacturing (DFM)

### Minimum Specifications
- **Trace width**: 0.1mm (4 mil) minimum
- **Via size**: 0.2mm (8 mil) drill minimum  
- **Spacing**: 0.1mm (4 mil) minimum trace-to-trace
- **Solder mask**: 0.1mm (4 mil) minimum opening
- **Silkscreen**: 0.15mm (6 mil) minimum line width

### Cost Optimization
- **Panel size**: Optimize for standard panel dimensions
- **Layer count**: 4-layer sufficient for most designs
- **Via count**: Minimize vias in high-speed sections
- **Component count**: Consolidate similar value passives

## Troubleshooting Common Issues

### Assembly Problems
| Issue | Cause | Solution |
|-------|-------|----------|
| Solder bridges | Excessive paste, misaligned stencil | Reduce paste, improve alignment |
| Cold joints | Low temperature, contaminated pads | Increase temp, clean pads |
| Tombstoning | Uneven heating, pad size mismatch | Balance thermal mass, adjust pads |
| Component drift | Vibration during reflow | Secure conveyor, reduce speed |

### Functional Problems  
| Issue | Cause | Solution |
|-------|-------|----------|
| No GPS fix | Poor antenna, shielding | Check antenna connection, placement |
| Cellular timeout | Wrong APN, poor signal | Verify settings, check signal strength |
| I2C not detected | Pull-up missing, wrong address | Add resistors, verify addressing |
| High current draw | Short circuit, wrong component | Check for shorts, verify part numbers |

## Documentation Requirements

### Assembly Drawings
- [ ] Top and bottom assembly views
- [ ] Component reference designators
- [ ] Orientation indicators for polarized parts
- [ ] Test point locations and labels

### Manufacturing Files
- [ ] Gerber files (all layers)
- [ ] Excellon drill files
- [ ] Pick and place files
- [ ] Bill of materials with part numbers
- [ ] Assembly instructions
- [ ] Test procedures

### Certification Documents
- [ ] FCC ID for cellular module
- [ ] CE marking compliance  
- [ ] RoHS compliance certificates
- [ ] Component datasheets and specifications