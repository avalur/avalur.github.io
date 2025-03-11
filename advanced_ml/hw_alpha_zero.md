## AlphaZero from Scratch
Follow the link and download the zip file: https://drive.google.com/file/d/1OU_Rilaf3Njd9wJn5oKUAlDGlu_8Mgqa/view?usp=sharing

The zip file contains the IDE course that you need to open in JetBrains IDE (PyCharm) with the installed JetBrains Academy plugin:

Browse Courses:

![InstallPluginCourse1](images/InstallPluginCourse1.png)

Open course from disk:

![InstallPluginCourse2](images/InstallPluginCourse2.png)

Then skip the "Introduction" lesson and solve all other exercises.

As a result, we ask you to attach:
1. A screenshot of your IDE displaying passed tests
2. A report in one file: ipynb, PDF or Collab link
 
### Report requirements
Please, try to make your report an interesting story, sequentially answering the questions from the tasks. 
In addition to the answers, code snippets should be included in the report. But keep it minimal. 
The less code there is, the better for everyone: less to check, and easier to find an error or supplement an experiment. 
The clarity of the answers to the questions, the tidiness of the report and code are assessed during the verification.

### Overview
In this assignment, you will build an AlphaZero-like artificial intelligence (AI) system from scratch. 
AlphaZero, developed by DeepMind, represents a groundbreaking approach in the field of AI, 
capable of mastering complex games like Chess, Shogi, and Go through self-play and deep reinforcement learning. 
This project aims
to introduce you to the core principles behind AlphaZero's architecture and learning processes
by applying these concepts to simpler board games like TicTacToe and Connect Four.

### Objectives
- Understand the fundamental concepts of Monte Carlo Tree Search (MCTS), deep reinforcement learning, and neural network design
- Implement a simplified version of the AlphaZero algorithm capable of learning to play TicTacToe and Connect Four without prior knowledge of the games
- Develop a Residual Neural Network (ResNet) model to evaluate game states and predict move probabilities
- Utilize MCTS to explore game trees dynamically, leveraging the neural network for move evaluations
- Train the AlphaZero system through self-play, iteratively improving its strategy over time

### Key Components
1. **(20 points) Game Logic**: Implement game classes for TicTacToe, providing methods to manage game states, validate moves, and determine game outcomes
2. **(20 points) MCTS Integration**: Develop a Monte Carlo Tree Search algorithm that later will use the neural network for guiding its exploration of the game tree, balancing between exploring new moves and exploiting known strategies
3. **(10 points) Neural Network Model**: Design and train a ResNet model to assess game states and output both move probabilities and a value estimation for the current player
4. **(20 points) AlphaMCTS and AlphaZero**: Create a self-play training loop where the AI plays games against itself, using the outcomes to train and refine its neural network model
5. **(15 points) Your implementation of Connect Four**: Implement a simple interface and training loop allowing humans to play against the trained AI, showcasing its learning outcomes
6. **(15 points) Your implementation of Dots and Boxes**: Implement a simple web interface for another game
