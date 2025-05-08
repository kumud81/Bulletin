const API_KEY = "34193d2003824e1499d2de1e4be7efa8";
const url = "https://newsapi.org/v2/everything?q=";

// Initialize app
window.addEventListener("load", () => {
    fetchNews("India");
    displayNotes();
    checkDarkModePreference();
});

function reload() {
    window.location.reload();
}



// ===== Login System =====
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// Initialize login state on load
window.addEventListener('load', () => {
    updateAuthUI();
});

function updateAuthUI() {
    const authButton = document.getElementById('auth-button');
    const notesSection = document.getElementById('notes-section');
    
    if (isLoggedIn) {
        authButton.textContent = 'Logout';
        notesSection.style.display = 'block';
    } else {
        authButton.textContent = 'Login';
        notesSection.style.display = 'none';
    }
}

function openModal() {
    document.getElementById('login-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('login-message').textContent = '';
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in a real app, you'd have proper authentication)
    if (username && password) {
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        updateAuthUI();
        closeModal();
        displayNotes(); // Refresh notes display
    } else {
        document.getElementById('login-message').textContent = 'Please enter both username and password';
    }
}

function handleLogout() {
    isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    updateAuthUI();
}

// Auth button click handler
document.getElementById('auth-button').addEventListener('click', function() {
    if (isLoggedIn) {
        handleLogout();
    } else {
        openModal();
    }
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('login-modal');
    if (event.target === modal) {
        closeModal();
    }
});

// News Fetching Functions
async function fetchNews(query) {
    try {
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        const data = await res.json();
        bindData(data.articles);
    } catch (error) {
        console.error("Error fetching news:", error);
        alert("Failed to fetch news. Please try again later.");
    }
}

async function fetchNewsBySource(source) {
    try {
        const res = await fetch(`https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${API_KEY}`);
        const data = await res.json();
        bindData(data.articles);
        toggleSlideBar();
    } catch (error) {
        console.error("Error fetching news by source:", error);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const saveBtn = cardClone.querySelector(".save-article");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description || "No description available";

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    // Check if article is saved
    const savedArticles = JSON.parse(localStorage.getItem("savedArticles")) || [];
    const isSaved = savedArticles.some(saved => saved.url === article.url);
    if (isSaved) {
        saveBtn.classList.add("saved");
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
    }

    saveBtn.onclick = (e) => {
        e.stopPropagation();
        toggleSaveArticle(saveBtn, article);
    };

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

// Navigation Functions
let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

// Search Functionality
const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

searchText.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchButton.click();
    }
});

// UI Toggle Functions
function toggleSlideBar() {
    document.getElementById("slide-bar").classList.toggle("active");
}

function toggleNotes() {
    document.querySelector(".notes-container").classList.toggle("active");
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const icon = document.querySelector(".dark-mode-toggle i");
    icon.classList.toggle("fa-moon");
    icon.classList.toggle("fa-sun");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
}

function checkDarkModePreference() {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        const icon = document.querySelector(".dark-mode-toggle i");
        icon.classList.replace("fa-moon", "fa-sun");
    }
}

// Scroll to Notes Function
function scrollToNotes() {
    document.querySelector('.notes-container').scrollIntoView({ 
        behavior: 'smooth' 
    });
    // Highlight the notes section
    const notesSection = document.querySelector('.notes-container');
    notesSection.style.boxShadow = '0 0 0 3px var(--primary)';
    setTimeout(() => {
        notesSection.style.boxShadow = 'none';
    }, 2000);
}

// Save Article Functionality
function toggleSaveArticle(button, article) {
    button.classList.toggle("saved");
    const isSaved = button.classList.contains("saved");
    
    button.innerHTML = isSaved 
        ? '<i class="fas fa-bookmark"></i>' 
        : '<i class="far fa-bookmark"></i>';
    
    const savedArticles = JSON.parse(localStorage.getItem("savedArticles")) || [];
    
    if (isSaved) {
        savedArticles.push(article);
    } else {
        const index = savedArticles.findIndex(a => a.url === article.url);
        if (index !== -1) savedArticles.splice(index, 1);
    }
    
    localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
}

// Notes Functions
function saveNote() {
    const noteInput = document.getElementById("note-input");
    const noteText = noteInput.value.trim();
    
    if (!noteText) return alert("Note cannot be empty!");

    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push(noteText);
    localStorage.setItem("notes", JSON.stringify(notes));

    noteInput.value = "";
    displayNotes();
}

function displayNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const notesList = document.getElementById("notes-list");

    notesList.innerHTML = "";

    notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${note}</span>
            <button onclick="deleteNote(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        notesList.appendChild(li);
    });
}

function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
}

function downloadNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    if (notes.length === 0) return alert("No notes to download!");

    const blob = new Blob([notes.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bulletin-notes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Close panels when clicking outside
document.addEventListener("click", function(event) {
    const slideBar = document.getElementById("slide-bar");
    const menuButton = document.getElementById("menu-button");
    const notesPanel = document.querySelector(".notes-container");
    const notesButton = document.getElementById("notes-button");
    
    if (!slideBar.contains(event.target) && !menuButton.contains(event.target)) {
        slideBar.classList.remove("active");
    }
    
    if (!notesPanel.contains(event.target) && !notesButton.contains(event.target)) {
        notesPanel.classList.remove("active");
    }
});