/*
 * Components 
 */

const GameOverview = {
    props: ['rawdata'],
    data: function () {
        return {
            pageSize: 25,
            showItems: 25,
            showAddPage: true
        };
    },
    methods: {
        addPage: function () {
            this.showItems += this.pageSize;
            if (this.showItems >= this.rawdata.length) {
                this.showItems = this.rawdata.length;
                this.showAddPage = false;
            }
        },
        showAll: function () {
            this.showItems = this.rawdata.length;
            this.showAddPage = false;
        }
    },
    template: `
<div v-if="rawdata">
    <h2>Game history ({{ showItems <= rawdata.length ? 'showing ' + showItems + ' of ' : '' }}{{ rawdata.length }} {{ rawdata.length > 1 ? 'games' : 'game' }})</h2>
    
    <p>
        <span v-if="showAddPage" v-on:click="showAll" class="button-small pure-button">Show all ...</span>
    </p>

    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Date</th>
                <th>Team A (keeper - striker)</th>
                <th>Score</th>
                <th>Team B (keeper - striker)</th>
                <th>Team points</th>
                <th>Team A</th>
                <th>Team B</th>
                <th>Player points</th>
                <th>Keeper team A</th>
                <th>Striker team A</th>
                <th>Keeper team B</th>
                <th>Striker team B</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="(game, index) in rawdata">
                <tr v-if="1 < showItems" v-bind:style="index % 2 === index ? { background: '#F8F8F8' } : {}">
                    <td>{{ game.date }}</td>
                    <td v-bind:style="game.scoreA > game.scoreB ? { background: '#d2ff62' } : {}">
                        <router-link :to="{path: '/team-stats/' + game.keeperA + ' - ' + game.strikerA}">
                            <span>{{ game.keeperA }}</span>
                            <span>-</span>
                            <span>{{ game.strikerA }}</span>
                        </router-link>
                    </td>
                    <td v-bind:style="game.scoreA === 0 || game.scoreB === 0 ? { background: 'black', color: 'white' } : {}">
                        <span>{{ game.scoreA }}</span> - <span>{{ game.scoreB }}</span>
                    </td>
                    <td v-bind:style="game.scoreB > game.scoreA ? { background: '#d2ff62' } : {}">
                        <router-link :to="{path: '/team-stats/' + game.keeperB + ' - ' + game.strikerB}">
                            <span>{{ game.keeperB }}</span>
                            <span>-</span>
                            <span>{{ game.strikerB }}</span>
                        </router-link>
                    </td>
                    <td>
                        <span class="ratingDelta">{{ game.scoreA > game.scoreB ? game.ratings.deltaTeamA.toFixed() : game.ratings.deltaTeamB.toFixed() }}</span>
                    </td>
                    <td v-bind:style="game.scoreA > game.scoreB ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                        <span>{{ game.ratings.oldTeamA.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamA.toFixed() }}</span>
                    </td>
                    <td v-bind:style="game.scoreB > game.scoreA ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                        <span>{{ game.ratings.oldTeamB.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamB.toFixed() }}</span>
                    </td>
                    <td>
                        <span class="ratingDelta">{{ game.scoreA > game.scoreB ? game.ratings.deltaTeamAKeeper.toFixed() : game.ratings.deltaTeamBKeeper.toFixed() }}</span>
                    </td>
                    <td v-bind:style="game.scoreA > game.scoreB ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                        <span>{{ game.ratings.oldTeamAKeeper.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamAKeeper.toFixed() }}</span>
                       (<router-link :to="{path: '/player-stats/' + game.keeperA}">{{ game.keeperA }}</router-link>)
                    </td>
                    <td v-bind:style="game.scoreA > game.scoreB ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                        <span>{{ game.ratings.oldTeamAStriker.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamAStriker.toFixed() }}</span>
                        (<router-link :to="{path: '/player-stats/' + game.strikerA}">{{ game.strikerA }}</router-link>)
                    </td>
                    <td v-bind:style="game.scoreB > game.scoreA ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                        <span>{{ game.ratings.oldTeamBKeeper.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamBKeeper.toFixed() }}</span>
                        (<router-link :to="{path: '/player-stats/' + game.keeperB}">{{ game.keeperB }}</router-link>)
                    </td>
                    <td v-bind:style="game.scoreB > game.scoreA ? { 'border-bottom': '6px solid #d2ff62' } : { 'border-bottom': '6px solid #ff8989' }">
                        <span>{{ game.ratings.oldTeamBStriker.toFixed() }}</span>&rarr;<span>{{ game.ratings.newTeamBStriker.toFixed() }}</span>
                        (<router-link :to="{path: '/player-stats/' + game.strikerB}">{{ game.strikerB }}</router-link>)
                    </td>
                </tr>
            </template>
        </tbody>
    </table>

    <p>
        <span v-if="showAddPage" v-on:click="addPage" class="button-small pure-button">Show {{ pageSize }} more ...</span>
        <span v-if="showAddPage" v-on:click="showAll" class="button-small pure-button">Show all ...</span>
    </p>
</div>
`
};

