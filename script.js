// Event listener for movie API fetch
const movieForm = document.querySelector('#movie-search-form');
const dataArea = document.querySelector('#data-area');
movieForm.addEventListener('submit', event => {
  event.preventDefault();

  const userInput = getUserInput('movie-name');

  //validate user input
  let isValid = checkUserInput(userInput, dataArea);
  if(!isValid) {
    return false;
  }
  
  //create table and tbody for accomodating data
  const tbody = createTable(dataArea, 'Poster', 'Movie Name'); 

  const url = getUrlByMovieName(userInput);
  getData(url, data => {
    validateData(data, dataArea);
    showMovies(data.Search, tbody, createMovieData);
  });
});

// Event listener for course repo API fetch
// Show all the course info
const searchAllCourse = document.querySelector('#all-repo-search-button');
searchAllCourse.addEventListener('click', () => {
  dataArea.innerHTML = '';
  const tbody = createTable(dataArea, 'Course Name', 'Contributors'); 
  
  const hyfUrl = getUrlByRepo('');
  getData(hyfUrl, data => {
    validateData(data.items.length, dataArea);
    showData(data.items, tbody, renderCourseData);
  });
});

// Show the searched course repo
const courseSearchWithInput = document.querySelector('#repo-search-form');
courseSearchWithInput.addEventListener('submit', event => {
  event.preventDefault();

  const userInput = getUserInput('repo-name');
  //validate user input
  let isValid = checkUserInput(userInput, dataArea);
  if(!isValid) {
    return false;
  }

  //create table and tbody for accomodating data
  const tbody = createTable(dataArea, 'Course Name', 'Contributors'); 
 
  const url = getUrlByRepo(userInput);
  getData(url, data => {
    validateData(data.items.length, dataArea);
    showData(data.items, tbody, renderCourseData);
  })
});

// search for github people
const userSearchForm = document.querySelector('#user-search-form');
userSearchForm.addEventListener('submit', event => {
  event.preventDefault();
  const userInput = getUserInput('user-name');
  
  let isValid = checkUserInput(userInput, dataArea);
  if(!isValid) {
    return false;
  }

  const tbody = createTable(dataArea, 'Avatar', 'User Name', 'User Score', 'User Repo');
  const url = getUrlByUserName(userInput);

  getData(url, data => {
    validateData(data.items.length, dataArea);
    showData(data.items, tbody, renderUserData);
  })
});

// Add a clear all button
const clearAll = document.querySelector('#clear-all-button');
clearAll.addEventListener('click', () => {
  dataArea.innerHTML = '';
});

// User input control
function checkUserInput(userInput, dataArea) {
  if (!userInput) {
    dataArea.innerHTML = `
      <div class="alert alert-danger mx-auto" role="alert">
        Hey you haven't input anything! Just type in some names and see what happens...
      </div>`;
    return false;
  } else {
    dataArea.innerHTML = '';
    return true;
  }
}

function getUserInput(domId) {
  const formData = new FormData(event.target);
  const userInput = formData.get(domId);
  return userInput;
}

// Get Url
function getUrlByUserName(userInput) {
  return `https://api.github.com/search/users?q=${userInput}`;
}
function getUrlByRepo(userInput) {
  return `https://api.github.com/search/repositories?q=user:HackYourFuture-CPH+${userInput}`;
}

function getUrlByMovieName(userInput) {
  return `https://www.omdbapi.com/?apikey=6d847b4e&type=movie&s=${userInput}&page=1`;
}

function getUrlByMovieID(id) {
  return `https://www.omdbapi.com/?apikey=6d847b4e&i=${id}`;
}

// Ajax call & validate data
function getData(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  let data = [];

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      data = JSON.parse(xhr.response);
      if (data.Error) {
        data = false;
      }
      callback(data);
    } 
    if (xhr.status !== 200) {
      console.log('oops, the link or the server might have some errors.');
    }
  }
  xhr.send();
}

