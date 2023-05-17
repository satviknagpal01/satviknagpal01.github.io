// Sample JavaScript file

// Function to handle dropdown menu
function toggleDropdown() {
  var dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");
}

// Function to close dropdown when clicked outside
window.onclick = function(event) {
  if (!event.target.matches(".dropdown")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var dropdown = dropdowns[i];
      if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
      }
    }
  }
};

// Sample function to fetch latest blog posts from an API
function fetchLatestBlogPosts() {
  // Code to fetch blog posts and update the section
  // ...
}

// Sample function to handle newsletter subscription
function subscribeNewsletter() {
  var emailInput = document.getElementById("newsletter-email");
  var email = emailInput.value;

  // Code to subscribe the email to the newsletter
  // ...
  console.log("Subscribed to newsletter:", email);

  // Clear input field after subscription
  emailInput.value = "";
}

// Call functions or attach event listeners as needed
fetchLatestBlogPosts();

var newsletterForm = document.getElementById("newsletter-form");
newsletterForm.addEventListener("submit", function(event) {
  event.preventDefault();
  subscribeNewsletter();
});
