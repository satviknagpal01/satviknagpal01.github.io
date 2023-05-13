// Add JavaScript functionality here

// Example code: Toggle dropdown menu
const dropdownMenu = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');

dropdownMenu.addEventListener('click', () => {
  dropdownContent.classList.toggle('show');
});

// Example code: Submit newsletter subscription form
const newsletterForm = document.querySelector('.newsletter-form');

newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const emailInput = document.querySelector('#email');
  const email = emailInput.value;

  // Perform validation and submit the form
  if (isValidEmail(email)) {
    submitNewsletterForm(email);
    showAlert('Thank you for subscribing!');
    newsletterForm.reset();
  } else {
    showAlert('Please enter a valid email address.', 'error');
  }
});

function isValidEmail(email) {
  // Perform email validation logic
  // Return true if valid, false otherwise
  // Example validation: Check for presence of '@' symbol
  return email.includes('@');
}

function submitNewsletterForm(email) {
  // Perform form submission logic
  // Example code: Send email to server for processing
  console.log(`Subscribed with email: ${email}`);
}

function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('alert', type);
  alertDiv.textContent = message;

  document.body.appendChild(alertDiv);

  // Remove alert after 3 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}
