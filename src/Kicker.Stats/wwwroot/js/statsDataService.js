﻿let kickerStatsDataService = (function () {
    let fetchData = function (useCache, callback) {
        fetch('api/results?useCache=' + useCache)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(JSON.stringify(data));
                callback(data);
            });
    };

    return {
        fetchData: fetchData
    };
}());