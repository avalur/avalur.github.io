# Exam Questions (Advanced Machine Learning, NUP, Cyprus)

## Clustering and Topic Modeling

* **Goals of Clustering:** What are the main goals of clustering in unsupervised learning? Why would one perform clustering, and what insights or results are expected from a successful clustering?

* **Clustering Quality Metrics:** Which quality functionals or evaluation metrics are used to assess the results of a clustering? Describe at least two such metrics (for example, silhouette score, Dunn index, or within-cluster SSE) and explain what aspects of clustering they measure and how they are used.

* **Clustering Algorithms – K-means vs DBSCAN:** Compare the K-means and DBSCAN clustering algorithms. How does each algorithm form clusters, and what assumptions does each make about cluster shape or structure? In what situations would DBSCAN be more suitable than K-means, and vice versa?

* **Semi-Supervised Learning and Co-Training:** What is semi-supervised learning, and how does it differ from pure supervised or unsupervised learning? Describe the co-training approach for semi-supervised classification: how do two models iteratively improve each other using unlabeled data?

* **Expectation-Maximization for Clustering:** Explain the role of the Expectation-Maximization (EM) algorithm in clustering problems such as Gaussian Mixture Models. How do the E-step and M-step of EM work together to find cluster parameters when some data labels/assignments are unknown?

* **Self-Organizing Maps – Objective Function:** What objective (quality functional) does a Self-Organizing Map (Kohonen network) optimize during training? (You may express this in words; for example, describe how SOM training balances representing input data accurately with maintaining topological ordering on the map.)

* **Hard vs Soft Competition in SOMs:** In training a Self-Organizing Map, what is the difference between hard competition and soft competition among neurons? What are the advantages of using a soft competition (updating a neighborhood of neurons) instead of only the single winning neuron?

* **Structure and Learning of SOMs:** How is a Self-Organizing Map structured and trained? Describe the architecture of a SOM and the process by which it learns to produce a low-dimensional representation (map) that preserves topological relationships of the input data.

* **Definition of a Topic:** In the context of topic modeling for text documents, what is a "topic" from a mathematical perspective? How can the topic of a document be formally defined or represented in models such as Latent Dirichlet Allocation (LDA)?

* **Dirichlet Distribution in Topic Models:** Why is the Dirichlet distribution used in topic modeling (e.g., as a prior in LDA)? What properties of the Dirichlet make it well-suited for modeling the mixture of topics in documents or mixture of words in topics, and what advantages does this confer to the topic model?

## Gaussian Processes and Bayesian Optimization

* **Gaussian Process Definition:** What is a Gaussian Process in the context of machine learning? Provide a definition and explain how a Gaussian Process can be used as a prior over functions (mentioning the idea that any finite collection of function values has a joint Gaussian distribution).

* **Bayesian vs Frequentist Approaches:** What are the advantages of a Bayesian approach to machine learning problems? Discuss how Bayesian methods (which incorporate prior distributions and compute posterior uncertainty) compare to traditional frequentist approaches, and why those advantages might be desirable in modeling.

* **Acquisition Functions in Bayesian Optimization:** In Bayesian optimization, what is an acquisition function and what is its role? Provide examples of common acquisition functions (e.g., Expected Improvement, Upper Confidence Bound, Thompson Sampling) and explain how they balance exploration and exploitation when selecting the next point to evaluate.

* **Surrogate Modeling Applications:** Give examples of surrogate modeling tasks. What is surrogate modeling, and in what scenarios would you use a surrogate model? Describe at least two situations (for example, hyperparameter tuning of expensive models, engineering design optimization, etc.) where building a surrogate (proxy) model of an expensive function enables effective optimization or analysis.

## Reinforcement Learning and Bandits

* **Reinforcement Learning Problem Formulation:** Formulate the reinforcement learning problem. What are the key components of an RL problem (describe terms such as agent, environment, state, action, reward, policy, value function), and what is the goal of the agent? How does this formulation differ from supervised learning?

* **Multi-Armed Bandit Model:** Describe the multi-armed bandit problem model. What does this problem entail, and what makes it a simpler special case of reinforcement learning? In the bandit setting, how does an agent balance exploration and exploitation, and what objectives is it trying to maximize?

* **Thompson Sampling Algorithm:** What is Thompson Sampling in the context of multi-armed bandits? Outline how the Thompson Sampling algorithm works for choosing actions (arms) and how it uses Bayesian reasoning (maintaining a posterior distribution over each arm’s reward probability) to balance exploration and exploitation.

