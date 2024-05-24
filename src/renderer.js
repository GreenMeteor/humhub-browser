// Import necessary modules
const { ipcRenderer } = require('electron');

// Function to handle form submission and send IPC message with new URL
function handleSubmit(event) {
  event.preventDefault();
  const urlInput = document.getElementById('url-input');
  const url = urlInput.value.trim();
  if (url) {
    ipcRenderer.send('change-url', url); // Send IPC message with the new URL
  }
}

// Add event listener to the form for submitting the URL
document.getElementById('url-form').addEventListener('submit', handleSubmit);
