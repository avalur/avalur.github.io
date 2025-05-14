# Exam Questions (Fundamentals of Machine Learning, NUP, Cyprus)

## Model Evaluation and Selection
* **Overfitting:** What is overfitting in machine learning, and how can it be recognized? What techniques can be used to prevent overfitting?
* **Cross-Validation:** Explain how cross-validation works and why it is used. What is the difference between a hold-out validation set and k-fold cross-validation?

## Linear Models
* **Regression vs Classification:** How do linear regression and logistic regression differ in terms of their objectives and assumptions? What types of problems does each solve?
* **Surrogate Loss Functions:** Why do we use surrogate loss functions (such as squared error or logistic loss) instead of the 0–1 loss for training models? How does this choice make model training easier?
* **Regularization:** What is regularization in the context of linear models (e.g. L2 or ridge regularization), and how does it help with issues like multicollinearity and overfitting?
* **ERM and MLE:** Explain the relationship between empirical risk minimization and maximum likelihood estimation in a linear model. Why can maximizing likelihood be seen as minimizing an error metric on the training data?
* **Stochastic Gradient Descent:** What is Stochastic Gradient Descent (SGD) and how does it differ from full-batch gradient descent? Why is SGD useful for large datasets or online learning?
* **Learning Rate:** How do you choose a learning rate for gradient-based optimization? What are the consequences of setting the learning rate too high or too low?
* **Analytical vs Numerical Solutions:** Linear regression has an analytical solution (normal equations). Why might one still use an iterative method like gradient descent to solve it in practice?

## Decision Trees and Rule-Based Methods
* **Decision Tree Splitting:** What is a decision tree and how does it recursively partition the feature space? Name two criteria used for splitting nodes in a decision tree and what they measure.
* **Tree Depth and Overfitting:** How does the depth or complexity of a decision tree affect its bias and variance? Why can an overly deep tree lead to overfitting?
* **Pruning:** What is pruning in decision trees, and why is it important? Describe one approach to pruning a decision tree to prevent overfitting.
* **Logical Rules:** What is a logical rule in the context of classification, and how can a set of IF-THEN rules form a predictive model? Give a simple example of a logical rule for a classification task.
* **Optimizing Rule Sets:** In rule-based models, what is the Pareto front and how does it apply when selecting an optimal set of rules? (Hint: think about trading off a rule’s complexity against its accuracy.)

## Instance-Based and Non-Parametric Methods (k-NN, Kernel Methods)
* **k-Nearest Neighbors:** How does the k-Nearest Neighbors (k-NN) algorithm work for classification or regression? What role do the hyperparameters (the number of neighbors `k` and the distance metric) play in its performance?
* **Curse of Dimensionality:** What is the “curse of dimensionality” and how does it affect distance-based methods like k-NN?
* **Parzen Window:** What is the Parzen window method for density estimation or classification? How does a Parzen window approach differ from k-NN in classifying a new point?
* **Nadaraya–Watson Estimator:** Explain the Nadaraya–Watson kernel regression method. How does it use a weighted average of neighbors to make predictions?
* **Instance- vs Model-Based Learning:** Contrast instance-based learning methods (like k-NN) with model-based methods (like linear models). What are the key differences in how they learn from data and make predictions?

## Ensemble Methods
* **Ensembles:** What is an ensemble method in machine learning, and why can an ensemble of models perform better than a single model?
* **Bagging vs Boosting:** Compare bagging and boosting as techniques for building ensembles. How does each method generate diverse models and reduce prediction errors?
* **Random Forest:** How does the Random Forest algorithm build an ensemble of decision trees? What are the two sources of randomness it introduces during training?
* **Random Subspace Method:** What is the random subspace method (feature bagging) in ensemble learning, and how does it help in building stronger models?
* **Weighted Voting vs Mixture of Experts:** What is weighted voting in an ensemble, and how does it work? How is a mixture of experts model conceptually different from a simple voting ensemble?
* **Gradient Boosting Improvements:** Modern gradient boosting implementations (like XGBoost, LightGBM, CatBoost) include various improvements over basic boosting. Name one such improvement and explain its benefit (for example, handling missing values or using regularization to prevent overfitting).

## Neural Networks and Deep Learning
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

## Gaussian Processes and Bayesian Optimization
* **Gaussian Process Definition:** What is a Gaussian Process in the context of machine learning? How is a Gaussian Process defined in terms of functions, mean, and covariance?
* **Bayesian Approach Advantages:** What are some advantages of the Bayesian approach to machine learning problems? (Consider how Bayesian methods handle uncertainty or incorporate prior knowledge.)
* **Bayesian Optimization:** What is Bayesian optimization and in what situations is it useful? How does Bayesian optimization differ from a traditional grid search or random search for hyperparameters?
* **Acquisition Functions:** In Bayesian optimization, what is an acquisition function and why is it needed? Give an example of an acquisition function and explain how it balances exploration and exploitation.
