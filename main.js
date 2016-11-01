// find template and compile it
var resultsPlaceholder = $('#results'),
    playingCssClass = 'playing',
    audioObject = null,
    albumCoversHtml = "";
/* 1.
 - Write a function that makes an AJAX request for a specific album so you can get the tracks of a specific
 the function should accept 2 parameters
 - param1 is the album id
 - param2 is a "callback" function that you will call after the AJAX request and pass in the response to
 - the API documenation is at https://developer.spotify.com/web-api/get-album/
*/

var fetchTracks = function (albumId, callback) {
    // write your AJAX request here
    $.ajax({
        url: 'https://api.spotify.com/v1/albums/' + albumId,
        success: callback
    });
};

var addAlbumsToPage = function (albums) {
    albumCoversHtml = "";
    albums.items.forEach(function(album){
      albumCoversHtml += '<div style="background-image:url('+ album.images[0].url +')" data-album-id="'+ album.id +'" class="cover">' +
                          '<button class="song-action play" onclick="playPauseTrack"></button>' +
                          '<button class="song-action stop" onclick="stopTrack"></button>' +
                          '</div>';
    })
    resultsPlaceholder.prepend(albumCoversHtml);
}


function playPauseTrack() {
  $('#results').unbind('click').on('click', '.cover button.play', function(event) {
    var $albumCover = $(this).closest('.cover');
    $(this).removeClass('play');
    $(this).addClass('pause');
    event.stopPropagation();
    event.preventDefault();
    console.log("this should only happen once");
    // CHECK TO SEE IF THE ALBUMCOVER HAS THE CLASS OF 'PLAYING'
    if (($albumCover.hasClass(playingCssClass) === false) && ($albumCover.siblings().hasClass(playingCssClass) === false) ) {
        $albumCover.siblings().addClass('unavailable');
        fetchTracks($albumCover.data('album-id'), function (data) {
            audioObject = new Audio(data.tracks.items[0].preview_url);
            audioObject.play();
            $albumCover.addClass(playingCssClass);
            audioObject.addEventListener('ended', function () {
                $albumCover.removeClass(playingCssClass);
                $albumCover.find('button.pause').addClass('play');
                $albumCover.find('button.pause').removeClass('pause');
                $albumCover.siblings().removeClass('unavailable');
            });
            audioObject.addEventListener('pause', function () {
                $(this).toggleClass('play');
                $(this).toggleClass('pause');
            });
        });
    } else {
      if(audioObject) {
        audioObject.play();
      }
    }
  });

  $('#results').unbind('click').on('click', '.cover button.pause', function(event) {
    var $albumCover = $(this).closest('.cover');
    event.stopPropagation();
    event.preventDefault();
    $(this).addClass('play');
    $(this).removeClass('pause');
    audioObject.pause();
    $albumCover.toggleClass('paused');
  });
}

function stopTrack() {
  $('#results').unbind('click').on('click', '.cover button.stop', function(event) {
    var $albumCover = $(this).closest('.cover');
    $albumCover.removeClass(playingCssClass);
    $albumCover.removeClass('paused');
    event.stopPropagation();
    event.preventDefault();
    audioObject.pause();
    audioObject.currentTime = 0;
    $albumCover.siblings().removeClass('unavailable');
    if($(this).siblings().hasClass('pause')) {
      $(this).siblings().removeClass('pause');
      $(this).siblings().addClass('play');
    }
  });
}

var searchAlbums = function (query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'album'
        },
        success: function (response) {
            playPauseTrack();
            stopTrack();
            addAlbumsToPage(response.albums);
            addAlbumPreview();
        }
    });
};

function addAlbumPreview(){
    $(".cover").unbind('click').on('click', function (e) {
        var target = e.target;
        if ($(this).siblings().hasClass(playingCssClass) === false ) {
          console.log("line 50");
          if (target !== null && target.classList.contains('cover')) {
              console.log("line 52");
              if (target.classList.contains(playingCssClass)) {
                if (target.classList.contains("paused")) {
                  audioObject.play();
                  target.classList.remove("paused")
                } else {
                  console.log("pause");
                  audioObject.pause();
                  target.classList.add("paused")
                }
              } else {
                  console.log("line 57");
                  // fetchTracks(target.getAttribute('data-album-id'), function (data) {
                  //     console.log("line 59");
                  //     audioObject = new Audio(data.tracks.items[0].preview_url);
                  //     audioObject.play();
                  //     target.classList.add(playingCssClass);
                  //     audioObject.addEventListener('ended', function () {
                  //         target.classList.remove(playingCssClass);
                  //     });
                  //     audioObject.addEventListener('pause', function () {
                  //         // target.classList.remove(playingCssClass);
                  //
                  //     });
                  // });
              }
          }
        }
    });
};

$('#search-form').on('submit', function (e) {
    e.preventDefault();
    searchAlbums($('#query').val());
    document.getElementById("search-form").reset();
});
