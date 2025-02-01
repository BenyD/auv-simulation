# AUV Simulation with Deep Q-Learning

A Next.js application that simulates an Autonomous Underwater Vehicle (AUV) using Deep Q-Learning for pathfinding. The AUV learns to navigate through obstacles to reach a target position.

## Features

- 🤖 Deep Q-Learning based navigation
- 🎯 Dynamic target positioning
- 🚧 Obstacle avoidance
- 🌓 Dark/Light theme support
- 📊 Real-time debugging panel

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd auv-simulation
```

2. Install JavaScript dependencies:

```bash
npm install
# or
yarn install
```

3. Create and activate Python virtual environment:

```bash
python -m venv myenv
source myenv/bin/activate  # On Windows use: myenv\Scripts\activate
```

4. Install Python dependencies:

```bash
pip install torch tensorflow tensorflowjs numpy
```

## Training the AI Model

### Step 1: Train PyTorch Model

The DQN model is first trained using PyTorch:

```bash
python scripts/train_dqn.py
```

This will:

- Train the model for 300 episodes
- Save the trained model as `models/pytorch/auv_dqn_model.pth`
- Show training progress and rewards

### Step 2: Convert to TensorFlow

Convert the PyTorch model to TensorFlow format:

```bash
python scripts/convert_pytorch_to_tf.py
```

This creates:

- TensorFlow SavedModel in `models/tensorflow/saved_model`
- TensorFlow.js model in `public/auv_dqn_model_js`

### Step 3: Start the Application

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the simulation.

## Usage

- 🎮 Click "Start" to begin the simulation
- 🎯 Use "Random Goal" to change target position
- 🚧 Add obstacles using "Add Random Obstacle"
- 📊 Monitor AUV's position and actions in the Debug Panel
- 🌓 Toggle dark/light theme with the theme button

## Model Architecture

The DQN model consists of:

- Input layer (4 neurons): Current X, Y and Target X, Y
- Hidden layers: 2 fully connected layers (128 neurons each)
- Output layer (4 neurons): Left, Right, Up, Down actions

## Customization

You can modify training parameters in `scripts/train_dqn.py`:

- Episodes
- Learning rate
- Reward values
- Network architecture

## Development

To modify the simulation:

1. Edit training parameters in `scripts/train_dqn.py`
2. Retrain the model following steps above
3. The simulation will use the new model automatically

## License

[Your License]
