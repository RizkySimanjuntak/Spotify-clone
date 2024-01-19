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

document.addEventListener('DOMContentLoaded', function() {
    var myPlaylistElement = document.getElementById('myPlaylist');

    myPlaylistElement.addEventListener('click', function() {
        window.location.href = 'playlist-page.html';
    });
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

async function search(query) {
    var accessToken = await getAccessToken();
    var searchEndpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist,track`;

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
    return searchData;
}

function displayArtistsInfo(artistsData) {
    var artistsContainer = document.getElementById('artists-container');
    artistsContainer.innerHTML = '';

    artistsData.forEach(artist => {
        var artistElement = document.createElement('div');
        artistElement.classList.add('artist-card');

        var artistImage = artist.images.length > 0 ? artist.images[0].url : '/src/placeholder.png';

        artistElement.innerHTML = `
        <img src="${artistImage}" alt="${artist.name}"/>
        <h2>${artist.name}</h2>
        <p>Genre: ${artist.genres.join(', ')}</p>
        `;
        artistsContainer.appendChild(artistElement);
    });
}

function displayTracksInfo(tracksData) {
    var tracksContainer = document.getElementById('tracks-container');
    tracksContainer.innerHTML = '';

    tracksData.forEach(track => {
        var trackElement = document.createElement('div');
        trackElement.classList.add('track-card');

        trackElement.innerHTML = `
        <img src="${track.album.images[0].url}" alt="${track.name}"/>
        <h2>${track.name}</h2>
        <p>Artist: ${track.artists.map(artist => artist.name).join(', ')}</p>
        <p>Album: ${track.album.name}</p>
        <hr/>
        `;

        trackElement.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            showContextMenu(track);
        });

        tracksContainer.appendChild(trackElement);
    });
}

function showContextMenu(track) {
    event.preventDefault();

    var mouseX = event.pageX;
    var mouseY = event.pageY;

    var contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    contextMenu.style.top = mouseY + 'px';
    contextMenu.style.left = mouseX + 'px';

    var addToPlaylistOption = document.createElement('div');
    addToPlaylistOption.innerText = 'Add to Playlist';
    addToPlaylistOption.addEventListener('click', function() {
        addToPlaylist(track);
        contextMenu.style.display = 'none';
    });


    contextMenu.appendChild(addToPlaylistOption);
    document.body.appendChild(contextMenu);

    document.addEventListener('click', function hideContextMenu() {
        contextMenu.style.display = 'none';
        document.removeEventListener('click', hideContextMenu);
    });
}

async function performSearch() {
    var query = document.getElementById('search-input').value;

    try {
        var [artistsData, tracksData] = await Promise.all([search(query, 'artist'), search(query, 'track')]);

        if (artistsData.artists) {
            displayArtistsInfo(artistsData.artists.items);
        }

        if (tracksData.tracks) {
            displayTracksInfo(tracksData.tracks.items);
        }
    } catch (error) {
        console.error('Error during search:', error);
    }
}

function addToPlaylist(track) {
    var playlistItem = {
        playlistIndex: playlistIndexCounter++,
        thumbnail: track.album.images[0].url,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
    };

    yourPlaylist.push(playlistItem);

    addToPlaylistList(playlistItem);

    savePlaylistToLocalStorage();

    alert('Added to playlist:', playlistItem);
}

function addToPlaylistList(playlistItem) {
    var playlistContainer = document.getElementById('playlistListContainer');

    var playlistElement = document.createElement('div');
    playlistElement.classList.add('thumbnail');
    
    playlistElement.innerHTML = `
        <p>${playlistItem.playlistIndex}</p>
        <img src="${playlistItem.thumbnail}" alt="">
        <div>
            <p>${playlistItem.title}</p>
            <p style="color: rgb(135, 135, 130);">${playlistItem.artist}</p>
        </div>
        <p style="margin-left: 260px;">. . .</p>
    `;

    playlistElement.addEventListener('click', function() {
        // Handle playlist item click
        // ...
    });

    playlistContainer.appendChild(playlistElement);

    updatePlaylistList();
}

function savePlaylistToLocalStorage() {
    localStorage.setItem('yourPlaylist', JSON.stringify(yourPlaylist));
}

function updatePlaylistList() {
    var playlistContainer = document.getElementById('playlistListContainer');
    playlistContainer.innerHTML = '';

    yourPlaylist.forEach(function (playlistItem, index) {
        addToPlaylistList(playlistItem);
    });
}

async function main() {
    try {
        var query = 'genre:rock';
        var artistsData = await search(query, 'artist');
        displayArtistsInfo(artistsData.artists.items);

        loadPlaylistFromLocalStorage();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