* **Bellman Equations in RL:** What are the Bellman equations in reinforcement learning and what do they represent? Provide the general idea of the Bellman expectation equation or Bellman optimality equation for the value of a state (or state-action pair), and explain why these equations are fundamental to solving RL problems.

* **Deep Q-Network (DQN):** Describe the Deep Q-Network (DQN) model. How does DQN combine Q-learning with deep neural networks? Explain the key components that make DQN successful (such as the use of experience replay and target networks) and how it improves upon the basic Q-learning algorithm.

* **From AlphaGo to AlphaZero:** What were the key innovations that enabled **AlphaGo** to master the game of Go, and how did **AlphaZero** further advance these ideas? Describe the main differences in training regime or architecture between AlphaGo (which used supervised learning on human games plus reinforcement learning, and had separate policy and value networks) and AlphaZero (which learned purely through self-play reinforcement learning and uses a single unified network).

## Generative Models (Autoencoders, VAEs, GANs)

* **Generative vs Discriminative Models:** What is the difference between generative and discriminative models in machine learning? Provide an example of a generative model and a discriminative model for a classification task, and discuss in what situations one might prefer a generative approach over a discriminative one (and vice versa).

* **Autoencoders and Applications:** What is an autoencoder neural network? Describe its architecture (including the roles of the encoder and decoder) and give examples of tasks or applications where autoencoders are useful. Why is an autoencoder considered an unsupervised learning model?

* **Variational Autoencoder (VAE):** What is a Variational Autoencoder and how does it differ from a standard autoencoder? Explain the key ideas behind VAEs, including the notions of encoding distributions (means and variances), the reparameterization trick, and the VAE’s training objective that includes a reconstruction term and a divergence (regularization) term.

* **Generative Adversarial Networks (GANs):** What is a Generative Adversarial Network? Describe the roles of the generator and the discriminator in a GAN framework. How do these two components interact during training, and what objective is each trying to optimize?

* **Challenges in GAN Training:** GANs can be challenging to train. What is **mode collapse** in the context of GANs, and why does it occur? Additionally, name one or two techniques or variations (such as Wasserstein GANs, feature matching, or minibatch discrimination) that have been proposed to mitigate training pathologies in GANs, and briefly explain how they help.

## Advanced Generative Techniques (CLIP, Normalizing Flows, Diffusion Models)

* **CLIP (Contrastive Language–Image Pretraining):** What is CLIP and what problem does it address? Describe how CLIP is trained to connect images and text (briefly explain the contrastive learning objective it uses), and discuss one or two ways in which a pre-trained CLIP model can be applied in AI tasks.

* **Normalizing Flows:** What are normalizing flows in the context of generative modeling? Explain how a normalizing flow model generates data and computes exact likelihoods. In your answer, mention the idea of using a sequence of invertible transformations on a simple initial distribution and how the change-of-variables formula is involved.

* **Diffusion Models:** What is a diffusion model for generative modeling? Outline the basic idea behind diffusion models, including the forward **diffusion** process (gradually adding noise to data) and the reverse **generative** process (learning to remove noise step by step to synthesize data). Why have diffusion models become prominent, and what advantages do they offer compared to earlier generative models?

## Natural Language Processing

* **WordNet vs Learned Embeddings:** What is **WordNet** and how is it used in natural language processing? In contrast, how do data-driven embedding methods like **Word2Vec** or **GloVe** represent word meaning? Compare the knowledge-based approach of WordNet with the distributional approach of Word2Vec/GloVe for obtaining semantic representations of words.

* **Word2Vec Mechanism:** Explain how the Word2Vec algorithm learns word embeddings from a corpus of text. Describe either the skip-gram model (with negative sampling) or the CBOW model – how training examples are constructed and what the model learns to predict – and how this process yields vector representations capturing semantic relationships between words.

* **GloVe Embeddings:** What is the GloVe (Global Vectors) model for word embeddings, and how does its approach differ from Word2Vec’s? Describe the information that GloVe leverages to learn word vectors (hint: co-occurrence statistics) and how the learning objective is set up for GloVe.

* **Perplexity of Language Models:** What is **perplexity** in the context of language models? How is perplexity calculated from a language model’s output probabilities, and what does the value of perplexity indicate about a model’s performance on a given text dataset?

* **BERT Training Objectives:** What is the BERT model in NLP, and what two pre-training tasks does it use to learn representations from unlabeled text? Describe these tasks (for example, **Masked Language Modeling** and **Next Sentence Prediction**) and explain how they enable BERT to capture context and semantics in language.

