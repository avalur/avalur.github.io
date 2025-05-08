# Exam Questions (Fundamentals of Machine Learning, NUP, Cyprus)

## Neural Networks

* **Linear Separability and Non-Linear Classification:** Provide an example of a dataset that cannot be perfectly classified by any linear classifier without errors. What is the minimum number of points (and class configuration) for which such linear separation is impossible? What are some ways to modify a linear classification algorithm (or the input space) to make this dataset linearly separable?

* **Universal Approximation (Boolean Functions):** Why can any Boolean function be represented by a neural network? What is the minimum number of layers required to construct a network that computes an arbitrary Boolean function, and why?

* **Weight Initialization in Deep Networks:** How can the initial choice of weights affect the training of a neural network? Describe methods or heuristics for selecting initial weights in gradient-based training of neural networks and why proper initialization is important.

* **Accelerating Convergence:** What techniques can be used to speed up the convergence of gradient-based training for neural networks? Describe at least two methods (for example, momentum, adaptive learning rate algorithms, batch normalization, etc.) and explain how they help accelerate training.

* **Network "Paralysis":** What is meant by the "paralysis" of a neural network during training? Under what conditions can network paralysis occur, and how can it be avoided or remedied in practice?

* **Choosing the Number of Layers:** How would you decide on an appropriate number of layers for a neural network when designing its architecture? Discuss the factors that influence this choice and how deeper vs. shallower architectures affect learning capacity and outcomes.

* **Choosing the Number of Hidden Neurons:** What considerations guide the choice of the number of neurons in a neural network’s hidden layer(s)? What are the potential consequences of having too few or too many neurons in a layer?

* **Dropout Regularization:** What is the dropout technique in neural network training? Which shortcomings of the standard backpropagation training (e.g. overfitting or co-adaptation of neurons) does dropout address, and how does it improve a network’s generalization?

* **CNNs vs RNNs – Sequential Modeling:** Convolutional neural networks (CNNs) excel at spatial feature learning, but what shortcomings or limitations of CNNs are addressed by recurrent neural networks (RNNs)? In what types of tasks would you choose an RNN over a CNN, and why?

* **Attention Mechanisms vs RNNs:** Recurrent networks have difficulty with certain long-range dependencies and parallelization. What problems of standard RNN architectures (e.g. LSTMs/GRUs) does the attention mechanism solve? Explain how attention allows models to better handle tasks like long sequences or selective focus on relevant information.

* **BERT Pre-training Objectives:** What is the BERT model, and what are the two primary objectives used to pre-train BERT on unlabeled text? Describe these training objectives and explain why each of them is important for learning language representations.

* **Semantic Segmentation in Computer Vision:** What is the task of **semantic segmentation** in computer vision, and how is it formally defined? How does semantic segmentation differ from image classification and object detection in terms of output and learning challenge?
