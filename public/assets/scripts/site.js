(function () {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e,
            r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ((e = r.exec(q))) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    function getPlaylists() {
        $.ajax({
            url: "/playlists",
            headers: {
                accessToken: access_token
            },
            dataType: "json",
        }).done(function (result) {
            for (var p in result.items) {
                var playlist = result.items[p];
                $("#playlists").append(
                    $("<option>", {
                        text: playlist.name,
                        value: playlist.id
                    })
                );
            }
        });
    }

    function getGenres() {
        $.ajax({
            url: "https://api.spotify.com/v1/recommendations/available-genre-seeds",
            headers: {
                Authorization: "Bearer " + access_token,
            },
            success: function (response) {
                var genres = response.genres;
                for (var g in genres) {
                    var genre = genres[g];
                    $("#genres").append(
                        $("<option>", {
                            text: genre,
                            value: genre
                        })
                    );
                }

                setFilters();
            }
        });
    }

    function setFilters() {
        var filters = localStorage.getItem('filters');
        if (!filters) return;

        var filtersParsed = JSON.parse(filters);
        $("#minBpm").val(filtersParsed.minBpm);
        $("#targetBpm").val(filtersParsed.targetBpm);
        $("#maxBpm").val(filtersParsed.maxBpm);
        $('#genres').val(filtersParsed.genres);
    }

    function getRecommendations() {
        var data = {
            minBpm: $("#minBpm").val(),
            targetBpm: $("#targetBpm").val(),
            maxBpm: $("#maxBpm").val(),
            genres: $('#genres').val()
        };

        if (!data.genres || data.genres.length === 0) {
            alert('You have to select atleast 1 genre');
            return;
        }

        localStorage.setItem('filters', JSON.stringify(data));

        $.ajax({
            url: "/recommendations",
            headers: {
                accessToken: access_token
            },
            data: data,
            dataType: "json",
        }).done(function (result) {
            var tracks = [];
            for (var t in result.tracks) {
                var track = result.tracks[t];

                track.artists = track.artists.map((a) => a.name).join(", ");
                track.duration = parseMilliseconds(track.duration_ms); //TODO: parse duration_ms
                track.albumImage = track.album.images[2].url;

                tracks.push(trackTemplate(track));
            }
            tracksPlaceholder.empty();
            tracksPlaceholder.append(tracks);

            var players = document.getElementsByTagName("audio");
            for (var p in players) {
                players[p].volume = 0.4;
            }

            $(".addToPlaylistBtn")
                .off("click")
                .on("click", function (e) {
                    addTrackToPlaylist($(e.target));
                });
        });
    }

    function parseMilliseconds(millisec) {
        var seconds = (millisec / 1000).toFixed(0);
        var minutes = Math.floor(seconds / 60);
        var hours = "";
        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            hours = hours >= 10 ? hours : "0" + hours;
            minutes = minutes - hours * 60;
            minutes = minutes >= 10 ? minutes : "0" + minutes;
        }

        seconds = Math.floor(seconds % 60);
        seconds = seconds >= 10 ? seconds : "0" + seconds;
        if (hours != "") {
            return hours + ":" + minutes + ":" + seconds;
        }
        return minutes + ":" + seconds;
    }

    function addTrackToPlaylist(button) {
        var playlistId = $("#playlists").val();

        if (!playlistId || playlistId.length === 0) {
            alert("You have to select a playlist first");
            return;
        }
        $.ajax({
            url: `/playlists/${playlistId}`,
            method: "POST",
            headers: {
                accessToken: access_token
            },
            contentType: "application/json",
            data: JSON.stringify({
                trackUri: button.data("trackuri"),
            }),
        }).done(function (result) {
            button.text("Added").attr("disabled", true);
        });
    }

    var userProfileSource = document.getElementById("user-profile-template")
        .innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById("user-profile");

    var trackSource = document.getElementById("track-template").innerHTML,
        trackTemplate = Handlebars.compile(trackSource),
        tracksPlaceholder = $(".tracks");

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert("There was an error during the authentication");
    } else {
        if (access_token) {
            $.ajax({
                url: "https://api.spotify.com/v1/me",
                headers: {
                    Authorization: "Bearer " + access_token,
                },
                success: function (response) {
                    userProfilePlaceholder.innerHTML = userProfileTemplate(
                        response
                    );

                    $("#login").hide();
                    $("#loggedin").show();
                },
                error: function () {
                    window.location = '/';
                }
            });

            getPlaylists();
            getGenres();

            $("#searchBtn").on("click", getRecommendations);
        } else {
            // render initial screen
            $("#login").show();
            $("#loggedin").hide();
        }
    }
})();