const TeamDetails = {
    props: ['stats', 'teamStat'],
    components: {
        'game-overview': GameOverview
    },
    mounted: function () {
        this.loadChart();
    },
    updated: function () {
        this.loadChart();
    },
    methods: {
        loadChart() {
            dataPoints = this.stats.globalStats.getHistoricAnalysisForTeam(this.teamStat.team.keeper, this.teamStat.team.striker).ratingPerDay;

            Highcharts.chart('teamRatingChart', {
                chart: {
                    type: 'spline'
                },
                title: {
                    text: 'Rating over time'
                },
                subtitle: {
                    text: 'Final rating of each day played'
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        formatter() {
                            return Highcharts.dateFormat('%e - %b - %y', this.value);
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Rating'
                    },
                    plotLines: [{
                        color: 'red', // Color value
                        dashStyle: 'longdashdot', // Style of the plot line. Default to solid
                        value: 400, // Value of where the line will appear
                        width: 2 // Width of the line
                    }]
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x:%e. %b}: {point.y:.0f}'
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: true,
                            radius: 3
                        },
                        shadow: true
                    }
                },

                colors: ['#6CF', '#39F', '#06C', '#036', '#000'],

                series: [{
                    name: "Rating",
                    data: dataPoints
                }]
            });
        }
    },
    template: `
<div v-if="!stats.noDataFound">
    <div class="pure-g">
        <div class="pure-u-1 pure-u-md-5-5 stat" >
            <h3>Ranking</h3>
            <div>
                <span class="stat-number">
                    {{ stats.teamStats.getTeamRanking(teamStat.team.teamId) > 0 ? stats.teamStats.getTeamRanking(teamStat.team.teamId) : 'N/A' }}
                    /    
                    {{ stats.teamStats.allTeams.length }}
                </span>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-1-5 stat">
            <h3>Rating</h3>
            <div>
                <span class="stat-number">{{ teamStat.eloRating.rating.toFixed() }}</span>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-1-5 stat">
            <h3>Highest rating ever</h3>
            <div>
                <span class="stat-number">{{ teamStat.highestRatingEver.toFixed() }}</span>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-3-5 stat">
            <h3>Goals allowed</h3>
            <div>
                <span class="stat-number">{{ teamStat.averageGoalsAllowed.toFixed(2) }}</span>
                <div class="small-note">Allowed {{ teamStat.totalGoalsAllowed }} goals in {{ teamStat.gamesPlayed }} games</div>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-1-5 stat">
            <h3>Longest streak</h3>
            <div>
                <span class="stat-number">{{ teamStat.longestStreak }}</span>
                <div class="small-note">Current streak: {{ teamStat.currentStreak }}</div>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-4-5 stat">
            <h3>Win ratio</h3>
            <div>
                <span class="stat-number">{{ (teamStat.winRatio * 100).toFixed(2) }} %</span>
                <div class="small-note">{{ teamStat.gamesWon }} of {{ teamStat.gamesPlayed }} games won</div>
            </div>
        </div>
    </div>

    <div id="teamRatingChart"></div>

    <div>
        <game-overview v-bind:rawdata="stats.globalStats.findGamesForTeam(teamStat.team.keeper, teamStat.team.striker)" />
    </div>
</div>
`
};

