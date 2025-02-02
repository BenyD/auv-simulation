# AUV Simulator

A **Next.js** application that simulates an **Autonomous Underwater Vehicle (AUV)** navigating through obstacles using multiple pathfinding algorithms. The simulator provides a real-time, interactive environment to visualize how different algorithms perform in guiding an AUV efficiently to a target position.

## Features

- **Multiple Pathfinding Algorithms**: A\* Search, Rapidly-exploring Random Tree (RRT), and Deep Reinforcement Learning (RL)
- **Interactive Obstacle Placement**: Click and drag to create and manage obstacles
- **Real-Time Simulation Controls**: Start, stop, and reset simulations with ease
- **Performance Metrics and Visualization**: Track algorithm performance dynamically
- **Dark/Light Theme Support**: Toggle between UI themes
- **Responsive Design**: Works across different screen sizes
- **Keyboard Shortcuts**: Quick and intuitive controls for seamless interaction

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 16.x or later
- **npm** or **yarn**

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/auv-simulator.git
cd auv-simulator
   ```

2. **Install dependencies:**

   ```sh
npm install
   # or
   yarn install
   ```

3. **Run the development server:**

   ```sh
npm run dev
   # or
   yarn dev
   ```

4. **Open the application:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

### Basic Controls

- **Click and drag** to place obstacles
- **Right-click** to set the start position (green marker)
- **Right-click + Shift** to set the goal position (blue marker)
- Use the control panel to **select algorithms** and **adjust simulation settings**

### Keyboard Shortcuts

| Key   | Action                |
| ----- | --------------------- |
| Space | Start/Stop simulation |
| R     | Reset simulation      |
| C     | Clear obstacles       |
| T     | Toggle theme          |
| D     | Toggle documentation  |
| Esc   | Cancel current action |

---

## Pathfinding Algorithms

### A\* Search

- Utilizes a **Manhattan distance heuristic** for optimal pathfinding
- Best for environments with **sparse obstacles**
- **Guarantees the shortest path** when available

### RRT (Rapidly-exploring Random Tree)

- Suitable for **complex, cluttered environments**
- Uses a **probabilistic approach** to pathfinding
- Efficient for **real-time applications**

### Deep Reinforcement Learning

- **Experimental feature** using TensorFlow.js
- Learns from **experience** to improve pathfinding
- Adapts to **dynamic environments**

---

## Architecture

### Core Components

#### **1. Simulation Engine** (`components/Simulation.tsx`)

- Handles **canvas-based visualization**
- Manages the **grid system**
- Responsible for **real-time rendering**

#### **2. Algorithm Implementation** (`utils/algorithms.ts`)

- Houses all **pathfinding algorithm implementations**
- Provides a **common interface** for different algorithms
- Optimized for **performance**

#### **3. AUV Control System** (`utils/auv_ai.ts`)

- Implements **AUV movement controls**
- Handles **collision detection**
- Manages **path-following logic**

#### **4. User Interface** (`components/DebuggingPanel.tsx`)

- Controls for **algorithm selection** and **simulation settings**
- Displays **performance metrics** and debugging tools

---

## Technologies Used

- **Next.js 13+** - React framework for server-side rendering
- **TypeScript** - Ensures code reliability and maintainability
- **TensorFlow.js** - Enables machine learning capabilities
- **Tailwind CSS** - Simplifies styling with utility classes
- **Framer Motion** - Enhances animations and UI interactions
- **Radix UI** - Provides accessible and customizable components

---

## Customization

You can modify the simulator through the following files:

- **`utils/constants.ts`** - Defines grid parameters and simulation settings
- **`utils/algorithms.ts`** - Adjusts algorithm behaviors and performance settings
- **`components/Simulation.tsx`** - Customizes visualization preferences
- **`utils/auv_ai.ts`** - Configures AUV movement and control characteristics

---

## Contributing

We welcome contributions! Follow these steps:

1. **Fork the repository**
2. **Create a feature branch**:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. **Make changes and commit**:
   ```sh
   git commit -m "Add new feature"
   ```
4. **Push to the branch**:
   ```sh
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request**

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Author

**Beny Dishon K**

---

## Acknowledgments

- **Next.js team** for the powerful framework
- **TensorFlow.js community** for enabling machine learning in JavaScript
- **Open source contributors** for various libraries and tools
