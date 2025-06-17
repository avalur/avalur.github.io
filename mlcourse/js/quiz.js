// Add quiz functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize quiz elements
    const prevButton = document.getElementById('prev-question');
    const nextButton = document.getElementById('next-question');
    const quizCards = document.querySelectorAll('.quiz-card');
    const totalQuestions = quizCards.length;
    const checkAnswerButtons = document.querySelectorAll('.check-answer');
    const showExplanationButtons = document.querySelectorAll('.show-explanation');
    const quizOptions = document.querySelectorAll('.quiz-option');
    const scoreElement = document.getElementById('score');
    const totalScoreElement = document.getElementById('total-score');

    let currentQuestion = 1;
    let score = 0;
    let questionsAnswered = 0;

    // Set total questions display
    document.getElementById('total-questions').textContent = totalQuestions;
    totalScoreElement.textContent = totalQuestions;

    // Initialize quiz cards display
    quizCards.forEach((card, index) => {
        if (index === 0) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        } else {
            card.style.display = 'none';
            card.style.opacity = '0';
        }
    });

    // Option selection functionality
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options in the same question
            const parentQuestion = this.closest('.quiz-card');
            const options = parentQuestion.querySelectorAll('.quiz-option');
            options.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            this.classList.add('selected');
        });
    });

    // Check answer button functionality
    checkAnswerButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parentQuestion = this.closest('.quiz-card');
            const selectedOption = parentQuestion.querySelector('.quiz-option.selected');
            const feedbackElement = parentQuestion.querySelector('.quiz-feedback');
            const questionNumber = parseInt(parentQuestion.id.split('-')[1]);

            // Check if an option is selected
            if (!selectedOption) {
                feedbackElement.textContent = "Please select an answer first.";
                feedbackElement.className = 'quiz-feedback incorrect';
                feedbackElement.style.display = 'block';

                // Add animation effect
                setTimeout(() => {
                    feedbackElement.style.opacity = '1';
                    feedbackElement.style.transform = 'translateY(0)';
                }, 10);

                return;
            }

            // Check if this question has already been answered
            if (parentQuestion.dataset.answered === 'true') {
                return;
            }

            // Mark question as answered
            parentQuestion.dataset.answered = 'true';
            questionsAnswered++;

            // Check if answer is correct
            const isCorrect = selectedOption.getAttribute('data-correct') === 'true';

            // Apply correct/incorrect styling
            selectedOption.classList.add(isCorrect ? 'correct' : 'incorrect');

            // Show feedback with animation
            feedbackElement.textContent = isCorrect ? 
                "Correct! Well done." : 
                "Incorrect. Try reviewing the material again.";
            feedbackElement.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
            feedbackElement.style.display = 'block';

            // Add animation effect
            setTimeout(() => {
                feedbackElement.style.opacity = '1';
                feedbackElement.style.transform = 'translateY(0)';
            }, 10);

            // Update score if correct
            if (isCorrect) {
                score++;
                scoreElement.textContent = score;
            }

            // Show all correct answers
            const options = parentQuestion.querySelectorAll('.quiz-option');
            options.forEach(opt => {
                if (opt.getAttribute('data-correct') === 'true') {
                    opt.classList.add('correct');
                }
            });

            // Disable further selection on this question
            options.forEach(opt => {
                opt.style.pointerEvents = 'none';
            });

            // Change button text
            this.textContent = 'Answer Checked';
            this.disabled = true;
        });
    });

    // Show explanation button functionality
    showExplanationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parentQuestion = this.closest('.quiz-card');
            const explanationElement = parentQuestion.querySelector('.quiz-explanation');

            // Toggle explanation visibility with animation
            if (explanationElement.style.display === 'block') {
                // Hide with animation
                explanationElement.style.opacity = '0';
                explanationElement.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    explanationElement.style.display = 'none';
                }, 300); // Match transition duration in CSS

                this.textContent = 'Show Explanation';
                this.classList.remove('active');
            } else {
                // Show with animation
                explanationElement.style.display = 'block';
                explanationElement.style.opacity = '0';
                explanationElement.style.transform = 'translateY(10px)';

                // Trigger animation
                setTimeout(() => {
                    explanationElement.style.opacity = '1';
                    explanationElement.style.transform = 'translateY(0)';
                }, 10);

                this.textContent = 'Hide Explanation';
                this.classList.add('active');
            }
        });
    });

    // Function to animate question transition
    function animateQuestionTransition(fromQuestion, toQuestion, direction) {
        // Hide current question with animation
        fromQuestion.style.opacity = '0';
        fromQuestion.style.transform = direction === 'next' ? 'translateX(-20px)' : 'translateX(20px)';

        setTimeout(() => {
            fromQuestion.style.display = 'none';

            // Show next question with animation
            toQuestion.style.display = 'flex';
            toQuestion.style.opacity = '0';
            toQuestion.style.transform = direction === 'next' ? 'translateX(20px)' : 'translateX(-20px)';

            // Trigger animation
            setTimeout(() => {
                toQuestion.style.opacity = '1';
                toQuestion.style.transform = 'translateX(0)';
            }, 10);
        }, 300);
    }

    // Next button functionality
    nextButton.addEventListener('click', function() {
        if (currentQuestion < quizCards.length) {
            const currentCard = quizCards[currentQuestion-1];
            currentQuestion++;
            const nextCard = quizCards[currentQuestion-1];

            // Animate transition
            animateQuestionTransition(currentCard, nextCard, 'next');

            // Update UI
            document.getElementById('current-question').textContent = currentQuestion;
            prevButton.disabled = false;
            if (currentQuestion === quizCards.length) {
                nextButton.disabled = true;
            }
        }
    });

    // Previous button functionality
    prevButton.addEventListener('click', function() {
        if (currentQuestion > 1) {
            const currentCard = quizCards[currentQuestion-1];
            currentQuestion--;
            const prevCard = quizCards[currentQuestion-1];

            // Animate transition
            animateQuestionTransition(currentCard, prevCard, 'prev');

            // Update UI
            document.getElementById('current-question').textContent = currentQuestion;
            nextButton.disabled = false;
            if (currentQuestion === 1) {
                prevButton.disabled = true;
            }
        }
    });
});

// Quiz toggle functionality
function toggleQuiz() {
    const quizContent = document.getElementById('quiz-content');
    const quizToggle = document.querySelector('.quiz-toggle');
    const quizHeader = document.querySelector('.quiz-header');

    if (quizContent.classList.contains('expanded')) {
        quizContent.classList.remove('expanded');
        quizToggle.classList.remove('expanded');
        quizHeader.setAttribute('aria-expanded', 'false');
    } else {
        quizContent.classList.add('expanded');
        quizToggle.classList.add('expanded');
        quizHeader.setAttribute('aria-expanded', 'true');

        // Ensure the first question is visible
        const firstQuestion = document.getElementById('question-1');
        if (firstQuestion) {
            firstQuestion.style.display = 'flex';
        }

        // Reset current question display
        document.getElementById('current-question').textContent = '1';
    }
}