## Efficient Neural Network Training

* **Numeric Precision:** Large neural networks often use reduced numerical precision. What are some common numeric formats (e.g., FP32, FP16, bfloat16) used in deep learning, and what are the benefits of using lower precision arithmetic during training? Discuss any challenges that might arise when training with lower precision (for example, issues of numerical stability or overflow/underflow).

* **Fully Sharded Data Parallel (FSDP):** What is Fully Sharded Data Parallel training in the context of large neural networks? Explain how FSDP (or similar sharding strategies) helps distribute the memory and computation load across multiple GPUs or machines, and why this is important for training very large models.

* **Parameter-Efficient Fine-Tuning (PEFT):** In the context of adapting large pre-trained models to specific tasks, what are parameter-efficient fine-tuning techniques? Describe the general idea of fine-tuning a model by only adjusting a small subset of parameters (or adding a small number of new parameters) instead of full model tuning. Why are such techniques advantageous when dealing with very large models?

* **LoRA (Low-Rank Adaptation):** What is Low-Rank Adaptation (LoRA) and how does it facilitate efficient fine-tuning of large neural networks? Explain how LoRA incorporates low-rank matrices into the model’s layers and why this drastically reduces the number of free parameters that need to be learned during fine-tuning.

## Model Compression and Mixture-of-Experts

* **Model Quantization:** What is model quantization in the context of neural networks, and how does quantization reduce model size and computational requirements? Give an example of quantizing a model (for instance, converting 32-bit float weights to 8-bit integers) and discuss the potential impact on model accuracy and performance.

* **Pruning Neural Networks:** What is model pruning and how is it applied to neural networks? Describe a common method of pruning (such as removing weights with small magnitudes or removing entire neurons/filters) and explain how pruning can maintain model performance while reducing complexity. What are the trade-offs involved in pruning?

* **Knowledge Distillation:** Explain the concept of knowledge distillation in model compression. How does a *student* model learn from a *teacher* model in this framework? Describe what kind of information is transferred from teacher to student and how this process can produce a smaller model with performance comparable to a larger model.

* **Mixture-of-Experts (MoE) Models:** What is a Mixture-of-Experts model in deep learning? Describe how an MoE architecture works, particularly how it uses multiple expert sub-models and a gating mechanism to route inputs to different experts. Why are MoE models considered a form of *sparse* computation, and how can they enable scaling to very large model sizes without proportional increases in computation for each input?

## AI Agents and Retrieval-Augmented Generation

* **Conversational AI Agents with Tools:** What is an AI *agent* in the context of modern AI systems (for example, an LLM-based assistant that can interact with external tools)? Describe how such an agent can plan and execute actions using tools or external resources (like search engines, calculators, or databases) to accomplish a task. What components are necessary to enable an AI agent to decide when and how to use a tool?

* **Retrieval-Augmented Generation (RAG):** What is Retrieval-Augmented Generation and what problem does it solve for large language models? Explain how a RAG system works, outlining the steps of retrieving relevant information (e.g., from a vector database or knowledge base) and then generating a response based on both the retrieved information and the model’s knowledge. Why is RAG useful for tasks like question answering or having up-to-date information?

* **Long Contexts and State-Space Models:** Large language models have limited input context lengths. What are some approaches to extend or handle long contexts in sequence modeling? Briefly describe one solution such as the use of **state-space models (SSMs)** or other long-context strategies, and explain how it helps models process or remember longer sequences of information than standard Transformers.

## Other Advanced Topics (Time Series and Ranking)

* **Time Series Dependency Types:** In time series analysis, what types of dependencies or patterns do we typically look for in data over time? Describe at least two types of time-dependent patterns (for example: trend, seasonality, cyclic patterns, autocorrelation) that can appear in time series data and why identifying them is important.

* **ARIMA Model for Forecasting:** Outline the ARIMA model used for time series forecasting. What do the components Autoregressive (AR), Integrated (I), and Moving Average (MA) represent? Describe how the ARIMA model incorporates these components to capture different aspects of a time series, and briefly explain the process of using an ARIMA model to fit and forecast a time series.

* **Ranking Tasks and Features:** Give examples of machine learning tasks that involve **ranking** (ordering items by relevance or preference) rather than simple classification or regression. Describe two example applications (such as search engine result ranking, recommendation systems, or ad ranking) and suggest what features of the items or queries might be used in a learning-to-rank model for those applications.
