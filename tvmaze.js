// queries for shows from the tvmaze API
async function searchShows(query) {
  const queriedShow = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`,
  {crossorigin : true});
  const showInfo = queriedShow.data;
  
  try {
    return showInfo.map(showName => {
      let image = showName.show.image ? showName.show.image.original : 
      "https://cdn.pixabay.com/photo/2016/04/24/22/30/monitor-1350918_1280.png"
      let {show: {id, name, summary}} = showName;
      return {
        id,
        name,
        summary,
        image,
      }
    })
  } catch(e) {
    console.log(`no response was given: ${e}`)
  };
};

// takes in an array of shows and adds the show and its data
// to the DOM.
function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <img class="card-img-top" src="${show.image}">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button type="submit" class="btn btn-primary" id="button${show.id}">Episodes</button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($item);
  }
}

// handles search form requests and hides the episodes area 
$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

// given a show idea, this function returns an array of episode objects
// if a show has no episode data, it returns a placeholder instead
async function getEpisodes(id) {
  try {
    const showEpisodes = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`,
    {crossorigin : true});
    if (!showEpisodes.data.length) {
      return [
        {
          id: 'Not Found', 
          name: 'Not Found', 
          season: 'Not Found', 
          number: 'Not Found'
        }
      ]
    };
    return showEpisodes.data.map(episode => {
      let {id, name, season, number} = episode;
      return {
        id,
        name,
        season,
        number,
      }
    });
  } catch(err) {
    console.log(`could not complete request: ${err}`);
  };
};

// selects the "episodes" ul and populates it with new <li>'s
// with each episode's relevant information
const populateEpisodes = (episodesArray) => {
  const $episodesArea = $('#episodes-area');
  $episodesArea.css('display', 'block');
  const $episodesList = $('#episodes-list');
  for (let episode of episodesArray) {
    let $newLi = $(`<li>Show Id: ${episode.id},  
                    Show Title: ${episode.name}, 
                    Season: ${episode.season},
                    Show Number: ${episode.number}</li>`);
    $newLi.appendTo($episodesList);
  };
};

// handles clicks on the "Episodes" button
// shows the episodes area
// populates the episodes area with data about each episode
$('#shows-list').on('click', '.btn', async function(evt) {
  $('#episodes-list').text('');
  const showId = evt.target.parentElement.parentElement.getAttribute('data-show-id');
  const allEpisodes = await getEpisodes(showId);
  populateEpisodes(allEpisodes);
});



