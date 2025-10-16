// Test Data
const testData = `Category,Question
Data Science/Machine Learning,What is the difference between supervised and unsupervised learning?
Data Science/Machine Learning,Explain the concept of bias-variance trade-off.
Data Science/Machine Learning,What is overfitting and how can you prevent it?
Data Science/Machine Learning,Describe the purpose of a confusion matrix.
Data Science/Machine Learning,When would you use a Random Forest model over a single Decision Tree?
Data Science/Machine Learning,What is the activation function and why is it used in neural networks?
Data Science/Machine Learning,Explain the difference between classification and regression.
Data Science/Machine Learning,What is 'feature engineering' and why is it important?
Data Science/Machine Learning,Describe the K-Means clustering algorithm.
Data Science/Machine Learning,What is gradient descent and how does it work?
Data Science/Machine Learning,What is the role of the learning rate in training a model?
Data Science/Machine Learning,How do you handle missing values in a dataset?
Data Science/Machine Learning,What is a ROC curve and what does the AUC represent?
Data Science/Machine Learning,Explain the concept of dimensionality reduction.
Data Science/Machine Learning,What is the difference between precision and recall?
---
Databases/SQL,Write an SQL query to find the second highest salary from a table.
Databases/SQL,Explain the difference between a \`JOIN\` and a \`UNION\`.
Databases/SQL,What are ACID properties in the context of databases?
Databases/SQL,What is a primary key and a foreign key?
Databases/SQL,Explain database normalization (1NF, 2NF, 3NF).
Databases/SQL,What is an index in a database and how does it improve performance?
Databases/SQL,What is a stored procedure?
Databases/SQL,Differentiate between OLTP and OLAP systems.
Databases/SQL,What is denormalization and when is it useful?
Databases/SQL,Explain the concept of a transaction in SQL.
---
Programming/Algorithms,Explain the difference between an array and a linked list.
Programming/Algorithms,What is the time complexity of Bubble Sort?
Programming/Algorithms,Describe the concept of recursion.
Programming/Algorithms,Differentiate between a stack and a queue.
Programming/Algorithms,What is polymorphism in Object-Oriented Programming (OOP)?
Programming/Algorithms,Explain the concept of 'Big O' notation.
Programming/Algorithms,What is a hash table (or hash map)?
Programming/Algorithms,Describe the merge sort algorithm.
Programming/Algorithms,What are the four pillars of OOP?
Programming/Algorithms,Explain the difference between pass-by-value and pass-by-reference.
---
Computer Science Fundamentals,What is the function of an operating system?
Computer Science Fundamentals,Explain the difference between a process and a thread.
Computer Science Fundamentals,What is virtual memory?
Computer Science Fundamentals,Describe the concept of 'deadlock' in an operating system.
Computer Science Fundamentals,What are the different stages of the compilation process?
Computer Science Fundamentals,Explain how a CPU executes an instruction.
Computer Science Fundamentals,What is caching and how does it improve performance?
Computer Science Fundamentals,Describe the Von Neumann architecture.
Computer Science Fundamentals,What is the purpose of a semaphore?
Computer Science Fundamentals,Explain the concept of concurrency vs. parallelism.
---
Networking/Security,Explain the difference between TCP and UDP.
Networking/Security,What are the seven layers of the OSI model?
Networking/Security,What is a subnet mask and how is it used?
Networking/Security,Describe the purpose of a firewall.
Networking/Security,What is a DNS server and how does it work?
Networking/Security,Explain the difference between HTTP and HTTPS.
Networking/Security,What is a DoS attack?
Networking/Security,Describe the concept of public key infrastructure (PKI).
Networking/Security,What is an IP address and how many versions are currently in use?
Networking/Security,Explain the function of a router vs. a switch.
---
Cloud Computing/DevOps,What is the difference between IaaS, PaaS, and SaaS?
Cloud Computing/DevOps,Explain the concept of continuous integration/continuous deployment (CI/CD).
Cloud Computing/DevOps,What is a microservices architecture?
Cloud Computing/DevOps,Describe the benefits of using containers (e.g., Docker).
Cloud Computing/DevOps,What is serverless computing?
Cloud Computing/DevOps,Explain the purpose of version control (e.g., Git).
Cloud Computing/DevOps,What is infrastructure as code (IaC)?
Cloud Computing/DevOps,Describe the role of Kubernetes.
Cloud Computing/DevOps,What is a virtual machine?
Cloud Computing/DevOps,Explain the concept of load balancing.
---
Data Science/ML Deep Dive,Explain cross-validation and its types.
Data Science/ML Deep Dive,What is regularization and its two main types (L1 and L2)?
Data Science/ML Deep Dive,Differentiate between precision, recall, and F1-score.
Data Science/ML Deep Dive,How do you select the optimal number of clusters in K-Means?
Data Science/ML Deep Dive,What is Principal Component Analysis (PCA)?
Data Science/ML Deep Dive,Describe the concept of ensemble learning.
Data Science/ML Deep Dive,What is a vanishing gradient problem?
Data Science/ML Deep Dive,Explain A/B testing in the context of data science.
Data Science/ML Deep Dive,What are hyperparameters and how do you tune them?
Data Science/ML Deep Dive,What is a time series analysis?
---
IT Management/Project,What is Agile methodology?
IT Management/Project,Describe the difference between a Waterfall and an Agile approach.
IT Management/Project,What is a stakeholder in a project?
IT Management/Project,Explain the concept of a Minimum Viable Product (MVP).
IT Management/Project,What is a bug triage process?
Data Science/ML Deep Dive,What are tree-based models?
Data Science/ML Deep Dive,Explain the concept of bias in data.
Data Science/ML Deep Dive,How do you evaluate a regression model?
Data Science/ML Deep Dive,What is a neural network perceptron?
Data Science/ML Deep Dive,Describe the use of Natural Language Processing (NLP).
---
Networking/Security Deep Dive,What is ARP (Address Resolution Protocol)?
Networking/Security Deep Dive,Explain the concept of three-way handshake in TCP.
Networking/Security Deep Dive,What is a VPN?
Networking/Security Deep Dive,Describe the difference between symmetric and asymmetric encryption.
Networking/Security Deep Dive,What is the function of DHCP?
Databases/SQL Deep Dive,Explain the concept of deadlock prevention and detection.
Databases/SQL Deep Dive,What is a NoSQL database and when would you use it?
Databases/SQL Deep Dive,Describe the difference between MongoDB and traditional RDBMS.
Databases/SQL Deep Dive,What is sharding?
Databases/SQL Deep Dive,Explain optimistic vs. pessimistic locking.
---
Programming/Algorithms Deep Dive,Explain Dijkstra's algorithm.
Programming/Algorithms Deep Dive,What is a graph data structure?
Programming/Algorithms Deep Dive,Describe the use of a Heap data structure.
Programming/Algorithms Deep Dive,What is memoization?
Programming/Algorithms Deep Dive,Explain the concept of dynamic programming.
Computer Science Fundamentals Deep Dive,What is a virtual address vs. a physical address?
Computer Science Fundamentals Deep Dive,Explain the concept of paging and segmentation.
Computer Science Fundamentals Deep Dive,Describe the function of the BIOS/UEFI.
Computer Science Fundamentals Deep Dive,What is thrashing?
Computer Science Fundamentals Deep Dive,Differentiate between RISC and CISC architectures.`;

