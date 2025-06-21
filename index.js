document.addEventListener("DOMContentLoaded", function () {
    const bookDropdown = document.getElementById("categoryDropdown");
    const bookList = document.getElementById("bookList");
    const booksContainer = document.getElementById("booksContainer");
    const inProgressSection = document.getElementById("current-book");
    const dashboardLink = document.getElementById("dashboard-link");
    const dashboardContent = document.getElementById("dashboard-content");
    const dashboardAlarmButton = document.getElementById("set-dashboard-alarm-btn");
    const adminAlarmButton = document.getElementById("set-admin-alarm-btn");
    const alarmTimeInput = document.getElementById("alarm-time");
    const alarmMessageInput = document.getElementById("alarm-message-input");
    const bookLink = document.getElementById("categories-link");
    const categoriesContent = document.getElementById("categories-content");
    const booksList = document.getElementById("books-list");
    const adminLink = document.getElementById("admin-link");
    const adminContent = document.getElementById("admin-content");
    const loginButton = document.getElementById("login-button");
    const loginModal = document.getElementById("login-modal");
    const closeButton = document.querySelector(".close-button");
    const loginForm = document.getElementById("login-form");
    const loginMessage = document.getElementById("login-message");
    const userDisplay = document.getElementById("user-display");
    const logoutButton = document.getElementById("logout-button");

     // Define categories
     const categories = {
        "Fiction": ["The Great Gatsby", "To Kill a Mockingbird"],
        "Non-Fiction": ["Sapiens", "Educated"],
        "Science": ["A Brief History of Time", "The Selfish Gene"],
        "History": ["The Diary of Anne Frank", "Guns, Germs, and Steel"]
    };
    let currentUserType = localStorage.getItem("loggedInUser") || null;

    // Function to display logged-in user
    function updateUserDisplay() {
        if (currentUserType) {
            userDisplay.innerHTML = `<i class="fas fa-user"></i> Logged in as: ${currentUserType}`;
            loginButton.style.display = "none"; // Hide login button when logged in
            logoutButton.style.display = "block"; // Show logout button
            displayFeatures(currentUserType);
        } else {
            userDisplay.innerHTML = `<i class="fas fa-user"></i> Not logged in`;
            loginButton.style.display = "block"; // Show login button when not logged in
            logoutButton.style.display = "none"; // Hide logout button
            displayFeatures(null);
        }
    }

    // Open login modal
    loginButton.addEventListener("click", function () {
        loginModal.style.display = "block";
    });

    // Close login modal
    closeButton.addEventListener("click", function () {
        loginModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    });

    // Handle login form submission
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const userType = document.getElementById("user-type").value;

        const isAuthenticated = await authenticateUser(username, password, userType);

        if (isAuthenticated) {
            currentUserType = userType;
            localStorage.setItem("loggedInUser", userType); // Store login session
            loginMessage.textContent = "Login successful!";
            loginModal.style.display = "none";
            updateUserDisplay();
        } else {
            loginMessage.textContent = "Invalid credentials. Please try again.";
        }
    });

    // Mock authentication function
    async function authenticateUser(username, password, userType) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(
                    (username === "admin" && password === "admin" && userType === "admin") ||
                    (username === "user" && password === "user" && userType === "user")
                );
            }, 1000);
        });
    }

    // Logout function
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("loggedInUser"); // Clear session
        currentUserType = null;
        updateUserDisplay();
    });


    const categoryButtons = document.querySelectorAll(".category-btn");
    categoryButtons.forEach(button => {
        button.addEventListener("click", function () {
            const category = button.dataset.category;
            displayBooks(category);
        });
    });

    // Display books based on selected category
    function displayBooks(category) {
        booksList.innerHTML = ''; // Clear previous book list
        const books = categories[category];
        if (books) {
            books.forEach(book => {
                const li = document.createElement("li");
                li.textContent = book; // Display book title
                booksList.appendChild(li);
            });
        } else {
            booksList.innerHTML = '<li>No books available in this category.</li>'; // Message if no books found
        }
        categoriesContent.style.display = "block"; // Show categories content
    }
    
    // Fetch books from Gutendex API
    async function fetchBooks() {
        try {
            const response = await fetch("https://gutendex.com/books/?languages=en");
            const data = await response.json();
            
            // Sort books alphabetically and limit to 5
            const sortedBooks = data.results.sort((a, b) => a.title.localeCompare(b.title)).slice(0, 5);
            
            populateBookDropdown(sortedBooks);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    }

    // Populate dropdown with books
    function populateBookDropdown(books) {
        books.forEach((book) => {
            let option = document.createElement("option");
            option.value = book.formats["text/html"] || book.formats["application/pdf"] || "#";
            option.textContent = book.title;
            bookDropdown.appendChild(option);
        });
    }

    // Display selected book in reader and update In-Progress section
    bookDropdown.addEventListener("change", function () {
        const selectedBookUrl = bookDropdown.value;
        const selectedBookTitle = bookDropdown.options[bookDropdown.selectedIndex].text;
        
        if (selectedBookUrl && selectedBookUrl !== "#") {
            booksContainer.innerHTML = `<iframe src="${selectedBookUrl}" width="100%" height="500px"></iframe>`;
            inProgressSection.textContent = `Currently Reading: ${selectedBookTitle}`;
        } else {
            booksContainer.innerHTML = `<p>Selected book format is not available for reading.</p>`;
        }
    });

    // Show dashboard sections when clicking the dashboard link
    dashboardLink.addEventListener("click", function () {
        dashboardContent.style.display = "block";
        categoriesContent.style.display = "none";
        adminContent.style.display = "none"; 
    });
    bookLink.addEventListener("click", function () {
        categoriesContent.style.display = "block"; // Show categories content
        dashboardContent.style.display = "none"; 
        adminContent.style.display = "none"; 
    });
    adminLink.addEventListener("click", function () {
        if (currentUserType === "admin") {
            adminContent.style.display = "block";
            dashboardContent.style.display = "none";
            categoriesContent.style.display = "none";
        } else {
            alert("Access denied. Admins only.");
        }
    });



  

    dashboardAlarmButton.addEventListener("click", async function () {
        const phoneNumber = document.getElementById("dashboard-phoneNumber").value;
        const message = document.getElementById("dashboard-message").value;
        const alertTime = document.getElementById("dashboard-alarm-time").value;
        const apiUrl = "http://localhost:8080/api/sms/schedule"; // Update with your actual API URL

        await setAlarm(phoneNumber, message, alertTime, apiUrl);
    });

    // Set alarm for the admin section (due date)
    adminAlarmButton.addEventListener("click", async function () {
        const phoneNumber = document.getElementById("admin-phoneNumber").value;
        const message = document.getElementById("admin-message").value;
        const alertTime = document.getElementById("admin-alarm-time").value;
        const apiUrl = "http://localhost:8080/api/sms/schedule"; // Update with your actual API URL

        await setAlarm(phoneNumber, message, alertTime, apiUrl);
    });

    // Function to set alarm and send SMS notification
    async function setAlarm(phoneNumber, message, alertTime, apiUrl) {
        if (!alertTime || !message) {
            alert("Please enter both time and message for the alarm.");
            return;
        }

        const fullApiUrl = `${apiUrl}?phoneNumber=${encodeURIComponent(phoneNumber)}&message=${encodeURIComponent(message)}&alertTime=${encodeURIComponent(alertTime)}`;

        try {
            const response = await fetch(fullApiUrl, {
                method: "POST",
                headers: { "Accept": "*/*" }
            });
            
            const responseText = await response.text();
            console.log("Server Response:", response.status, responseText);
            
            if (response.ok) {
                alert("Alarm set and SMS scheduled successfully!");
            } else {
                alert(`Failed to set alarm. Server Response: ${responseText}`);
            }
        } catch (error) {
            console.error("Error setting alarm:", error);
            alert("Error connecting to the server.");
        }
    }
    fetchBooks();
    updateUserDisplay();
    populateCategories();
    
});
