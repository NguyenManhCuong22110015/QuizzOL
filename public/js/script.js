document.addEventListener("DOMContentLoaded", function () {
  // Initialize tooltips
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Handle smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // Demo Quiz Functionality
  const demoSubmitBtn = document.getElementById("demo-submit");
  if (demoSubmitBtn) {
    demoSubmitBtn.addEventListener("click", function () {
      // Get selected answers
      const q1Answer = document.querySelector(
        'input[name="q1"]:checked'
      )?.value;
      const q2Answer = document.querySelector(
        'input[name="q2"]:checked'
      )?.value;

      // Check answers
      let correctAnswers = 0;

      if (q1Answer === "Mars") {
        document
          .getElementById("q1a")
          .parentNode.classList.add("text-success", "fw-bold");
        correctAnswers++;
      } else if (q1Answer) {
        document
          .querySelector(`input[name="q1"][value="${q1Answer}"]`)
          .parentNode.classList.add("text-danger");
        document
          .getElementById("q1a")
          .parentNode.classList.add("text-success", "fw-bold");
      } else {
        document
          .getElementById("q1a")
          .parentNode.classList.add("text-success", "fw-bold");
      }

      if (q2Answer === "William Shakespeare") {
        document
          .getElementById("q2b")
          .parentNode.classList.add("text-success", "fw-bold");
        correctAnswers++;
      } else if (q2Answer) {
        document
          .querySelector(`input[name="q2"][value="${q2Answer}"]`)
          .parentNode.classList.add("text-danger");
        document
          .getElementById("q2b")
          .parentNode.classList.add("text-success", "fw-bold");
      } else {
        document
          .getElementById("q2b")
          .parentNode.classList.add("text-success", "fw-bold");
      }

      // Show result and disable inputs
      const totalQuestions = 2;
      const scoreMessage = `You scored ${correctAnswers}/${totalQuestions}!`;

      // Disable all inputs
      document.querySelectorAll('input[name^="q"]').forEach((input) => {
        input.disabled = true;
      });

      // Change button text to show score
      this.innerHTML = scoreMessage;

      // Add try again functionality
      setTimeout(() => {
        this.innerHTML += " <small>Try again?</small>";
        this.addEventListener(
          "click",
          () => {
            location.reload();
          },
          { once: true }
        );
      }, 1500);
    });
  }

  // Animation on scroll functionality
  const animateOnScroll = function () {
    const elements = document.querySelectorAll(
      ".card, .feature-icon-container, .step-number, .hero-image-container"
    );

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (elementPosition < windowHeight * 0.9) {
        element.classList.add("animated");
      }
    });
  };

  // Initial check for elements in view
  animateOnScroll();

  // Check on scroll
  window.addEventListener("scroll", animateOnScroll);

  // Counter animation for stats section
  function animateCounters() {
    const counters = document.querySelectorAll(".counter");
    const speed = 200; // The lower the slower

    counters.forEach((counter) => {
      const updateCount = () => {
        // Remove any non-numeric characters for the target
        const target = parseInt(counter.innerText.replace(/\D/g, ""));
        // Strip any existing text to get current count
        const count = parseInt(counter.getAttribute("data-count") || 0);

        // Set data attribute if not present
        if (!counter.getAttribute("data-target")) {
          counter.setAttribute("data-target", target);
        }

        // Calculate increment
        const inc = Math.ceil(target / speed);

        // If current count < target, add increment
        if (count < target) {
          counter.setAttribute("data-count", count + inc);
          // For values like 5M+, keep the suffix
          const suffix = counter.innerText.match(/[^\d]/g)?.join("") || "";
          counter.innerText = count + inc + suffix;
          setTimeout(updateCount, 1);
        } else {
          counter.innerText =
            counter.getAttribute("data-target") +
            (counter.innerText.includes("+") ? "+" : "");
        }
      };

      // Add intersection observer to start counter when visible
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              updateCount();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(counter);
    });
  }

  animateCounters();
});