// Validate responded data
function validateData(data, domElement) {
  if (!data) {
    domElement.innerHTML = `
      <div class="alert alert-danger mx-auto" role="alert">
        Oops, we could not find any search result based on your input. Please search with some other keywords.
      </div>`;
    return false;
  }
  return true;
}

// change DOM
function createTable(dataArea, ...header) {
  const table = document.createElement('table');
  table.classList.add('table', 'table-hover', 'col-xs-12', 'mx-auto');
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  let trContent = '';
  header.forEach(title => {
    trContent += `<th scope="col">${title}</th>`;
  });
  tr.innerHTML = trContent;
  thead.appendChild(tr);
  const tbody = document.createElement('tbody');
  table.appendChild(thead);
  table.appendChild(tbody);
  dataArea.appendChild(table);
  return tbody;
}

function showData(data, domElement, callback) {
  data.forEach(element => {
    const tr = callback(element);
    domElement.appendChild(tr);
  });
}

function showMovies(data, DOMEl, callback) {
  data.forEach(element => {
    const tr = document.createElement('tr');
    tr.innerHTML = callback(element);
    DOMEl.appendChild(tr);
    const detailArea = tr.querySelector('.details');

    tr.addEventListener('click', () => {
      event.preventDefault();
      showMovieDetails(element, detailArea);
    })
  });
}

function createMovieData(element) {
  return `
    <td scope="col">
      <p>${element.Title}</p>
      <div class="details"></div>
    </td>
    <td scope="col"><img style="width: 100px" src="${element.Poster}"></td>`;
}

function renderCourseData(element) {
  const tr = document.createElement('tr');
  const tdName = document.createElement('td');
  const url = getUrlByRepo(element.name);
  tdName.innerHTML = `
    <h3><a class="badge badge-dark" href="${url}" target="_blank">${element.name}</a></h3>
    <p>${element.description}</p>`;
  const contributors = getContributorList(element.contributors_url);
  const tdContent = document.createElement('td');
  tdContent.appendChild(contributors);
  tr.appendChild(tdName);
  tr.appendChild(tdContent);
  
  return tr;
}

function renderUserData(element) {
  // 'Avatar', 'User Name', 'User Score', 'User Repo'
  const tr = document.createElement('tr');
  const avatar = document.createElement('td');
  const userName = document.createElement('td');
  const userScore = document.createElement('td');
  const userRepo = document.createElement('td');

  avatar.innerHTML = `<img class="rounded" style="width: 100px" src=${element.avatar_url} alt=${element.login}>`;
  userName.innerHTML = `<p>${element.login}</p>`;
  userScore.innerHTML = `<p><span class="badge badge-pill badge-info">${element.score}</span></p>`;
  userRepo.innerHTML = `<p><a href="${element.repos_url}" class="badge badge-light">Repo Link</a></p>`;

  tr.appendChild(avatar);
  tr.appendChild(userName);
  tr.appendChild(userScore);
  tr.appendChild(userRepo);

  return tr;
}

function getContributorList(url) {
  const div = document.createElement('div');
  div.classList.add('list-group');
  getData(url, data => {
    data.forEach(item => {
      const a = document.createElement('a');
      a.classList.add('list-group-item', 'list-group-item-action');
      a.setAttribute('href', item.html_url);
      a.setAttribute('target', '_blank');
      a.innerHTML = item.login;
      const img = document.createElement('img');
      img.setAttribute('src', item.avatar_url);
      img.classList.add('rounded', 'float-right');
      img.style.width = '80px';
      a.appendChild(img);
      div.appendChild(a);
    });
  });
  return div;
}

function showMovieDetails(movie, detailArea) {
  const url = getUrlByMovieID(movie.imdbID);
  getData(url, data => {
    detailArea.innerHTML = `
        <ul>
          <li>IMDB Rating: ${data.imdbRating}</li>
          <li>IMDB Vote Count: ${data.imdbVotes}</li>
          <li>IMDB ID: ${data.imdbId}</li>
          <li>Publish Year: ${data.Year}</li>
          <li>Actors: ${data.Actors}</li>
        </ul>
        `;
  })
}