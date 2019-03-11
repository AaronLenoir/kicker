Vue.component('full-team-ranking', {
    props: ['stats'],
    template: `
<div>
    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Rank</th>
                <th>Keeper - Striker</th>
                <th>Rating <a href="#ratingInfo">(?)</a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(teamStat, index) in stats.teamStats.allTeams">
                <td>
                    <a><span>{{ index + 1 }}</span></a>
                </td>
                <td>
                    <span>{{ teamStat.team.keeper }}</span>
                    <span>-</span>
                    <span>{{ teamStat.team.striker }}</span>
                </td>
                <td>
                    <span>{{ teamStat.eloRating.rating.toFixed() }}</span>
                </td>
            </tr>
        </tbody>
    </table>
</div>`
});

let kickerStatsApp = new Vue({
    el: '#app',
    data: {
        appName: "Kicker Stats",
        loading: true,
        analysis: {}
    },
    created: function () {
        kickerStatsDataService.fetchData(true, function (data) {
            kickerStatsApp.loadData(data);
        });
    },
    methods: {
        loadData: function (data) {
            kickerStatsApp.analysis = new KickerStatsAnalysis(data);
            kickerStatsApp.loading = false;
        },
        refreshData: function () {
            kickerStatsApp.loading = true;
            kickerStatsDataService.fetchData(false, function (data) {
                kickerStatsApp.loadData(data);
            });
        }
    }
});