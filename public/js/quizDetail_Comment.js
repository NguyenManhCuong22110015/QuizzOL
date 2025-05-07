document.addEventListener("DOMContentLoaded", function () {
  console.log("QuizDetail JS loaded");

  // Setup comment form
  setupCommentForm();

  // Setup star rating
  setupStarRating();
});

function setupCommentForm() {
  const commentForm = document.querySelector(".comment-form");
  const commentInput = document.getElementById("commentInput");
  const commentSubmit = document.getElementById("commentSubmit");

  if (commentForm && commentInput && commentSubmit) {
    // Enable/disable submit button based on input content
    commentInput.addEventListener("input", function () {
      commentSubmit.disabled = this.value.trim() === "";
    });

    // Handle form submission
    commentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const quizId = this.dataset.quizId;
      const userId = this.dataset.userId;
      const content = commentInput.value.trim();

      if (!content || !quizId || !userId) {
        console.error("Missing required comment data");
        return;
      }

      sendComment(quizId, userId, content);
    });
  } else {
    console.warn("Comment form elements not found");
  }
}

function setupStarRating() {
  const starContainer = document.querySelector(".star-rating");

  if (starContainer) {
    console.log("Star rating container found:", starContainer);

    const quizId = starContainer.dataset.quizId;
    const userId = starContainer.dataset.userId;
    const stars = starContainer.querySelectorAll(".star");

    console.log(
      "Quiz ID:",
      quizId,
      "User ID:",
      userId,
      "Stars count:",
      stars.length
    );

    if (stars.length > 0) {
      // Add click event to each star
      stars.forEach((star) => {
        star.addEventListener("click", function () {
          const rating = parseInt(this.dataset.rating);
          console.log("Star clicked, rating:", rating);

          // Update star display
          updateStarDisplay(stars, rating);

          // Send rating to server
          sendRating(quizId, userId, rating);
        });
      });

      // Add hover effects
      stars.forEach((star) => {
        star.addEventListener("mouseenter", function () {
          const rating = parseInt(this.dataset.rating);
          highlightStars(stars, rating);
        });

        star.addEventListener("mouseleave", function () {
          resetStarsToCurrentRating(stars);
        });
      });

      // Get current user rating
      fetchUserRating(quizId, userId, stars);
    } else {
      console.error("No star elements found");
    }
  } else {
    console.error("Star rating container not found");
  }
}

function updateStarDisplay(stars, rating) {
  stars.forEach((star) => {
    const starRating = parseInt(star.dataset.rating);
    const icon = star.querySelector("i");

    if (starRating <= rating) {
      icon.className = "fas fa-star";
    } else {
      icon.className = "far fa-star";
    }
  });

  // Store current rating as data attribute
  const container = stars[0].closest(".star-rating");
  container.dataset.userRating = rating;
}

function highlightStars(stars, rating) {
  stars.forEach((star) => {
    const starRating = parseInt(star.dataset.rating);
    const icon = star.querySelector("i");

    if (starRating <= rating) {
      icon.className = "fas fa-star";
    } else {
      icon.className = "far fa-star";
    }
  });
}

function resetStarsToCurrentRating(stars) {
  const container = stars[0].closest(".star-rating");
  const currentRating = parseInt(container.dataset.userRating || 0);

  updateStarDisplay(stars, currentRating);
}

function fetchUserRating(quizId, userId, stars) {
  fetch(`/comment/user-rating/${quizId}/${userId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching user rating");
      }
      return response.json();
    })
    .then((data) => {
      console.log("User rating data:", data);
      if (data && typeof data.rating !== "undefined") {
        updateStarDisplay(stars, data.rating);
      }
    })
    .catch((error) => {
      console.error("Error fetching user rating:", error);
    });
}

function sendRating(quizId, userId, rating) {
  console.log("Sending rating:", { quizId, userId, rating });

  fetch("/comment/add-rating", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quizId, userId, rating }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error saving rating");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Rating saved:", data);

      // Update average rating display
      if (data.averageRating) {
        const avgElement = document.querySelector(".average-rating");
        const countElement = document.querySelector(".rating-count");

        if (avgElement) {
          avgElement.textContent = parseFloat(
            data.averageRating.average
          ).toFixed(1);
        }

        if (countElement) {
          countElement.textContent = `${data.averageRating.count} lượt đánh giá`;
        }
      }

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Đánh giá của bạn đã được lưu.",
        timer: 2000,
        showConfirmButton: false,
      });
    })
    .catch((error) => {
      console.error("Error saving rating:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể lưu đánh giá. Vui lòng thử lại.",
      });
    });
}

function sendComment(quizId, userId, content) {
  console.log("Sending comment:", { quizId, userId, content });

  fetch("/comment/add-comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quizId, userId, content }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error saving comment");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Comment saved:", data);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Bình luận của bạn đã được thêm.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Get user info from meta tags or session
      const userName =
        document.querySelector('meta[name="user-name"]')?.content ||
        "Người dùng";
      const userAvatar = document.querySelector(
        'meta[name="user-avatar"]'
      )?.content;
      const userInitial = userName.charAt(0).toUpperCase();

      // Add comment to UI
      addCommentToUI(userName, userInitial, userAvatar, content);

      // Clear input
      document.getElementById("commentInput").value = "";
      document.getElementById("commentSubmit").disabled = true;
    })
    .catch((error) => {
      console.error("Error saving comment:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể gửi bình luận. Vui lòng thử lại.",
      });
    });
}

function addCommentToUI(authorName, authorInitial, authorAvatar, commentText) {
  const commentsList = document.querySelector(".comments-list");
  const noCommentsMsg = commentsList.querySelector("p");

  // Remove "no comments" message if it exists
  if (noCommentsMsg && !commentsList.querySelector(".comment-item")) {
    noCommentsMsg.remove();
  }

  // Create new comment element
  const commentItem = document.createElement("div");
  commentItem.className = "comment-item";

  const avatarContent = authorAvatar
    ? `<img src="${authorAvatar}" alt="${authorName} avatar" style="width: 100%; height: 100%; border-radius: 50%;">`
    : authorInitial;

  commentItem.innerHTML = `
    <div class="comment-avatar">${avatarContent}</div>
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author">${authorName}</span>
        <span class="comment-time">Vừa xong</span>
      </div>
      <p class="comment-text">${commentText}</p>
    </div>
  `;

  // Insert at the top of the list
  commentsList.insertBefore(commentItem, commentsList.firstChild);

  // Update comment count
  const commentTitle = document.querySelector(".comments-title");
  const commentCount = commentsList.querySelectorAll(".comment-item").length;
  if (commentTitle) {
    commentTitle.innerHTML = `<i class="far fa-comment-dots"></i> Bình luận (${commentCount})`;
  }
}
