/*
 * Components 
 */

const PlayerDetails = {
    props: ['stats', 'playerStat'],
    template: `
<div>
    <h3>Rating</h3>
    <div>
        <span class="stat-number">{{ playerStat.eloRating.rating.toFixed() }}</span>
        <div class="small-note">{{ playerStat.eloRating.rating.toFixed(5) }}</div>
    </div>

    <h3>Win ratio</h3>
    <div>
        <span class="stat-number">{{ playerStat.winRatio.toFixed(2) }} %</span>
        <div class="small-note">{{ playerStat.gamesWon }} of {{ playerStat.gamesPlayed }} games won</div>
    </div>

    <h3>Longest streak</h3>
    <div>
        <span class="stat-number">{{ playerStat.longestStreak }}</span>
        <div class="small-note">Current streak: {{ playerStat.currentStreak }}</div>
    </div>

    <h3>Preferred position</h3>
    <div>
        <span class="stat-number">{{ playerStat.preferredPosition.position }}</span>
        <div class="small-note">Played {{ (playerStat.preferredPosition.ratio * 100).toFixed(2) }} % of all matches as {{ playerStat.preferredPosition.position }}</div>
    </div>

    <h3>Goals allowed</h3>
    <div>
        <span class="stat-number">{{ playerStat.averageGoalsAllowed.toFixed(2) }} %</span>
        <div class="small-note">Allowed {{ playerStat.totalGoalsAllowed }} in {{ playerStat.timesPlayedAsKeeper }} games as keeper</div>
    </div>

    {{ playerStat }}
</div>
`
};

const Player = {
    props: ['stats'],
    data: function () {
        return {
            myName: name
        }
    },
    components: {
        'player-details': PlayerDetails
    },
    template: `
<div>
    <h2>Player: <b>{{ $route.params.name }}</b></h2>
    <player-details v-bind:playerStat="stats.getPlayerStat($route.params.name)" />
</div>
`
};

const TeamRanking = {
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
                <th style="width: 200px">Keeper - Striker</th>
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
    <div style="margin-bottom: 2em">
        <span style="line-height: 2em; height: 2em; padding: .5em; background-color: orange">Orange: a team breaking its own winning streak record</span>
    </div>
    <div style="margin-bottom: 2em">
        <span style="line-height: 2em; height: 2em; padding: .5em; background-color: #d2ff62">Green: highest winning streak, ever</span>
    </div>
    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Rank</th>
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
                    <span>{{ index + 1 }}</span>
                </td>
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
                <td v-bind:style="teamStat.longestStreak > 1 && teamStat.longestStreak === teamStat.currentStreak ? { background: 'orange' } : {}">{{ teamStat.currentStreak }}</td>
                <td v-bind:style="teamStat.longestStreak === stats.teamStats.longestStreak ? { 'background': '#d2ff62' } : {}">
                    <span>{{ teamStat.longestStreak }}</span>
                </td>
                <td>{{ teamStat.eloRating.rating.toFixed() }}</td>
            </tr>
        </tbody>
    </table>
</div>`
};

const PlayerRanking = {
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
    <h2>Player ranking {{ top ? '(top ' + top + ')' : '' }}</h2>
    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Rank</th>
                <th style="width: 200px">Player</th>
                <th>Rating <a href="#ratingInfo">(?)</a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(playerStat, index) in stats.playerStats.allPlayers.filter(function (playerStat) { return playerStat.gamesPlayed >= 10; }).slice(0, top)" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
                <td>
                    <span>{{ index + 1 }}</span>
                </td>
                <td>
                    <span>{{ playerStat.name }}</span>
                </td>
                <td>
                    <span>{{ playerStat.eloRating.rating.toFixed() }}</span>
                </td>
            </tr>
        </tbody>
    </table>
    <p v-if="!top">Only players with 10 games or more are included in the ranking.</p>
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
    <div style="margin-bottom: 2em">
        <span style="line-height: 2em; height: 2em; padding: .5em; background-color: orange">Orange: a player breaking a personal winning streak record</span>
    </div>
    <div style="margin-bottom: 2em">
        <span style="line-height: 2em; height: 2em; padding: .5em; background-color: #d2ff62">Green: highest winning streak, ever</span>
    </div>
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
            <th>Avg. goals allowed</th>
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
            <td v-bind:style="playerStat.longestStreak > 1 && playerStat.longestStreak === playerStat.currentStreak ? { background: 'orange' } : {}">{{ playerStat.currentStreak }}</td>
            <td v-bind:style="playerStat.longestStreak === stats.playerStats.longestStreak ? { 'background': '#d2ff62' } : {}">
                <span>{{ playerStat.longestStreak }}</span>
            </td>
            <td>{{ playerStat.averageTeamRating.toFixed() }}</td>
            <td>
                <span>{{ playerStat.highestRankingTeam.team.keeper }}</span>
                -
                <span>{{ playerStat.highestRankingTeam.team.striker }}</span>
                (<span>{{ playerStat.highestRankingTeam.ranking }}</span>)
            </td>
            <td>
                <span>{{ playerStat.averageGoalsAllowed.toFixed(2) }}</span>
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
                <span>{{ playerStat.eloRating.rating.toFixed() }}</span>
            </td>
        </tr>
    </tbody>
    </table>
</div>
`
};

