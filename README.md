# AUV Simulator

A Next.js application that simulates an Autonomous Underwater Vehicle (AUV) using A\* pathfinding algorithm. The AUV navigates through obstacles to reach a target position efficiently.

## Features

- 🎯 Intelligent A\* pathfinding
- 🚧 Dynamic obstacle placement
- 🎮 Interactive start/goal positioning
- 🌓 Dark/Light theme support
- 📊 Real-time control panel
- 📍 Path visualization
- 🎨 Smooth animations and gradients

## How It Works

The simulator uses several key components:

### 1. Pathfinding Algorithm (utils/pathfinding.ts)

- Implements A\* search algorithm
- Uses Manhattan distance heuristic
- Efficiently finds optimal paths avoiding obstacles
- Returns step-by-step directions for the AUV

### 2. Movement Control (utils/auv_ai.ts)

- Manages AUV movement decisions
- Caches paths for performance
- Translates pathfinding results into directional moves
- Handles path recalculation when needed

### 3. Simulation Interface (components/Simulation.tsx)

- Renders the interactive grid
- Handles canvas-based visualization
- Manages simulation state
- Processes user interactions

### 4. Control Panel (components/DebuggingPanel.tsx)

- Provides simulation controls
- Displays real-time status
- Manages obstacle generation
- Controls start/goal placement

## Getting Started

1. Clone the repository:

```bash
git clone <your-repo-url>
cd auv-simulator
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the simulation.

## Usage

1. **Setup Environment**:

   - Place start position (green)
   - Place goal position (blue)
   - Add obstacles (red)

2. **Control Simulation**:

   - Click "Start Simulation" to begin
   - Use "Stop Simulation" to pause
   - "Reset Simulation" to clear path
   - Add/remove obstacles as needed

3. **Additional Features**:
   - Toggle dark/light theme
   - Generate random obstacles
   - Randomize start/goal positions
   - Monitor AUV's position and moves

## Customization

You can modify simulation parameters in:

- `utils/constants.ts`: Grid size and dimensions
- `utils/pathfinding.ts`: Pathfinding behavior
- `components/Simulation.tsx`: Visualization settings
- `components/DebuggingPanel.tsx`: Control options

## License

MIT License

## Author

Beny Dishon K
