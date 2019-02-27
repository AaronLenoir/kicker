let kickerStatsDataService = (function () {
    let fetchData = function (callback) {
        fetch('api/results')
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