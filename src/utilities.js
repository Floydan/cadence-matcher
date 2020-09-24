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

    static calculatePercentage(loaded, total) {
        return Math.floor((loaded * 1.0) / total);
    }

    static debounce(callback, wait) {
        let timeout;
        return (...args) => {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => callback.apply(context, args), wait);
        };
    }

    static uniqueInArray(value, index, self) {
        return self.indexOf(value) === index;
    }

    static uniqueInArrayAdv(arr, prop) {
        const uniquePropValues = [...new Set(arr.map((t) => t[prop]))];
        let uniqueItems = [];
        for (const item of arr) {
            if (!uniquePropValues.includes(item[prop])) continue;
            const inArray = uniqueItems.filter((t) => t[prop] === item[prop]);
            if (inArray.length !== 0) continue;
            uniqueItems.push(item);
        }
        return uniqueItems;
    }
}