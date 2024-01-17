
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.button-search').addEventListener('click', function() {
      window.location.href = 'search-page.html';
    });
  });

function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', function () {
    getMyPlaylists();
  });

async function getAccessToken() {
    var client_id = '9e36d1326dff4934bfa9b1ee767fd850';
    var client_secret = '83df893f2f01438e842d4d117500e760';

    var response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    var data = await response.json();
    return data.access_token;
    }

    async function getArtistsInfo(accessToken) {
        var artistsEndpoint = 'https://api.spotify.com/v1/artists?ids=2CIMQHirSU0MQqyYHq0eOx%2C57dN52uHvrHOxijzpIgu3E%2C1vCWHaC5f2uS3yhpwWbIA6';

        var response = await fetch(artistsEndpoint, {
            method: 'GET',
            headers: {
            'Authorization': 'Bearer ' + accessToken
            }
    });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        var artistsData = await response.json();
        return artistsData;
    }

    async function searchArtists(query) {
        var accessToken = await getAccessToken(); 
        var searchEndpoint = `https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(query)}`;

        var response = await fetch(searchEndpoint, {
            method: 'GET',
            headers: {
            'Authorization': 'Bearer ' + accessToken
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        var searchData = await response.json();
        return searchData.artists.items;
    }

    function displayArtistsInfo(artistsData) {
        var artistsContainer = document.getElementById('artists-container');
        artistsContainer.innerHTML = ''; 

        artistsData.forEach(artist => {
            var artistElement = document.createElement('div');
            artistElement.classList.add('artist-card');

            artistElement.innerHTML = `
            <img src="${artist.images[0].url}" alt="${artist.name}"/>
            <h2>${artist.name}</h2>
            <p>Genre: ${artist.genres.join(', ')}</p>
            `;
            artistsContainer.appendChild(artistElement);
        });
    }

    async function performSearch() {
        var query = document.getElementById('search-input').value;
        var artistsData = await searchArtists(query);
        displayArtistsInfo(artistsData);
    }

    async function getMyPlaylists() {
      try {
          const accessToken = await getAccessToken();
          const playlistsEndpoint = 'https://api.spotify.com/v1/playlists/3cEYpjA9oz9GiPac4AsH4n';
  
          const response = await fetch(playlistsEndpoint, {
              method: 'GET',
              headers: {
                  'Authorization': 'Bearer ' + accessToken
              }
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
  
          const playlistData = await response.json();
          console.log(playlistData);
          displayPlaylistInfo(playlistData);
      } catch (error) {
          console.error('Error:', error);
      }
  }
  
  function displayPlaylistInfo(playlistData) {
      const playlistContainer = document.getElementById('playlist');
      playlistContainer.innerHTML = '';
  
      // Menampilkan informasi playlist
      const playlistInfoElement = document.createElement('div');
      playlistInfoElement.innerHTML = `
          <img src="${playlistData.images[0].url}"/>
          <p>${playlistData.type}</p>
          <h2>${playlistData.name}</h2>
          <p>${playlistData.description}</p>
          <p>Owner: ${playlistData.owner.display_name}</p>
          <p>Followers: ${playlistData.followers.total}</p>
      `;
  
      playlistContainer.appendChild(playlistInfoElement);
  
      // Menampilkan informasi setiap trek
      const tracksContainer = document.createElement('div');
      playlistData.tracks.items.forEach((item) => {
          const addedAt = item.added_at;
          const trackName = item.track.name;
          const albumImage = item.track.album.images[0].url;
  
          const trackElement = document.createElement('div');
          trackElement.innerHTML = `
              <p>Added At: ${addedAt}</p>
              <p>Track Name: ${trackName}</p>
              <img src="${albumImage}"/>
              <hr/>
          `;
  
          tracksContainer.appendChild(trackElement);
      });
  
      playlistContainer.appendChild(tracksContainer);
  }
  
    async function main() {
        try {
            var query = 'genre:rock'; 
            var artistsData = await searchArtists(query);
            displayArtistsInfo(artistsData);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    main();