/*
 * Components 
 */

const TeamRanking = {
    props: ['stats'],
    props: {
        stats: {
            type: Object,
        },
        top: {
            type: Number,
            default: undefined
        }
    },
    template: `
<div>
    <h2>Team ranking {{ top ? '(top ' + top + ')' : '(all)' }}</h2>
    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Rank</th>
                <th>Keeper - Striker</th>
                <th>Rating <a href="#ratingInfo">(?)</a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(teamStat, index) in stats.teamStats.allTeams.slice(0, top)" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
                <td>
                    <a v-bind:name="'rank_' + (index + 1)"><span>{{ index + 1 }}</span></a>
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
    <div v-if="top" style="margin-top: 1em">
        <router-link to="/team-ranking">Full ranking ...</router-link>
    </div>
</div>`
};

const TeamStats = {
    props: ['stats'],
    template: `
<div>
    <h2>Team stats ({{ stats.teamStats.allTeams.length }} teams)</h2>
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
    </table>
</div>`
};

const PlayerRanking = {
    props: ['stats'],
    props: {
        stats: {
            type: Object,
        },
        top: {
            type: Number,
            default: undefined
        }
    },
    template: `
<div>
    <h2>Player ranking {{ top ? '(top ' + top + ')' : '(all)' }}</h2>
    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating <a href="#ratingInfo">(?)</a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(playerStat, index) in stats.playerStats.allPlayers.slice(0, top)" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
                <td>
                    <span>{{ index + 1 }}</span>
                </td>
                <td>
                    <span>{{ playerStat.name }}</span>
                </td>
                <td>
                    <span>{{ (playerStat.rating * 10000).toFixed() }}</span>
                </td>
            </tr>
        </tbody>
    </table>
    <div v-if="top" style="margin-top: 1em">
        <router-link to="/player-ranking">Full ranking ...</router-link>
    </div>
</div>`
};

const PlayerStats = {
    props: ['stats'],
    template: `
<div>
    <h2>Player stats ({{ stats.playerStats.allPlayers.length }} players)</h2>
    <table class="pure-table pure-table-bordered">
    <thead>
        <tr>
            <th>Player</th>
            <th>Won / played</th>
            <th>Win ratio</th>
            <th>Participation ratio</th>
            <th>Current streak</th>
            <th>Longest streak</th>
            <th>Average team rating</th>
            <th>Highest ranking team</th>
            <th>Preferred position</th>
            <th>Best position <a href="#positionInfo">(?)</a></th>
            <th>Rating</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(playerStat, index) in stats.playerStats.allPlayers" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
            <td>{{ playerStat.name }}</td>
            <td>
                <span>{{ playerStat.gamesWon }}</span>
                /
                <span>{{ playerStat.gamesPlayed }}</span>
            </td>
            <td>
                <span>{{ (playerStat.winRatio * 100).toFixed(2) }}</span>
                <span>%</span>
            </td>
            <td>
                <span>{{ (playerStat.participationRatio * 100).toFixed(2) }}</span>
                <span>%</span>
            </td>
            <td>{{ playerStat.currentStreak }}</td>
            <td>{{ playerStat.longestStreak }}</td>
            <td>{{ playerStat.averageTeamRating.toFixed() }}</td>
            <td>
                <span>{{ playerStat.highestRankingTeam.team.keeper }}</span>
                -
                <span>{{ playerStat.highestRankingTeam.team.striker }}</span>
                (<span>{{ playerStat.highestRankingTeam.ranking }}</span>)
            </td>
            <td>
                <span>{{ playerStat.preferredPosition.position }}</span>
                (<span>{{ (playerStat.preferredPosition.ratio * 100).toFixed() }}</span> %)
            </td>
            <td>
                <span>{{ playerStat.bestPosition.position }}</span>
                (<span>{{ playerStat.bestPosition.averageTeamRating.toFixed() }}</span>)
            </td>
            <td>
                <span>{{ (playerStat.rating * 10000).toFixed() }}</span>
            </td>
        </tr>
    </tbody>
    </table>
</div>
`
};

const GameOverview = {
    props: ['rawdata'],
    template: `
<div>
    <h2>Game history ({{ rawdata.length }} games)</h2>
    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Date</th>
                <th>Team A (keeper - striker)</th>
                <th>Score</th>
                <th>Team B (keeper - striker)</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(game, index) in rawdata" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
                <td>{{ game.date }}</td>
                <td v-bind:style="game.scoreA > game.scoreB ? { background: '#d2ff62' } : {}">
                    <span>{{ game.keeperA }}</span>
                    -
                    <span>{{ game.strikerA }}</span>
                </td>
                <td v-bind:style="game.scoreA === 0 || game.scoreB === 0 ? { background: 'black', color: 'white' } : {}">
                    <span>{{ game.scoreA }}</span> - <span>{{ game.scoreB }}</span>
                </td>
                <td v-bind:style="game.scoreB > game.scoreA ? { background: '#d2ff62' } : {}">
                    <span>{{ game.keeperB }}</span>
                    -
                    <span>{{ game.strikerB }}</span>
                </td>
            </tr>
        </tbody>
    </table>
</div>
`
};

const Overview = {
    props: ['app'],
    methods: {
        refreshData: function () {
            this.$emit('refresh-data');
        }
    },
    components: {
        'game-overview': GameOverview,
        'player-stats': PlayerStats,
        'team-stats': TeamStats,
        'team-ranking': TeamRanking,
        'player-ranking': PlayerRanking
    },
    template: `
<div>
    <div v-if="!app.loading" class="pure-g">
        <div class="pure-u-1 pure-u-lg-1-3">
            <team-ranking v-bind:stats="app.analysis.stats" v-bind:top="10" />
        </div>
        <div class="pure-u-1 pure-u-lg-1-3">
            <player-ranking v-bind:stats="app.analysis.stats" v-bind:top="10" />
        </div>

        <!--
        <team-stats v-bind:stats="app.analysis.stats" />

        <player-stats v-bind:stats="app.analysis.stats" />
        -->
    </div>
</div>
`
};

/*
 * Routing 
 */

const routes = [
    { path: '/', component: Overview },
    { path: '/overview', component: Overview },
    { path: '/team-ranking', component: TeamRanking },
    { path: '/team-stats', component: TeamStats },
    { path: '/player-ranking', component: PlayerRanking },
    { path: '/player-stats', component: PlayerStats },
    { path: '/game-history', component: GameOverview },
];

const router = new VueRouter({
    routes // short for `routes: routes`
});

/*
 * App
 */ 

const kickerStatsApp = new Vue({
    el: '#app',
    router,
    data: {
        appName: "Kicker Stats",
        loading: true,
        refreshing: false,
        analysis: {}
    },
    created: function () {
        kickerStatsDataService.fetchData(true, function (data) {
            kickerStatsApp.loadData(data);
            kickerStatsApp.loading = false;
        });
    },
    methods: {
        loadData: function (data) {
            kickerStatsApp.analysis = new KickerStatsAnalysis(data);
        },
        refreshData: function () {
            kickerStatsApp.refreshing = true;
            kickerStatsDataService.fetchData(false, function (data) {
                kickerStatsApp.loadData(data);
                kickerStatsApp.refreshing = false;
            });
        }
    }
}).$mount('#app');