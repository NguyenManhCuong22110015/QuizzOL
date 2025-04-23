// public/js/loading-spinner.js
import { bouncy } from 'ldrs';

// Register the LDRS component
bouncy.register();

// Replace default spinner with LDRS spinner
document.addEventListener("DOMContentLoaded", () => {
  const spinnerContainer = document.querySelector('.loading-spinner');
  if (spinnerContainer) {
    // Clear default spinner
    spinnerContainer.innerHTML = '';
    
    // Add LDRS spinner
    const spinner = document.createElement('l-bouncy');
    spinner.setAttribute('size', '45');
    spinner.setAttribute('stroke', '5');
    spinner.setAttribute('speed', '2.5');
    spinner.setAttribute('color', 'white');
    spinnerContainer.appendChild(spinner);
  }
});