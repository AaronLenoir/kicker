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
            <tr v-for="(teamStat, index) in stats.teamStats.allTeams" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
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

Vue.component('team-stats', {
    props: ['stats'],
    template: `
<table class="pure-table pure-table-bordered">
    <thead>
        <tr>
            <th>Team (keeper - striker)</th>
            <th>Won / played</th>
            <th>Win ratio</th>
            <th>Current streak</th>
            <th>Longest streak</th>
            <th>Rating <a href="#ratingInfo">(?)</a></th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(teamStat, index) in stats.teamStats.allTeams" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
            <td>
                <span>{{ teamStat.team.keeper }}</span>
                -
                <span>{{ teamStat.team.striker }}</span>
            </td>
            <td>
                <span>{{ teamStat.gamesWon }}</span>
                /
                <span>{{ teamStat.gamesPlayed }}</span>
            </td>
            <td>
                <span>{{ (teamStat.winRatio * 100).toFixed(2) }}</span>
                <span>%</span>
            </td>
            <td>{{ teamStat.currentStreak }}</td>
            <td>{{ teamStat.longestStreak }}</td>
            <td>{{ teamStat.eloRating.rating.toFixed() }}</td>
        </tr>
    </tbody>
</table>`
});

Vue.component('overview', {
    props: ['app'],
    methods: {
        refreshData: function () {
            this.$emit('refresh-data');
        }
    },
    template: `
<div>
    <h1>
        <span>{{ app.appName }}</span>
        <span v-if="app.loading">(loading data ...)</span>
    </h1>

    <div v-if="app.loading" class="pure-button pure-button-disabled">Loading data ...</div>

    <div v-if="!app.loading" v-on:click="refreshData" class="pure-button">Refresh data</div>

    <h2>Team Ranking (all time)</h2>
    <full-team-ranking v-if="!app.loading" v-bind:stats="app.analysis.stats" />

    <h2>Team stats</h2>
    <team-stats v-if="!app.loading" v-bind:stats="app.analysis.stats" />
</div>
`
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