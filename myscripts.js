// Import required Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFAgtGKIv1FFBa3BJHxEKTUNCovzhe87Q",
  authDomain: "movie-review-2331427-nirdosh.firebaseapp.com",
  projectId: "movie-review-2331427-nirdosh",
  storageBucket: "movie-review-2331427-nirdosh.appspot.com",
  messagingSenderId: "436479624616",
  appId: "1:436479624616:web:0b9577c8a3dd6afcf4099d"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let unsubscribe;

// Function to add a review
function addReview(movieName, director, rating, releaseDate, actor) {
  return addDoc(collection(db, "movies_review"), {
    movie_name: movieName,
    director: director,
    rating: rating,
    release_date: releaseDate,
    actor: actor
  });
}

// Function to update a review
function updateReview(reviewId, data) {
  const reviewRef = doc(db, "movies_review", reviewId);
  return updateDoc(reviewRef, data);
}

// Function to delete a review
function deleteReview(reviewId) {
  return deleteDoc(doc(db, "movies_review", reviewId));
}

// Get a live data snapshot (i.e. auto-refresh) of our Reviews collection
function getReviews(sortByField) {
  const q = query(collection(db, "movies_review"));
  unsubscribe = onSnapshot(q, (snapshot) => {
    // Get the data from Firestore
    const reviews = [];
    snapshot.forEach((doc) => {
      const reviewData = doc.data();
      reviews.push({
        id: doc.id,
        movieName: reviewData.movie_name,
        director: reviewData.director,
        rating: reviewData.rating,
        releaseDate: reviewData.release_date.toDate(), // Assuming release_date is a Firestore Timestamp
        actor: reviewData.actor,
      });
    });

    // Sort the reviews based on the selected field
    reviews.sort((a, b) => {
      const fieldA = a[sortByField];
      const fieldB = b[sortByField];

      if (sortByField === "rating") {
        return fieldA - fieldB;
      } else if (sortByField === "releaseDate") {
        return fieldA.getTime() - fieldB.getTime();
      } else {
        // Sort as strings
        const stringA = fieldA.toLowerCase();
        const stringB = fieldB.toLowerCase();
        if (stringA < stringB) {
          return -1;
        }
        if (stringA > stringB) {
          return 1;
        }
        return 0;
      }
    });

    // Display the sorted reviews
    displayReviews(reviews);
  });
}

/// Function to display reviews in the HTML table
function displayReviews(reviews) {
  // Empty HTML table
  $("#reviewList").empty();

  // Loop through reviews and add to HTML table
  reviews.forEach((review) => {
    const formattedReleaseDate = `${review.releaseDate.getFullYear()}-${review.releaseDate.getMonth() + 1
      }-${review.releaseDate.getDate()}`;
    const tableRow = `
          <tr>
            <td>${review.movieName}</td>
            <td>${review.director}</td>
            <td>${review.rating}/5</td>
            <td>${formattedReleaseDate}</td>
            <td>${review.actor}</td>
            <td><button class='btn btn-primary editButton' data-id='${review.id}'>Edit</button></td>
            <td><button class='btn btn-danger deleteButton' data-id='${review.id}'>Delete</button></td>
          </tr>
        `;

    $("#reviewList").append(tableRow);
  });


  // Display review count
  $("#mainTitle").html(reviews.length + " movie reviews in the list");

  // Attach event listeners for edit buttons
  $(".editButton").click(function () {
    const reviewId = $(this).data("id");
    const review = reviews.find((r) => r.id === reviewId);
    populateEditModal(review);
    $("#editModal").modal("show");
  });

  // Attach event listeners for delete buttons
  $(".deleteButton").click(function () {
    const reviewId = $(this).data("id");
    $("#deleteModal").modal("show");

    // Confirm delete button clicked
    $("#confirmDeleteButton").click(function () {
      deleteReview(reviewId);
      $("#deleteModal").modal("hide");
    });
  });
}

/// Function to populate the edit modal with review data
function populateEditModal(review) {
  $("#editMovieName").val(review.movieName);
  $("#editMovieRating").val(review.rating);
  $("#editMovieDirector").val(review.director);
  const formattedReleaseDate = review.releaseDate.toISOString().split('T')[0];
  $("#editMovieReleaseDate").val(formattedReleaseDate);
  $("#editActor").val(review.actor);

  // Clear error message when modal is closed
  $("#editModal").on("hidden.bs.modal", function () {
    $("#editError").hide();
    // Remove event listener after modal is hidden
    $("#saveChangesButton").off("click");
  });

  // Save changes button clicked in edit modal
  $("#saveChangesButton").on("click", function () {
    const reviewId = review.id;
    const movieName = $("#editMovieName").val().trim();
    const movieRating = $("#editMovieRating").val().trim();
    const movieDirector = $("#editMovieDirector").val().trim();
    const movieReleaseDate = $("#editMovieReleaseDate").val().trim();
    const movieActor = $("#editActor").val().trim();

    if (movieName === "" || movieRating === "" || movieDirector === "" || movieReleaseDate === "" || movieActor === "") {
      $("#editError").show();
      return;
    }

    const data = {
      movie_name: movieName,
      rating: parseInt(movieRating),
      director: movieDirector,
      release_date: new Date(movieReleaseDate),
      actor: movieActor
    };

    updateReview(reviewId, data);
    $("#editModal").modal("hide");
  });


  // Clear error message when modal is shown
  $('#editModal').on('show.bs.modal', function () {
    $("#editError").hide();
  });
}

// Sort button clicked
$("#sortButton").click(function () {
  const sortByField = $("#sortField").val();
  getReviews(sortByField);
});

// Close button clicked in add modal
$("#closeAddModal").click(function () {
  $("#addError").hide(); // Hide error message when closing modal
});
// Add Review button pressed
$("#addReviewButton").click(function () {
  const movieName = $("#addMovieName").val().trim();
  const movieRating = $("#addMovieRating").val().trim();
  const movieDirector = $("#addMovieDirector").val().trim();
  const movieReleaseDate = $("#addMovieReleaseDate").val().trim();
  const movieActor = $("#addActor").val().trim(); // Corrected the ID here

  if (movieName === "" || movieRating === "" || movieDirector === "" || movieReleaseDate === "" || movieActor === "") {
    $("#addError").show();
    return;
  }

  // Assuming addReview is a function that adds the review data to your database
  addReview(movieName, movieDirector, parseInt(movieRating), new Date(movieReleaseDate), new Date(movieReviewDate), movieActor);

  $("#addModal").modal("hide");
  $("#addMovieName").val("");
  $("#addMovieRating").val("1");
  $("#addMovieDirector").val("");
  $("#addMovieReleaseDate").val("");
  $("#addActor").val(""); // Corrected the ID here
  $("#addError").hide(); // Hide error message when closing modal
});

// Initialize with default sorting by movie name
getReviews("movieName");



