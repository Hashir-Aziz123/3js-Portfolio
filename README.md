# 3D Interactive Portfolio

A fully immersive 3D interactive portfolio experience built with **Three.js**, featuring a carefully crafted room environment with interactive objects and dynamic systems. This project showcases web development skills through creative use of 3D graphics, physics simulation, and modern JavaScript architecture.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Interactive Elements](#interactive-elements)
- [Development](#development)
- [Performance Considerations](#performance-considerations)

## 🎯 Overview

This project combines artistic 3D modeling with interactive web technologies to create an engaging portfolio experience. The scene features a photorealistic room environment with carefully positioned objects, realistic lighting, and smooth animations. Users can interact with various elements like a laptop, phone, printer, and movable car to explore different aspects of the portfolio.

The project is inspired by the "digital bedroom" concept, creating an intimate and memorable way to showcase work and skills.

## ✨ Features

### 3D Environment
- **Professionally modeled room environment** with realistic proportions and lighting
- **High-quality textures** including wood floor materials with normal and roughness maps
- **Atmospheric lighting system** with multiple light sources for realistic rendering
- **Blender-modeled assets** seamlessly imported into Three.js via `.glb` format

### Interactive Elements
- **Laptop interaction** - Click to trigger actions related to projects or information
- **Phone event handling** - Interactive mobile device element
- **Printer interaction** - Functional interaction point for document viewing
- **Movable toy car** - Physics-based object that can be controlled and navigated
- **Collision detection system** - Prevents objects from overlapping and falling through surfaces

### Technical Features
- **Real-time animation system** for smooth object movement and transitions
- **Custom camera controls** for scene exploration and navigation
- **Event-driven architecture** for clean, maintainable interaction handling
- **Model loading system** for dynamic asset management
- **Contact card display** - Additional UI for contact information

## 📁 Project Structure

```
portfolio/
├── index.html                 # Main HTML entry point
├── main.js                    # Application bootstrap
├── package.json               # Project dependencies
├── README.md                  # This file
│
├── assets/                    # Static assets
│   ├── models/                # 3D model files
│   │   └── Blends/            # Blender-exported models
│   ├── PDFs/                  # PDF documents (CV, etc.)
│   ├── sounds/                # Audio files for interactions
│   └── textures/              # Texture maps
│       ├── wood_floor_nor_gl_4k.exr    # Normal map (4K)
│       └── wood_floor_rough_4k.exr     # Roughness map (4K)
│
├── html/                      # Static HTML components
│   ├── contactCard.html       # Contact information UI
│   └── contactCard.css        # Contact card styles
│
├── public/                    # Public static files
│
├── src/                       # Source code
│   ├── app.js                 # Main application controller
│   │
│   ├── objects/               # 3D scene objects
│   │   ├── car.js             # Interactive car object
│   │   ├── room.js            # Room environment object
│   │   └── testObjects.js     # Test and debug objects
│   │
│   ├── scene/                 # Core Three.js systems
│   │   ├── camera.js          # Camera setup and controls
│   │   ├── controls.js        # User input handling (mouse, keyboard)
│   │   ├── environment.js      # Scene environment and background
│   │   ├── lights.js          # Lighting configuration
│   │   └── renderer.js        # WebGL renderer setup
│   │
│   ├── systems/               # Application systems
│   │   ├── animate.js         # Animation loop and frame updates
│   │   ├── collision.js       # Physics and collision detection
│   │   ├── events.js          # Global event dispatcher
│   │   ├── modelLoader.js     # Asset loading utilities
│   │   └── interactions/      # Object interaction handlers
│   │       ├── interactionManager.js    # Central interaction hub
│   │       ├── laptopInteraction.js     # Laptop click events
│   │       ├── phoneEvent.js            # Phone interaction logic
│   │       └── printerEvent.js          # Printer interaction logic
│   │
│   └── utils/                 # Utility functions
│       └── createGroup.js     # Helper for object grouping
│
└── styles/                    # CSS stylesheets
    └── style.css              # Main stylesheet
```

## 🛠 Technologies

- **Three.js** - 3D graphics library and rendering engine
- **Blender** - 3D modeling and asset creation
- **JavaScript (ES6+)** - Core application logic
- **WebGL** - Graphics rendering
- **HTML5 & CSS3** - Web interface
- **Node.js/npm** - Build tools and package management

## 📦 Installation

1. **Clone or download the project:**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000` (or the configured port)

## 🎮 Usage

### Viewing the Scene
- **Mouse/Trackpad**: Drag to look around or navigate the camera
- **Keyboard Controls**: Use arrow keys or WASD to move through the scene
- **Scroll**: Zoom in/out for detailed inspection

### Interacting with Objects
- **Laptop**: Click to access project information or links
- **Phone**: Click to view contact information or messages
- **Printer**: Click to download documents (CV, etc.)
- **Car**: Click and drag or use controls to move the car around the scene

## 🏗 Architecture

### Module System
The project uses a modular architecture with clear separation of concerns:

- **Scene Management**: `scene/` folder handles all Three.js scene setup
- **Object Representation**: `objects/` contains entity definitions
- **System Logic**: `systems/` manages application-level features
- **UI Interactions**: `systems/interactions/` handles user-triggered events
- **Utilities**: `utils/` provides reusable helper functions

### Event Flow
1. User interacts with the scene (mouse click, keyboard press)
2. `events.js` captures and dispatches the event
3. `interactionManager.js` routes to appropriate handler
4. Specific interaction file (e.g., `laptopInteraction.js`) executes logic
5. Scene updates are reflected in real-time

### Animation Loop
- `animate.js` manages the continuous render loop
- All frame updates, physics, and animations are synchronized
- Targets 60 FPS for smooth visual experience

## 🎨 Interactive Elements

### Laptop Interaction
- Positioned strategically in the room
- Click-activated to showcase projects or resume
- Can display project previews or navigation menu

### Phone
- Interactive touchscreen simulation
- Displays contact information
- Potential for message/notification display

### Printer
- Document display and download functionality
- Can print/download CV or portfolio PDF

### Movable Car
- Physics-enabled 3D object
- Collision detection prevents clipping through objects
- Can be controlled to navigate the room
- Serves as an interactive element to explore hotspots

## 👨‍💻 Development

### Adding New Interactions
1. Create a new interaction handler in `systems/interactions/`
2. Import and register in `interactionManager.js`
3. Define click areas using Three.js raycasting
4. Implement the interaction logic

### Adding New Objects
1. Create model in Blender and export as `.glb`
2. Place file in `assets/models/Blends/`
3. Create object definition in `src/objects/`
4. Use `modelLoader.js` to load and position in scene

### Modifying Lighting
- Edit `src/scene/lights.js` to adjust light positions, colors, and intensities
- Use Three.js light helpers to visualize in development

### Updating Textures
- Replace texture files in `assets/textures/`
- Update material definitions in respective object files

## ⚡ Performance Considerations

- **Texture Optimization**: 4K textures are used efficiently with proper compression
- **Model Optimization**: Blender models are optimized before export
- **Culling**: Objects outside the camera view are not rendered
- **LOD (Level of Detail)**: Consider implementing for distant objects
- **Draw Call Reduction**: Efficient batching of geometries

## 📝 Notes

- This project is optimized for modern browsers with WebGL support
- Best viewed on desktop with a mouse/trackpad for full interaction
- The scene is designed for single-user exploration
- Audio files are included for potential interaction feedback

## 🔧 Future Enhancements

- [ ] Mobile responsiveness and touch controls
- [ ] Sound effects for interactions
- [ ] Animation transitions between states
- [ ] Additional interactive objects
- [ ] Scene state persistence (localStorage)
- [ ] Performance optimization for low-end devices 
