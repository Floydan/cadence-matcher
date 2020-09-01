export default class Utilities {

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    static getHashParams() {
        var hashParams = {};
        var e,
            r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ((e = r.exec(q))) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }
    
    /**
     * parses milliseconds to hours:minutes:seconds
     * @return String
     */
    static parseMilliseconds(millisec) {
        var seconds = (millisec / 1000).toFixed(0);
        var minutes = Math.floor(seconds / 60);
        var hours = '';
        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            hours = hours >= 10 ? hours : '0' + hours;
            minutes = minutes - hours * 60;
            minutes = minutes >= 10 ? minutes : '0' + minutes;
        }

        seconds = Math.floor(seconds % 60);
        seconds = seconds >= 10 ? seconds : '0' + seconds;
        if (hours != '') {
            return hours + ':' + minutes + ':' + seconds;
        }
        return minutes + ':' + seconds;
    }

    /**
     * stores the filters in localStorage
     * @return void
     */
    static setFilters(filters) {
        localStorage.setItem('filters', JSON.stringify(filters));
    }

    /**
     * retrieves the filters from localStorage
     * @return Object
     */
    static getFilters() {
        var filters = localStorage.getItem('filters');
        if(!filters) return {};

        return JSON.parse(filters);
    }
}