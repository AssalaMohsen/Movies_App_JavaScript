//Global Variables

let apiKey = "0f2262db1a835edfabfefe0b6da81890";
let allData;

//Event Listeners

$("#sidebar-btn").click(function (e) {
  e.preventDefault();
  let sidebarLinks = [...document.querySelectorAll("#sidebar ul li")];
  let time = 1100;
  if ($("#sidebar-btn i").hasClass("fa-times")) {
    $("#sidebar").attr("style", `left:-${$("#sidebar").css("width")}px`);
    $("#sidebar ul li").animate({ paddingTop: "500px", opacity: "0" }, 500);
  } else {
    $("#sidebar").attr("style", "left:0");
    sidebarLinks.forEach(function (element) {
      $(element).animate({ paddingTop: "25px", opacity: "1" }, time);
      time += 100;
    });
  }
  $("#sidebar-btn i").toggleClass("fa-times");
});

$(".nav-link").click(function (e) {
  e.preventDefault();
  getMoviesByCategory(e.target.hash.replace("#", ""));
});

$("#search").keyup(function (e) {
  displaySearchResults();
});

$("#searchByWord").keyup(function (e) {
  searchMoviesByWord($("#searchByWord").val());
});

$("#nameInput").keyup(() => {
  validateNameInput();
  validateAll();
});

$("#emailInput").keyup(() => {
  validateEmailInput();
  validateAll();
});

$("#phoneInput").keyup(() => {
  validatePhoneInput();
  validateAll();
});

$("#ageInput").keyup(() => {
  validateAgeInput();
  validateAll();
});

$("#passwordInput").keyup(() => {
  validatePasswordInput();
  validateAll();
});

$("#rePasswordInput").keyup(() => {
  validateRePasswordInput();
  validateAll();
});

//Function Declarations

function validateNameInput() {
  let regex = /^[a-z0-9]+$/i;
  if (regex.test($("#nameInput").val())) {
    $("#nameError").addClass("d-none");
    return true;
  } else {
    $("#nameError").removeClass("d-none");
    return false;
  }
}

function validateEmailInput() {
  let regex = /^[a-z0-9_]+@[a-z_]+\.[a-z]{2,4}$/i;
  if (regex.test($("#emailInput").val())) {
    $("#emailError").addClass("d-none");
    return true;
  } else {
    $("#emailError").removeClass("d-none");
    return false;
  }
}

function validatePhoneInput() {
  let regex = /^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  if (regex.test($("#phoneInput").val())) {
    $("#phoneError").addClass("d-none");
    return true;
  } else {
    $("#phoneError").removeClass("d-none");
    return false;
  }
}

function validateAgeInput() {
  let regex = /^[1-9][0-9]?$|^100$/i;
  if (regex.test($("#ageInput").val())) {
    $("#ageError").addClass("d-none");
    return true;
  } else {
    $("#ageError").removeClass("d-none");
    return false;
  }
}

function validatePasswordInput() {
  let regex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/i;
  if (regex.test($("#passwordInput").val())) {
    $("#passwordError").addClass("d-none");
    return true;
  } else {
    $("#passwordError").removeClass("d-none");
    return false;
  }
}

function validateRePasswordInput() {
  if ($("#rePasswordInput").val() == $("#passwordInput").val()) {
    $("#rePasswordError").addClass("d-none");
    return true;
  } else {
    $("#rePasswordError").removeClass("d-none");
    return false;
  }
}

function validateAll() {
  if (
    validateNameInput() &&
    validateEmailInput() &&
    validatePhoneInput() &&
    validateAgeInput() &&
    validatePasswordInput() &&
    validateRePasswordInput()
  ) {
    $("#submit").prop("disabled", false);
    return true;
  } else {
    $("#submit").prop("disabled", true);
    return false;
  }
}

async function fetchData(url) {
  let response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

function searchMoviesByWord(word) {
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&page=1&include_adult=false&query=${word}`;
  if (word != "") {
    showPreloader();
    fetchData(url)
      .then((data) => {
        hidePreloader();
        allData = data.results;
        if (allData.length > 0) {
          displayAllData(allData);
        } else {
          showNoResultsFound();
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
}

function getMoviesByCategory(category) {
  let url;
  if (category == "trending") {
    url = `https://api.themoviedb.org/3/${category}/all/day?api_key=${apiKey}&language=en-US&page=1`;
  } else {
    url = `https://api.themoviedb.org/3/movie/${category}?api_key=${apiKey}&language=en-US&page=1`;
  }
  showPreloader();
  fetchData(url)
    .then((data) => {
      hidePreloader();
      allData = data.results;
      displayAllData(allData);
    })
    .catch((error) => {
      console.log(error.message);
    });
}

async function getMovieData(id) {
  let url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`;
  showPreloader();
  fetchData(url)
    .then((data) => {
      hidePreloader();
      displayTVShowDetails(data);
    })
    .catch((error) => {
      console.log(error.message);
    });
}

function displayAllData(allData) {
  var str = "";
  for (var i = 0; i < allData.length; i++) {
    let mediaType = allData[i].media_type;
    str += `<div class="col-6 col-lg-4"><div class="img-wrap">
    <img src="https://image.tmdb.org/t/p/w500/${
      allData[i].poster_path
    }" class="img-fluid" id="${allData[i].id}"/>
    <div class="overlay text-center d-flex flex-column justify-content-center align-items-center px-2">
    <h2>${mediaType == "tv" ? allData[i].name : allData[i].title}</h2>
    <div class="px-2">
    <p>${allData[i].overview}</p>
    <p>rate: ${allData[i].vote_average}</p>
    <p>${
      mediaType == "tv" ? allData[i].first_air_date : allData[i].release_date
    }</p>
    </div>
    </div>
    </div></div>`;
  }
  $("#data").append(str);
}

function displaySearchResults() {
  if ($("#search").val() != "") {
    showPreloader();
    let filtered = allData.filter(isSearchMatch($("#search").val()));
    hidePreloader();
    if (filtered.length > 0) {
      displayAllData(filtered);
    } else {
      showNoResultsFound();
    }
  }
}

function isSearchMatch(searchVal) {
  return function (element) {
    let val = new RegExp(searchVal.toLowerCase(), "g");
    return element.media_type == "tv"
      ? val.test(element.name.toLowerCase())
      : val.test(element.title.toLowerCase());
  };
}

function showPreloader() {
  $("#data")
    .html(`<div class="preloader justify-content-center align-items-center">
  <div class="spinner">
    <div class="double-bounce1"></div>
    <div class="double-bounce2"></div>
  </div>
</div>`);
}
function showNoResultsFound() {
  $("#data")
    .html(`<div class="preloader justify-content-center align-items-center">
  <span class="text-white">
   No Results Found
  </span>
</div>`);
}

function hidePreloader() {
  $(".spinner").fadeOut();
  $(".preloader").delay(400).fadeOut("slow");
}

//Function Calls
getMoviesByCategory("now_playing");
