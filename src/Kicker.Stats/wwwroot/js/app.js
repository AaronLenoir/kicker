let KickerStatsAppViewModel = function () {

    let self = this;

    self.appName = "Kicker Stats";

    self.loading = ko.observable(true);

    self.analysis = ko.observable("A");

    self.loadData = function (data) {
        var analysis = new KickerStatsAnalysis(data);
        console.log(analysis);
        self.analysis(analysis);

        self.loading(false);
    };
};