const GameOverview = {
    props: ['rawdata'],
    data: function () {
        return {
            showRating: true
        };
    },
    methods: {
        toggleRatings: function () {
            this.showRating = !this.showRating;
        }
    },
    template: `
<div>
    <h2>Game history ({{ rawdata.length }} games)</h2>
    
    <p>
        <span v-if="!showRating" v-on:click="toggleRatings" class="button-small pure-button">Show ratings</span>
        <span v-if="showRating" v-on:click="toggleRatings" class="button-small pure-button">Hide ratings</span>
    </p>

    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Date</th>
                <th>Team A (keeper - striker)</th>
                <th>Score</th>
                <th>Team B (keeper - striker)</th>
                <th v-if="showRating">Team points</th>
                <th v-if="showRating">Team A</th>
                <th v-if="showRating">Team B</th>
                <th v-if="showRating">Player points</th>
                <th v-if="showRating">Keeper team A</th>
                <th v-if="showRating">Striker team A</th>
                <th v-if="showRating">Keeper team B</th>
                <th v-if="showRating">Striker team B</th>
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
                <td v-if="showRating">
                    <span class="ratingDelta">{{ Math.abs(game.ratings.deltaTeamA.toFixed()) }}</span>
                </td>
                <td v-if="showRating" v-bind:style="game.scoreA > game.scoreB ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                    <span>{{ game.ratings.oldTeamA.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamA.toFixed() }}</span>
                </td>
                <td v-if="showRating" v-bind:style="game.scoreB > game.scoreA ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                    <span>{{ game.ratings.oldTeamB.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamB.toFixed() }}</span>
                </td>
                <td v-if="showRating">
                    <span class="ratingDelta">{{ Math.abs(game.ratings.deltaTeamAKeeper.toFixed()) }}</span>
                </td>
                <td v-if="showRating" v-bind:style="game.scoreA > game.scoreB ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                    <span>{{ game.ratings.oldTeamAKeeper.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamAKeeper.toFixed() }}</span>
                    (<span>{{ game.keeperA }}</span>)
                </td>
                <td v-if="showRating" v-bind:style="game.scoreA > game.scoreB ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                    <span>{{ game.ratings.oldTeamAStriker.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamAStriker.toFixed() }}</span>
                    (<span>{{ game.strikerA }}</span>)
                </td>
                <td v-if="showRating" v-bind:style="game.scoreB > game.scoreA ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                    <span>{{ game.ratings.oldTeamBKeeper.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamBKeeper.toFixed() }}</span>
                    (<span>{{ game.keeperB }}</span>)
                </td>
                <td v-if="showRating" v-bind:style="game.scoreB > game.scoreA ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                    <span>{{ game.ratings.oldTeamBStriker.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamBStriker.toFixed() }}</span>
                    (<span>{{ game.strikerB }}</span>)
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
    <div v-if="!app.loading" class="pure-g" style="margin-right: 1em">
        <div class="pure-u-1 pure-u-lg-1-2">
            <h3>
                Leading team
            </h3>
            <div class="leader">
                {{ app.analysis.stats.globalStats.leadingTeam.team.getTeamId() }} ({{ app.analysis.stats.globalStats.leadingTeam.eloRating.rating.toFixed() }})
            </div>
            <team-ranking v-bind:stats="app.analysis.stats" v-bind:top="10" />
            <h3>
                Longest team streak
            </h3>
            <div>
                <span class="streak">{{ app.analysis.stats.globalStats.longestTeamStreak.streak }}</span>
                <span v-for="(teamStat, index) in app.analysis.stats.globalStats.longestTeamStreak.teams">{{ index > 0 ? ' ; ' : '' }}{{ teamStat.team.getTeamId() }}</span>
                <div class="small-note">Consecutive wins</div>
            </div>
        </div>
        <div class="pure-u-1 pure-u-lg-1-2">
            <h3>
                Leading player
            </h3>
            <div class="leader">
                {{ app.analysis.stats.globalStats.leadingPlayer.name }} ({{ app.analysis.stats.globalStats.leadingPlayer.eloRating.rating.toFixed() }})
            </div>
            <player-ranking v-bind:stats="app.analysis.stats" v-bind:top="10" />
            <h3>
                Longest player streak
            </h3>
            <div>
                <span class="streak">{{ app.analysis.stats.globalStats.longestPlayerStreak.streak }}</span>
                <span v-for="(playerStat, index) in app.analysis.stats.globalStats.longestPlayerStreak.players">{{ index > 0 ? ', ' : '' }} {{ playerStat.name }}</span>
                <div class="small-note">Consecutive wins</div>
            </div>
            <h3 v-if="app.analysis.stats.globalStats.bestKeeper">
                Best keeper
            </h3>
            <div v-if="app.analysis.stats.globalStats.bestKeeper">
                <span class="streak">{{ app.analysis.stats.globalStats.bestKeeper.averageGoalsAllowed.toFixed(2) }}</span>
                <span >{{ app.analysis.stats.globalStats.bestKeeper.name }}</span>
                <div class="small-note">Lowest average goals allowed (at least 10 games as keeper)</div>
            </div>
        </div>
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
    { path: '/player-stats/:name', component: Player },
    { path: '/game-history', component: GameOverview }
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