const PlayerDetails = {
    props: ['stats', 'playerStat'],
    components: {
        'game-overview': GameOverview
    },
    mounted: function () {
        this.loadChart();
    },
    updated: function () {
        this.loadChart();
    },
    methods: {
        loadChart() {
            dataPoints = this.stats.globalStats.getHistoricAnalysisForPlayer(this.playerStat.name).ratingPerDay;

            Highcharts.chart('ratingChart', {
                chart: {
                    type: 'spline'
                },
                title: {
                    text: 'Rating over time'
                },
                subtitle: {
                    text: 'Final rating of each day played'
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        formatter() {
                            return Highcharts.dateFormat('%e - %b - %y', this.value);
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Rating'
                    },
                    plotLines: [{
                        color: 'red', // Color value
                        dashStyle: 'longdashdot', // Style of the plot line. Default to solid
                        value: 400, // Value of where the line will appear
                        width: 2 // Width of the line
                    }]
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x:%e. %b}: {point.y:.0f}'
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: true,
                            radius: 3
                        },
                        shadow: true
                    }
                },

                colors: ['#6CF', '#39F', '#06C', '#036', '#000'],

                series: [{
                    name: "Rating",
                    data: dataPoints
                }]
            });
        }
    },
    template: `
<div v-if="!stats.noDataFound">
     <div class="pure-g">
        <div class="pure-u-1 pure-u-md-5-5 stat" >
            <h3>Ranking</h3>
            <div>
                <span class="stat-number">
                    {{ stats.playerStats.getPlayerRanking(playerStat.name) > 0 ? stats.playerStats.getPlayerRanking(playerStat.name) : 'N/A' }}
                    /    
                    {{ stats.playerStats.getTotalRankedPlayers() }}
                </span>
                <div class="small-note">Only players with at least 10 games have a ranking</div>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-1-5 stat">
            <h3>Rating</h3>
            <div>
                <span class="stat-number">{{ playerStat.eloRating.rating.toFixed() }}</span>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-1-5 stat">
            <h3>Highest rating ever</h3>
            <div>
                <span class="stat-number">{{ playerStat.highestRatingEver.toFixed() }}</span>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-3-5 stat">
            <h3>Average team rating</h3>
            <div>
                <span class="stat-number">{{ playerStat.averageTeamRating.toFixed() }}</span>
                <div class="small-note">{{ playerStat.averageTeamRating.toFixed(5) }}</div>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-1-5 stat">
            <h3>Longest streak</h3>
            <div>
                <span class="stat-number">{{ playerStat.longestStreak }}</span>
                <div class="small-note">Current streak: {{ playerStat.currentStreak }}</div>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-1-5 stat">
            <h3>Win ratio</h3>
            <div>
                <span class="stat-number">{{ (playerStat.winRatio * 100).toFixed(2) }} %</span>
                <div class="small-note">{{ playerStat.gamesWon }} of {{ playerStat.gamesPlayed }} games won</div>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-3-5 stat">
            <h3>Goals allowed</h3>
            <div>
                <span v-if="playerStat.timesPlayedAsKeeper > 0" class="stat-number">{{ playerStat.averageGoalsAllowed.toFixed(2) }}</span>
                <span v-if="playerStat.timesPlayedAsKeeper === 0" class="stat-number">N/A</span>
                <div v-if="playerStat.timesPlayedAsKeeper > 0" class="small-note">Allowed {{ playerStat.totalGoalsAllowed }} in {{ playerStat.timesPlayedAsKeeper }} games as keeper</div>
                <div v-if="playerStat.timesPlayedAsKeeper === 0" class="small-note">No games played as keeper</div>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-1-5 stat">
            <h3>Preferred position</h3>
            <div>
                <span class="stat-number">{{ playerStat.preferredPosition.position }}</span>
                <div class="small-note">Played {{ (playerStat.preferredPosition.ratio * 100).toFixed(2) }} % of all matches as {{ playerStat.preferredPosition.position }}</div>
            </div>
        </div>

        <div class="pure-u-1 pure-u-md-3-5 stat">
            <h3>Best position</h3>
            <div>
                <span class="stat-number">{{ playerStat.bestPosition.position }}</span>
                <div class="small-note">Average team rating {{ (playerStat.bestPosition.averageTeamRating).toFixed() }}</div>
            </div>
        </div>
        <!--
        <div class="pure-u-1 pure-u-md-1-5">
        {{ playerStat }}
        </div>
        -->
    </div>

    <div id="ratingChart"></div>

    <div>
        <game-overview v-bind:rawdata="stats.globalStats.findGamesForPlayer(playerStat.name)" />
    </div>
</div>
`
};

const TeamComponent = {
    props: ['stats'],
    data: function () {
        return {
            myName: name
        };
    },
    components: {
        'team-details': TeamDetails
    },
    template: `
<div v-if="!stats.noDataFound">
    <h2>Team: <b>{{ $route.params.name }}</b></h2>
    <team-details v-bind:stats="stats" v-bind:teamStat="stats.getTeamStat($route.params.name)" />
</div>
`
};

