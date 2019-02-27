let KickerStatsAppViewModel = function () {

    let self = this;

    self.appName = "Kicker Stats";

    self.loading = ko.observable(true);

    self.loadData = function (data) {
        self.loading(false);
    };
};