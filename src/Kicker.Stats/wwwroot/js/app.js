let KickerStatsAppViewModel = function (kickerStatsDataService) {

    let self = this;

    self.kickerStatsDataService = kickerStatsDataService;

    self.appName = "Kicker Stats";

    self.loading = ko.observable(true);

    self.analysis = ko.observable("A");

    self.refreshData = function () {
        self.loading(true);

        self.kickerStatsDataService.fetchData(false, function (data) {
            self.loadData(data);
        });
    };

    self.loadData = function (data) {
        var analysis = new KickerStatsAnalysis(data);
        console.log(analysis);
        self.analysis(analysis);

        self.loading(false);
    };
};