const Player = {
    props: ['stats'],
    data: function () {
        return {
            myName: name
        };
    },
    components: {
        'player-details': PlayerDetails
    },
    template: `
<div v-if="!stats.noDataFound">
    <h2>Player: <b>{{ $route.params.name }}</b></h2>
    <player-details v-bind:stats="stats" v-bind:playerStat="stats.getPlayerStat($route.params.name)" />
</div>
`
};

const TeamRanking = {
    props: {
        stats: {
            type: Object,
        },
        newStats: {
            type: Object,
        },
        top: {
            type: Number,
            default: undefined
        }
    },
    template: `
<div v-if="!stats.noDataFound">
    <h2>Team ranking {{ top ? '(top ' + top + ')' : '(all)' }}</h2>
    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Rank</th>
                <th style="width: 200px">Keeper - Striker</th>
                <th>Rating <router-link to="/about">(?)</router-link></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(teamStat, index) in stats.newStats.overview.team_ranking.slice(0, top)" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
                <td>
                    <a v-bind:name="'rank_' + (index + 1)"><span>{{ index + 1 }}</span></a>
                </td>
                <td>
                    <router-link :to="{path: 'team-stats/' + teamStat.team}">
                        <span>{{ teamStat.team }}</span>
                    </router-link>
                </td>
                <td>
                    <span>{{ teamStat.rating.toFixed() }}</span>
                </td>
            </tr>
        </tbody>
    </table>
    <div v-if="top" style="margin-top: 1em">
        <router-link to="/team-ranking">Full ranking ...</router-link>
    </div>
</div>`
};

