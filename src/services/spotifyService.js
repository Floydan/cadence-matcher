import Utilites from '../utilities';
import axios from 'axios';
import StorageService from './storageService'

export default class SpotifyService {
    /**
     * Obtains a new access token using a refresh token 
     * @return Promise
     */
    static async getNewAccessToken(refreshToken) {
        try {
            return await axios.get('/refresh_token', {
                params: {
                    refresh_token: refreshToken
                }
            });
        } catch (err) {
            throw new Error('Unable to refresh token');
        }
    }

    /**
     * Obtains the user 
     * @return Promise
     */
    static async getUser(accessToken, callback) {
        try {
            return await axios.get('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
        } catch (err) {
            throw new Error('Unable to get user data');
        }
    }

    /**
     * Obtains user playlists 
     * @return Promise
     */
    static async getPlaylists(accessToken) {
        const response = await axios.get('/playlists', {
            headers: {
                accessToken: accessToken
            }
        });

        if (response.status === 200)
            return response.data.items;
        return [];
    }

    /**
     * Creates a playlists 
     * @return Promise
     */
    static async createPlaylist(accessToken, userId, {
        name,
        description,
        isPublic
    }) {
        try {
            const response = await axios.post(`/playlists/add/${userId}`, {
                name,
                description,
                public: isPublic
            }, {
                headers: {
                    accessToken: accessToken
                }
            });

            if (response.status === 200 || response.status === 201)
                return {
                    success: true,
                    data: response.data
                };
            return {
                success: false,
                data: response.data
            };
        } catch (err) {
            return {
                success: false,
                data: err
            };
        }
    }

    /**
     * Obtains spotify seed genres
     * @return Promise
     */
    static async getGenres(accessToken, callback) {
        const response = await axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.status === 200)
            return response.data.genres;
        return [];
    }

    /**
     * Obtains spotify recommendations based on bpm and genres
     * @return Promise
     */
    static async getRecommendations(
        accessToken, {
            minBpm,
            targetBpm,
            maxBpm,
            tempo,
            genres,
            energy,
            acousticness,
            danceability,
            instrumentalness,
            liveness,
            valence
        },
        market) {
        var data = {
            minBpm,
            targetBpm,
            maxBpm,
            tempo,
            genres,
            energy,
            acousticness,
            danceability,
            instrumentalness,
            liveness,
            valence,
            market
        };

        if (!data.genres || data.genres.length === 0) {
            alert('You have to select atleast 1 genre');
            return [];
        }

        StorageService.setFilters(data);

        const response = await axios.get('/recommendations', {
            headers: {
                accessToken: accessToken
            },
            params: data,
        });
        if (response.status === 200) {
            const tracks = [];
            for (let track of response.data.tracks) {
                track.artists = track.artists.map((a) => a.name).join(', ');
                track.duration = Utilites.parseMilliseconds(track.duration_ms); //TODO: parse duration_ms
                track.albumImage = track.album.images[2].url;

                tracks.push(track);
            }

            return tracks;
        }
        return [];
    }

    /**
     * Adds a track to a playlist
     * @return Promise
     */
    static async getPlaylistTracks(
        accessToken,
        playlistId
    ) {
        if (!playlistId || playlistId.length === 0) {
            alert('You have to select a playlist first');
            return [];
        }

        var response = await axios.get(`/playlists/${playlistId}`, {
            headers: {
                accessToken: accessToken
            },
        });

        if (response.status === 200 || response.status === 201)
            return response.data.items;
        return [];
    }

    /**
     * Adds a track to a playlist
     * @return Promise
     */
    static async addTrackToPlaylist(
        accessToken,
        playlistId,
        trackUri
    ) {
        if (!playlistId || playlistId.length === 0) {
            alert('You have to select a playlist first');
            return false;
        }

        var response = await axios.post(`/playlists/${playlistId}`, {
            trackUri: trackUri
        }, {
            headers: {
                accessToken: accessToken
            },
        });

        if (response.status === 200 || response.status === 201)
            return true;
        return false;
    }
}