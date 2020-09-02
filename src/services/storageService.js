export default class StorageService {
    /**
     * stores the filters in localStorage
     * @return void
     */
    static setFilters({
        minBpm,
        targetBpm,
        maxBpm,
        genres
    }) {
        localStorage.setItem('filters', JSON.stringify({
            minBpm,
            targetBpm,
            maxBpm,
            genres
        }));
    }

    /**
     * retrieves the filters from localStorage
     * @return Object
     */
    static getFilters() {
        var filters = localStorage.getItem('filters');
        if (!filters) return {};

        return JSON.parse(filters);
    }

    /**
     * sets the access tokens and expiration in localStorage
     * @return Object
     */
    static setTokens({
        accessToken,
        refreshToken,
        expire
    }) {
        localStorage.setItem('tokens', JSON.stringify({
            accessToken,
            refreshToken,
            expire
        }));
    }


    /**
     * retrieves the access tokens and expiration from localStorage
     * @return Object
     */
    static getTokens() {
        var tokens = localStorage.getItem('tokens');
        if (!tokens) return {};

        return JSON.parse(tokens);
    }
}