const TeamStatsComponent = {
    props: ['stats'],
    template: `
<div v-if="!stats.noDataFound">
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
                <th>Avg. goals allowed</th>
                <th>Highest rating ever</th>
                <th>Rating <router-link to="/about">(?)</router-link></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(teamStat, index) in stats.teamStats.allTeams" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
                <td>
                    <span>{{ index + 1 }}</span>
                </td>
                <td>
                    <router-link :to="{path: '/team-stats/' + teamStat.team.keeper + ' - ' + teamStat.team.striker}">
                        <span>{{ teamStat.team.keeper }}</span>
                        <span>-</span>
                        <span>{{ teamStat.team.striker }}</span>
                    </router-link>
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
                <td>
                    {{ teamStat.averageGoalsAllowed.toFixed(2) }}
                </td>
                <td>
                    {{ teamStat.highestRatingEver.toFixed() }}
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
            type: Object
        },
        newStats: {
            type: Object
        },
        top: {
            type: Number,
            default: undefined
        }
    },
    template: `
<div v-if="!stats.noDataFound">
    <h2>Player ranking {{ top ? '(top ' + top + ')' : '' }}</h2>
    <table class="pure-table pure-table-bordered">
        <thead>
            <tr>
                <th>Rank</th>
                <th style="width: 200px">Player</th>
                <th>Rating <router-link to="/about">(?)</router-link></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(playerStat, index) in stats.newStats.overview.player_ranking.slice(0, top)" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
                <td>
                    <span>{{ index + 1 }}</span>
                </td>
                <td>
                    <router-link :to="{path: 'player-stats/' + playerStat.player}">{{ playerStat.player }}</router-link>
                </td>
                <td>
                    <span>{{ playerStat.rating.toFixed() }}</span>
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

const PlayerStatsComponent = {
    props: ['stats'],
    template: `
<div v-if="!stats.noDataFound">
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
            <th>Best position <router-link to="/about">(?)</router-link></th>
            <th>Highest rating ever</th>
            <th>Rating</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(playerStat, index) in stats.playerStats.allPlayers" v-bind:style="index % 2 === 1 ? { background: '#F8F8F8' } : {}">
            <td>
                <router-link :to="{path: 'player-stats/' + playerStat.name}">{{ playerStat.name }}</router-link>
            </td>
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
                <span>{{ playerStat.highestRatingEver.toFixed() }}</span>
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

const Overview = {
    props: ['app'],
    methods: {
        refreshData: function () {
            this.$emit('refresh-data');
        }
    },
    components: {
        'game-overview': GameOverview,
        'player-stats': PlayerStatsComponent,
        'team-stats': TeamStatsComponent,
        'team-ranking': TeamRanking,
        'player-ranking': PlayerRanking
    },
    template: `
<div>
    <div v-if="!app.loading && !app.analysis.stats.noDataFound" class="pure-g" style="margin-right: 1em">
        <div class="pure-u-1 pure-u-lg-1-2">
            <h3>
                Leading team
            </h3>
            <div class="leader">
                <router-link :to="{path: '/team-stats/' + app.analysis.stats.newStats.overview.team_ranking[0]?.team}">
                    <span>{{ app.analysis.stats.newStats.overview.team_ranking[0]?.team ??  'Nobody yet' }}</span>
                </router-link>
                <span> ({{ app.analysis.stats.newStats.overview.team_ranking[0]?.rating.toFixed() }})</span>
            </div>
            <team-ranking v-bind:stats="app.analysis.stats" v-bind:newStats="app.analysis.newStats" v-bind:top="10" />
            <h3>
                Longest team streak
            </h3>
            <div>
                <span class="streak">{{ app.analysis.stats.globalStats.longestTeamStreak.streak }}</span>
                <span v-for="(teamStat, index) in app.analysis.stats.globalStats.longestTeamStreak.teams">
                    {{ index > 0 ? ' ; ' : '' }}
                    <router-link :to="{path: '/team-stats/' + teamStat.team.teamId}">{{ teamStat.team.teamId }}</router-link>
                </span>
                <div class="small-note">Consecutive wins</div>
            </div>
            <h3 v-if="app.analysis.stats.globalStats.bestDefense">
                Best defense
            </h3>
            <div v-if="app.analysis.stats.globalStats.bestDefense">
                <span class="streak">{{ app.analysis.stats.globalStats.bestDefense.averageGoalsAllowed.toFixed(2) }}</span>
                <router-link :to="{path: '/team-stats/' + app.analysis.stats.globalStats.bestDefense.team.teamId}">{{ app.analysis.stats.globalStats.bestDefense.team.teamId }}</router-link>
                <div class="small-note">Average goals allowed (at least 5 games)</div>
            </div>
            <h3>
                Highest team rating ever
            </h3>
            <div>
                <span class="streak">{{ app.analysis.stats.globalStats.highestRatedTeamEver.highestRatingEver.toFixed() }}</span>
                <router-link :to="{path: '/team-stats/' + app.analysis.stats.globalStats.highestRatedTeamEver.team.teamId}">{{ app.analysis.stats.globalStats.highestRatedTeamEver.team.teamId }}</router-link>
                <div class="small-note">Current rating: {{ app.analysis.stats.globalStats.highestRatedTeamEver.eloRating.rating.toFixed() }} </div>
            </div>
        </div>
        <div class="pure-u-1 pure-u-lg-1-2">
            <h3>
                Leading player
            </h3>
            <div class="leader">
                <router-link :to="{path: '/player-stats/' + app.analysis.stats.newStats.overview.player_ranking[0]?.player}">
                    <span>{{ app.analysis.stats.newStats.overview.player_ranking[0]?.player ??  'Nobody yet' }}</span>
                </router-link>
                <span> ({{ app.analysis.stats.newStats.overview.player_ranking[0]?.rating.toFixed() }})</span>
            </div>
            <player-ranking v-bind:stats="app.analysis.stats" v-bind:newStats="app.analysis.newStats" v-bind:top="10" />
            <h3>
                Longest player streak
            </h3>
            <div>
                <span class="streak">{{ app.analysis.stats.globalStats.longestPlayerStreak.streak }}</span>
                <span v-for="(playerStat, index) in app.analysis.stats.globalStats.longestPlayerStreak.players">{{ index > 0 ? ', ' : '' }} <router-link :to="{path: 'player-stats/' + playerStat.name}">{{ playerStat.name }}</router-link></span>
                <div class="small-note">Consecutive wins</div>
            </div>
            <h3 v-if="app.analysis.stats.globalStats.bestKeeper">
                Best keeper
            </h3>
            <div v-if="app.analysis.stats.globalStats.bestKeeper">
                <span class="streak">{{ app.analysis.stats.globalStats.bestKeeper.averageGoalsAllowed.toFixed(2) }}</span>
                <span><router-link :to="{path: 'player-stats/' + app.analysis.stats.globalStats.bestKeeper.name}">{{ app.analysis.stats.globalStats.bestKeeper.name }}</router-link></span>
                <div class="small-note">Average goals allowed (at least 10 games as keeper)</div>
            </div>
            <h3>
                Highest player rating ever
            </h3>
            <div>
                <span class="streak">{{ app.analysis.stats.globalStats.highestRatedPlayerEver.highestRatingEver.toFixed() }}</span>
                <span><router-link :to="{path: 'player-stats/' + app.analysis.stats.globalStats.highestRatedPlayerEver.name}">{{ app.analysis.stats.globalStats.highestRatedPlayerEver.name }}</router-link></span>
                <div class="small-note">Current rating: {{ app.analysis.stats.globalStats.highestRatedPlayerEver.eloRating.rating.toFixed() }} </div>
            </div>
        </div>
    </div>
</div>
`
};

const About = {
    template: `
    <div>
        <h2><a name="ratingInfo">Rating info</a></h2>
        <div>
            <h3>Team rating</h3>
            <p class="note">
                The rating is calculated using the "<a href="https://en.wikipedia.org/wiki/Elo_rating_system">Elo Rating</a>" algorithm. In the chart it is rounded to an integer.
            </p>
            <p class="note">
                Based on the rating of two teams, it calculates the expected result, compares it to the actual result and adjusts the ratings accordingly. This means winning from a team with a higher rating than you is more benificial than winning from a team with a lower rating.
            </p>
            <p class="note">
                The expected result is either 0 (loss) or 1 (win).
            </p>
            <p class="note">
                To calculate a new rating for a team, the following calculation is done:
                <div class="math">qa = 10<sup>(x/400)</sup></div>
                <div class="math">qb = 10<sup>(y/400)</sup></div>
                <div class="math">a = qa / (qa + qb)</div>
                <div class="math">z = x + (32 * (b - a))</div>
                <ul class="note">
                    <li>x: current rating</li>
                    <li>y: current rating opponent</li>
                    <li>a: expected result</li>
                    <li>b: actual result</li>
                    <li>z: new rating</li>
                </ul>
            </p>
            <p class="note">
                For the individual ratings, the average of the two player's individual ratings is used as the current rating. Both players receive the same correction of the rating.
            </p>
            <p class="note">
                More information: <a href="https://en.wikipedia.org/wiki/Elo_rating_system">Wikipedia: Elo rating system</a>
            </p>
            <h3>Player rating</h3>
            <p class="note">
                The individual player rating uses the "<a href="https://en.wikipedia.org/wiki/Elo_rating_system">Elo Rating</a>" in a similar way as the Team Rating.
            </p>
            <p class="note">
                Instead of comparing both team ratings, the combined average individual rating of both team members is used. Then the individual rating of each player is adjusted by the same amount, according to the elo calculation.
            </p>
        </div>

        <h2><a name="positionInfo">Best position</a></h2>
        <div>
            <p class="note">
                If teams where the player is keeper perform better on average, then the best position is keeper.
            </p>
            <p class="note">
                If teams where the player is striker perform better on average, then the best position is striker.
            </p>
            <p class="note">
                "Performance" is the average rating of those teams, shown in brackets in the table.
            </p>
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
    { path: '/team-stats', component: TeamStatsComponent },
    { path: '/team-stats/:name', component: TeamComponent },
    { path: '/player-ranking', component: PlayerRanking },
    { path: '/player-stats', component: PlayerStatsComponent },
    { path: '/player-stats/:name', component: Player },
    { path: '/game-history', component: GameOverview },
    { path: '/about', component: About }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes 
});

