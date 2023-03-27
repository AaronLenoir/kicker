let kickerStatsDataService = (function () {
    var statsUrl = 'https://kicker-stats.aaronlenoir.com'

    let fetchData = function (useCache, year, callback) {
        fetch('api/results?useCache=' + useCache + '&year=' + year)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                callback(data);
            });
    };

    // Work-in-progress: fetch pre calculated stats from the webservice
    let fetchStats = function (year, callback) {
        path = '/api/stats';

        if (year) { path = path + '?year=' + year; }

        fetch(statsUrl + path)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                callback(data);
            });
    }

    return {
        fetchData: fetchData,
        fetchStats: fetchStats
    };
}());