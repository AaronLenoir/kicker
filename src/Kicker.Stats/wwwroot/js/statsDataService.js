let kickerStatsDataService = (function () {
    let fetchData = function (useCache, year, callback) {
        fetch('api/results?useCache=' + useCache + '&year=' + year)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                callback(data);
            });
    };

    return {
        fetchData: fetchData
    };
}());