/*
 * App
 */

const { createApp } = Vue;

const kickerStatsApp = createApp({
    el: '#app',
    data() {
        return {
            appName: "Kicker Stats",
            loading: true,
            refreshing: false,
            noDataFound: true,
            year: new Date().getFullYear(),
            yearTitle: new Date().getFullYear(),
            analysis: {}
        };
    },
    created: function () {
        kickerStatsDataService.fetchData(true, this.year, function (rawData) {
            kickerStatsDataService.fetchStats(kickerStatsApp.year, function (newStats) {
                kickerStatsApp.loadData(rawData, newStats);
                kickerStatsApp.loading = false;
                kickerStatsApp.noDataFound = (rawData.length === 0);
            });
        });
    },
    methods: {
        changeYear: function (year, title) {
            if (title === undefined) { title = year; }

            this.year = year;
            this.yearTitle = title;
            this.refreshData();
        },
        loadData: function (data, newStats) {
            kickerStatsApp.analysis = new KickerStatsAnalysis(data, newStats);
        },
        refreshData: function () {
            kickerStatsApp.refreshing = true;
            kickerStatsDataService.fetchData(false, this.year, function (rawData) {
                kickerStatsDataService.fetchStats(kickerStatsApp.year, function (newStats) {
                    kickerStatsApp.loadData(rawData, newStats);
                    kickerStatsApp.refreshing = false;
                    kickerStatsApp.noDataFound = (rawData.length === 0);
                });
            });
        }
    }
})
  .use(router)
  .mount('#app');