// Sidebar Toggle
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const main = document.querySelector('.main');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    main.classList.toggle('sidebar-active');
    sidebarToggle.innerHTML = sidebar.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        main.classList.remove('sidebar-active');
        sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// Parse test data
let categories = {};
let currentTest = null;
let currentQuestionIndex = 0;
let testStartTime = null;
let answers = [];

function parseTestData() {
    const sections = testData.split('---').map(section => section.trim());
    sections.forEach(section => {
        const lines = section.split('\n').filter(line => line.trim());
        if (lines.length > 1) { // Skip header if present
            lines.forEach(line => {
                const [category, question] = line.split(',');
                if (category && question) {
                    if (!categories[category]) {
                        categories[category] = [];
                    }
                    categories[category].push(question);
                }
            });
        }
    });
}

// Populate category grid
function populateCategories() {
    const categoryGrid = document.getElementById('category-grid');
    categoryGrid.innerHTML = '';

    Object.keys(categories).forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <h3>${category}</h3>
            <p>${categories[category].length} questions</p>
        `;
        categoryCard.addEventListener('click', () => startTest(category));
        categoryGrid.appendChild(categoryCard);
    });
}

// Start test for a category
function startTest(category) {
    currentTest = category;
    currentQuestionIndex = 0;
    answers = new Array(categories[category].length).fill('');
    testStartTime = Date.now();

    document.getElementById('category-grid').style.display = 'none';
    document.getElementById('test-container').style.display = 'block';
    document.getElementById('test-category').textContent = category;
    document.getElementById('total-questions').textContent = categories[category].length;
    document.getElementById('test-results').style.display = 'none';

    showQuestion();
}

// Show current question
function showQuestion() {
    const question = categories[currentTest][currentQuestionIndex];
    document.getElementById('test-question').textContent = question;
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('answer-input').value = answers[currentQuestionIndex];

    // Update button states
    document.getElementById('prev-question').disabled = currentQuestionIndex === 0;
    document.getElementById('next-question').disabled = currentQuestionIndex === categories[currentTest].length - 1;
    document.getElementById('submit-test').style.display = currentQuestionIndex === categories[currentTest].length - 1 ? 'block' : 'none';
}

// Navigation functions
function nextQuestion() {
    if (currentQuestionIndex < categories[currentTest].length - 1) {
        saveAnswer();
        currentQuestionIndex++;
        showQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        saveAnswer();
        currentQuestionIndex--;
        showQuestion();
    }
}

function saveAnswer() {
    answers[currentQuestionIndex] = document.getElementById('answer-input').value;
}

function submitTest() {
    saveAnswer();
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - testStartTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    const answeredCount = answers.filter(answer => answer.trim() !== '').length;

    document.getElementById('answered-count').textContent = answeredCount;
    document.getElementById('total-count').textContent = categories[currentTest].length;
    document.getElementById('time-taken').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('test-results').style.display = 'block';
}

function backToCategories() {
    document.getElementById('category-grid').style.display = 'grid';
    document.getElementById('test-container').style.display = 'none';
    currentTest = null;
}

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetSection = btn.dataset.section;

        // Update active nav button
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show target section
        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetSection).classList.add('active');
    });
});

// Flashcard Functionality
const flashcard = document.getElementById('flashcard');
const flipBtn = document.querySelector('.flip');
const nextCardBtn = document.querySelector('.next-card');

let currentFlashcardIndex = 0;
let allQuestions = [];

function initializeFlashcards() {
    // Collect all questions from test data
    Object.values(categories).forEach(categoryQuestions => {
        allQuestions = allQuestions.concat(categoryQuestions);
    });
    // Shuffle questions
    allQuestions = allQuestions.sort(() => Math.random() - 0.5);
}

function updateFlashcard() {
    if (allQuestions.length > 0) {
        const question = allQuestions[currentFlashcardIndex];
        const frontElement = flashcard.querySelector('.flashcard-front h3');
        const backElement = flashcard.querySelector('.flashcard-back p');
        
        frontElement.textContent = question;
        backElement.textContent = "Think about your answer, then flip to see a hint or explanation.";
    }
}

flipBtn.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
});

nextCardBtn.addEventListener('click', () => {
    flashcard.classList.remove('flipped');
    currentFlashcardIndex = (currentFlashcardIndex + 1) % allQuestions.length;
    updateFlashcard();
    setTimeout(() => {
        flashcard.classList.add('flipped');
    }, 100);
});

// Quiz Functionality
const optionBtns = document.querySelectorAll('.option-btn');
const nextBtn = document.querySelector('.next');

optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove previous selection
        optionBtns.forEach(b => b.classList.remove('selected'));
        // Add selection
        btn.classList.add('selected');
        // Enable next button
        nextBtn.disabled = false;
    });
});

// Add some animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationDelay = '0s';
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

// Observe animated elements
document.querySelectorAll('.stat-card, .action-btn, .question-card, .flashcard, .progress-item, .category-card, .test-results').forEach(el => {
    observer.observe(el);
});

// Mobile menu toggle (if needed in future)
function checkMobile() {
    if (window.innerWidth <= 768) {
        // Add mobile-specific behaviors if needed
    }
}

window.addEventListener('resize', checkMobile);
checkMobile();

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add some interactive feedback
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tests
    parseTestData();
    populateCategories();
    initializeFlashcards();
    updateFlashcard();

    // Test event listeners
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('prev-question').addEventListener('click', prevQuestion);
    document.getElementById('submit-test').addEventListener('click', submitTest);
    document.getElementById('back-to-categories').addEventListener('click', backToCategories);
    document.getElementById('retake-test').addEventListener('click', () => startTest(currentTest));

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
            ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    button {
        position: relative;
        overflow: hidden;
    }

    body.loaded {
        animation: fadeIn 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);