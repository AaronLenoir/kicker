class EloRating {
    constructor() {
        this._factor = 400;
        this._kFactor = 32;
        this.rating = this._factor;
    }

    updateRating(ourScore, theirScore, theirRating, ourCustomRating) {
        let ourRating = ourCustomRating || this.rating;

        let qa = Math.pow(10, ourRating / this._factor);
        let qb = Math.pow(10, theirRating / this._factor);

        let ourExpectedResult = qa / (qa + qb);

        let ourResult = 0.0;

        if (ourScore > theirScore) {
            // We won
            ourResult += 0.75;
            if (theirScore === 0) { ourResult += 0.25; }
        }

        if (theirScore > ourScore) {
            // We lost
            if (ourScore > 0) { ourResult += 0.25; }
        }

        this.rating += this._kFactor * (ourResult - ourExpectedResult);
    }
}

/*
 * Team stats
 */

class Team {
    constructor(keeper, striker) {
        this.keeper = keeper;
        this.striker = striker;
    }

    getTeamId() {
        return `${this.keeper} - ${this.striker}`;
    }
}

class TeamStat {
    constructor(team) {
        this.team = team;
        this.gamesWon = 0;
        this.gamesPlayed = 0;
        this.averageGoalsAllowed = 0;
        this.totalGoalsAllowed = 0;
        this.winRatio = 0;
        this.longestStreak = 0;
        this.currentStreak = 0;
        this.highestRatingEver = 0;
        this.eloRating = new EloRating();
    }

    updateStreak() {
        this.currentStreak++;
        if (this.currentStreak > this.longestStreak) { this.longestStreak = this.currentStreak; }
    }

    endStreak() {
        this.currentStreak = 0;
    }

    updateHighestRating() {
        if (this.eloRating.rating > this.highestRatingEver) {
            this.highestRatingEver = this.eloRating.rating;
        }
    }
}

class TeamStats {
    constructor() {
        this.allTeams = [];
        this.longestStreak = 0;
    }

    sortByRatingDesc() {
        this.allTeams.sort(function (a, b) {
            if (a.eloRating.rating < b.eloRating.rating) { return 1; }
            if (a.eloRating.rating > b.eloRating.rating) { return -1; }
            return 0;
        });
    }

    addGame(game) {
        let teamA = new Team(game.keeperA, game.strikerA);
        let teamB = new Team(game.keeperB, game.strikerB);

        let teamAStat = this.allTeams.find((teamStat) => teamStat.team.getTeamId() === teamA.getTeamId());
        let teamBStat = this.allTeams.find((teamStat) => teamStat.team.getTeamId() === teamB.getTeamId());

        if (!teamAStat) {
            teamAStat = new TeamStat(teamA);
            this.allTeams.push(teamAStat);
        }
        if (!teamBStat) {
            teamBStat = new TeamStat(teamB);
            this.allTeams.push(teamBStat);
        }

        teamAStat.gamesPlayed++;
        teamBStat.gamesPlayed++;

        teamAStat.totalGoalsAllowed += game.scoreB;
        teamAStat.averageGoalsAllowed = teamAStat.totalGoalsAllowed / teamAStat.gamesPlayed;
        teamBStat.totalGoalsAllowed += game.scoreA;
        teamBStat.averageGoalsAllowed = teamBStat.totalGoalsAllowed / teamBStat.gamesPlayed;

        if (game.scoreA === 10) {
            teamAStat.gamesWon++;
            teamAStat.updateStreak();
            teamBStat.endStreak();
        } else {
            teamBStat.gamesWon++;
            teamBStat.updateStreak();
            teamAStat.endStreak();
        }

        if (teamAStat.longestStreak > this.longestStreak) {
            this.longestStreak = teamAStat.longestStreak;
        }
        if (teamBStat.longestStreak > this.longestStreak) {
            this.longestStreak = teamBStat.longestStreak;
        }

        teamAStat.winRatio = teamAStat.gamesWon / teamAStat.gamesPlayed;
        teamBStat.winRatio = teamBStat.gamesWon / teamBStat.gamesPlayed;

        let teamARating = teamAStat.eloRating.rating;
        let teamBRating = teamBStat.eloRating.rating;
        teamAStat.eloRating.updateRating(game.scoreA, game.scoreB, teamBRating);
        teamBStat.eloRating.updateRating(game.scoreB, game.scoreA, teamARating);

        teamAStat.updateHighestRating();
        teamBStat.updateHighestRating();

        game.ratings = game.ratings || {};
        game.ratings.oldTeamA = teamARating;
        game.ratings.oldTeamB = teamBRating;
        game.ratings.newTeamA = teamAStat.eloRating.rating;
        game.ratings.newTeamB = teamBStat.eloRating.rating;

        game.ratings.deltaTeamA = game.ratings.newTeamA - game.ratings.oldTeamA;
        game.ratings.deltaTeamB = game.ratings.newTeamB - game.ratings.oldTeamB;
    }
}

let KickerStatsAnalysis = (function () {

    /*
     * Player Stats
     */
    let PlayerStat = function (name) {
        let self = this;

        self.name = name;

        self.gamesPlayed = 0;
        self.gamesWon = 0;

        self.totalGoalsAllowed = 0;
        self.averageGoalsAllowed = 0;

        self.winRatio = 0;
        self.participationRatio = 0;
        self.eloRating = new EloRating();
        self.ranking = 0;
        self.longestStreak = 0;
        self.currentStreak = 0;
        self.averageTeamRating = 0;
        self.averageKeeperTeamRating = 0;
        self.averageStrikerTeamRating = 0;
        self.highestTeamRank = 0;
        self.highestRankingTeam = {
            team: undefined,
            ranking: 0
        };

        self.highestRatingEver = 0;

        self.preferredPosition = {
            position: "unknown",
            ratio: 0
        };
        self.bestPosition = {
            position: "unknown",
            averageTeamRating: 0
        };
        self.timesPlayedAsKeeper = 0;
        self.timesPlayedAsStriker = 0;

        self.updateStreak = function () {
            self.currentStreak++;
            if (self.currentStreak > self.longestStreak) { self.longestStreak = self.currentStreak; }
        };

        self.endStreak = function () {
            self.currentStreak = 0;
        };

        self.updatePreferredPosition = function (positionPlayed) {
            if (positionPlayed === "keeper") { self.timesPlayedAsKeeper++; }
            if (positionPlayed === "striker") { self.timesPlayedAsStriker++; }
            if (self.timesPlayedAsKeeper > self.timesPlayedAsStriker) {
                self.preferredPosition.position = "keeper";
                self.preferredPosition.ratio = self.timesPlayedAsKeeper / (self.timesPlayedAsStriker + self.timesPlayedAsKeeper);
            }
            if (self.timesPlayedAsKeeper < self.timesPlayedAsStriker) {
                self.preferredPosition.position = "striker";
                self.preferredPosition.ratio = self.timesPlayedAsStriker / (self.timesPlayedAsStriker + self.timesPlayedAsKeeper);
            }
            if (self.timesPlayedAsKeeper === self.timesPlayedAsStriker) {
                self.preferredPosition.position = "both";
                self.preferredPosition.ratio = 0.5;
            }
        };

        self.updateHighestRating = function () {
            if (self.eloRating.rating > self.highestRatingEver) {
                self.highestRatingEver = self.eloRating.rating;
            }
        };
    };

    let PlayerStats = function () {
        let self = this;

        self.allPlayers = [];

        self.totalGames = 0;
        self.longestStreak = 0;

        self.sortByName = function () {
            //self.allPlayers.sort(function (a, b) {
            //    if (a.name < b.name) { return -1; }
            //    if (a.name > b.name) { return 1; }
            //    return 0;
            //});
            self.allPlayers.sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            });
        };

        self.sortByWinRatio = function () {
            self.allPlayers.sort(function (a, b) {
                if (a.winRatio < b.winRatio) { return 1; }
                if (a.winRatio > b.winRatio) { return -1; }
                return 0;
            });
        };

        self.sortByAverageTeamRating = function () {
            self.allPlayers.sort(function (a, b) {
                if (a.averageTeamRating < b.averageTeamRating) { return 1; }
                if (a.averageTeamRating > b.averageTeamRating) { return -1; }
                return 0;
            });
        };

        self.sortByRating = function () {
            self.allPlayers.sort(function (a, b) {
                if (a.eloRating.rating < b.eloRating.rating) { return 1; }
                if (a.eloRating.rating > b.eloRating.rating) { return -1; }
                return 0;
            });
        };

        self.updatePlayer = function (name, position, ourScore, otherScore) {
            let playerStat = self.allPlayers.find((playerStat) => playerStat.name === name);

            if (!playerStat) {
                playerStat = new PlayerStat(name);
                self.allPlayers.push(playerStat);
            }

            playerStat.gamesPlayed++;

            if (ourScore > otherScore) {
                playerStat.gamesWon++;
                playerStat.updateStreak();
            } else {
                playerStat.endStreak();
            }

            if (playerStat.currentStreak > self.longestStreak) {
                self.longestStreak = playerStat.currentStreak;
            }

            playerStat.winRatio = playerStat.gamesWon / playerStat.gamesPlayed;

            playerStat.updatePreferredPosition(position);

            if (position === "keeper") {
                playerStat.totalGoalsAllowed += otherScore;
                playerStat.averageGoalsAllowed = playerStat.totalGoalsAllowed / playerStat.timesPlayedAsKeeper;
            }
        };

        self.updatePlayerRatings = function (game) {
            let teamAPlayers = {};
            let teamBPlayers = {};

            teamAPlayers.keeper = self.allPlayers.find((playerStat) => playerStat.name === game.keeperA);
            teamAPlayers.striker = self.allPlayers.find((playerStat) => playerStat.name === game.strikerA);

            teamBPlayers.keeper = self.allPlayers.find((playerStat) => playerStat.name === game.keeperB);
            teamBPlayers.striker = self.allPlayers.find((playerStat) => playerStat.name === game.strikerB);

            let teamAAverage = (teamAPlayers.keeper.eloRating.rating + teamAPlayers.striker.eloRating.rating) / 2;
            let teamBAverage = (teamBPlayers.keeper.eloRating.rating + teamBPlayers.striker.eloRating.rating) / 2;

            game.ratings = game.ratings || {};
            game.ratings.oldTeamAKeeper = teamAPlayers.keeper.eloRating.rating;
            game.ratings.oldTeamAStriker = teamAPlayers.striker.eloRating.rating;
            game.ratings.oldTeamBKeeper = teamBPlayers.keeper.eloRating.rating;
            game.ratings.oldTeamBStriker = teamBPlayers.striker.eloRating.rating;

            teamAPlayers.keeper.eloRating.updateRating(game.scoreA, game.scoreB, teamBAverage, teamAAverage);
            teamAPlayers.striker.eloRating.updateRating(game.scoreA, game.scoreB, teamBAverage, teamAAverage);
            teamBPlayers.keeper.eloRating.updateRating(game.scoreB, game.scoreA, teamAAverage, teamBAverage);
            teamBPlayers.striker.eloRating.updateRating(game.scoreB, game.scoreA, teamAAverage, teamBAverage);

            teamAPlayers.keeper.updateHighestRating();
            teamAPlayers.striker.updateHighestRating();
            teamBPlayers.keeper.updateHighestRating();
            teamBPlayers.striker.updateHighestRating();

            if (teamAPlayers.keeper.eloRating.rating > teamAPlayers.keeper.highestRatingEver) { teamAPlayers.keeper.highestRatingEver = teamAPlayers.keeper.eloRating.rating; }
            if (teamAPlayers.striker.eloRating.rating > teamAPlayers.striker.highestRatingEver) { teamAPlayers.striker.highestRatingEver = teamAPlayers.striker.eloRating.rating; }
            if (teamBPlayers.keeper.eloRating.rating > teamBPlayers.keeper.highestRatingEver) { teamBPlayers.keeper.highestRatingEver = eloRating.rating; }
            if (teamBPlayers.striker.eloRating.rating > teamBPlayers.striker.highestRatingEver) { teamBPlayers.striker.highestRatingEver = eloRating.rating; }

            game.ratings.newTeamAKeeper = teamAPlayers.keeper.eloRating.rating;
            game.ratings.newTeamBKeeper = teamBPlayers.keeper.eloRating.rating;
            game.ratings.newTeamAStriker = teamAPlayers.striker.eloRating.rating;
            game.ratings.newTeamBStriker = teamBPlayers.striker.eloRating.rating;

            game.ratings.deltaTeamAKeeper = game.ratings.newTeamAKeeper - game.ratings.oldTeamAKeeper;
            game.ratings.deltaTeamBKeeper = game.ratings.newTeamBKeeper - game.ratings.oldTeamBKeeper;
            game.ratings.deltaTeamAStriker = game.ratings.newTeamAStriker - game.ratings.oldTeamAStriker;
            game.ratings.deltaTeamBStriker = game.ratings.newTeamBStriker - game.ratings.oldTeamBStriker;
        };

        self.addGame = function (game) {
            self.updatePlayer(game.keeperA, "keeper", game.scoreA, game.scoreB);
            self.updatePlayer(game.strikerA, "striker", game.scoreA, game.scoreB);
            self.updatePlayer(game.keeperB, "keeper", game.scoreB, game.scoreA);
            self.updatePlayer(game.strikerB, "striker", game.scoreB, game.scoreA);

            self.updatePlayerRatings(game);
        };

        self.updateWithTeamStats = function (teamStats) {

            for (let player of self.allPlayers) {
                let totalRating = 0;
                let totalTeams = 0;

                let totalKeeperRating = 0;
                let totalStrikerRating = 0;
                let totalKeeperTeams = 0;
                let totalStrikerTeams = 0;

                for (let j = 0; j < teamStats.allTeams.length; j++) {
                    let teamStat = teamStats.allTeams[j];
                    let team = teamStat.team;
                    let teamRank = j + 1;

                    if (team.getTeamId().indexOf(player.name) > -1) {
                        if (player.highestRankingTeam.ranking === 0 || player.highestRankingTeam.ranking > teamRank) {
                            player.highestRankingTeam.team = team;
                            player.highestRankingTeam.ranking = teamRank;
                        }

                        totalRating += teamStat.eloRating.rating;
                        totalTeams++;

                        if (team.keeper === player.name) { totalKeeperRating += teamStat.eloRating.rating; totalKeeperTeams++; }
                        if (team.striker === player.name) { totalStrikerRating += teamStat.eloRating.rating; totalStrikerTeams++; }
                    }
                }

                player.averageTeamRating = totalRating / totalTeams;
                if (totalKeeperTeams > 0) { player.averageKeeperTeamRating = totalKeeperRating / totalKeeperTeams; }
                if (totalStrikerTeams > 0) { player.averageStrikerTeamRating = totalStrikerRating / totalStrikerTeams; }

                if (player.averageKeeperTeamRating > player.averageStrikerTeamRating) {
                    player.bestPosition.position = "keeper";
                    player.bestPosition.averageTeamRating = player.averageKeeperTeamRating;
                }

                if (player.averageKeeperTeamRating < player.averageStrikerTeamRating) {
                    player.bestPosition.position = "striker";
                    player.bestPosition.averageTeamRating = player.averageStrikerTeamRating;
                }

                if (player.averageKeeperTeamRating === player.averageStrikerTeamRating) {
                    player.bestPosition.position = "both";
                    player.bestPosition.averageTeamRating = player.averageKeeperTeamRating;
                }
            }
        };

        self.updateParticipation = function (totalGames) {
            for (let i = 0; i < self.allPlayers.length; i++) {
                self.allPlayers[i].participationRatio = self.allPlayers[i].gamesPlayed / totalGames;
            }
        };

        self.getPlayerStat = function (name) {
            let playerStat = self.allPlayers.find((playerStat) => playerStat.name === name);
            return playerStat;
        };

        self.getPlayerRanking = function (name) {
            let frequentPlayers = self.allPlayers.filter((playerStat) => playerStat.gamesPlayed >= 10);

            return frequentPlayers.findIndex((stat) => stat.name === name) + 1;
        };
    };

    let GlobalStats = function (rawData, playerStats, teamStats) {
        let self = this;

        self.rawData = rawData;
        self.playerStats = playerStats;
        self.teamStats = teamStats;

        self.leadingTeam = undefined;
        self.leadingPlayer = undefined;
        self.longestTeamStreak = {};
        self.longestPlayerStreak = {};
        self.bestKeeper = undefined;

        self.loadStats = function () {
            self.leadingTeam = teamStats.allTeams[0];
            self.leadingPlayer = playerStats.allPlayers[0];

            self.longestTeamStreak.streak = teamStats.allTeams.reduce(function (previous, current) {
                if (current.longestStreak > previous.longestStreak) {
                    return current;
                } else {
                    return previous;
                }
            }).longestStreak;

            self.longestTeamStreak.teams = teamStats.allTeams.filter((team) => team.longestStreak === self.longestTeamStreak.streak);

            self.longestPlayerStreak.streak = playerStats.allPlayers.reduce(function (previous, current) {
                if (current.longestStreak > previous.longestStreak) {
                    return current;
                } else {
                    return previous;
                }
            }).longestStreak;

            self.longestPlayerStreak.players = playerStats.allPlayers.filter((player) => player.longestStreak === self.longestPlayerStreak.streak);

            let keepers = playerStats.allPlayers.filter((player) => player.timesPlayedAsKeeper >= 10);

            if (keepers.length > 0) {
                self.bestKeeper = keepers.
                    reduce(function (previous, current) {
                        if (current.averageGoalsAllowed < previous.averageGoalsAllowed) {
                            return current;
                        } else {
                            return previous;
                        }
                    });
            }

            let frequentPlayerTeams = teamStats.allTeams.filter((team) => team.gamesPlayed >= 5);

            if (frequentPlayerTeams.length > 0) {
                self.bestDefense = frequentPlayerTeams.
                    reduce(function (previous, current) {
                        if (current.averageGoalsAllowed < previous.averageGoalsAllowed) {
                            return current;
                        } else {
                            return previous;
                        }
                    });
            }
        };

        self.loadStats();
    };

    self.getAllStats = function (rawData) {
        let playerStats = new PlayerStats();
        let teamStats = new TeamStats(playerStats);

        // rawData has most recent game first, so we go backwards
        for (let i = rawData.length - 1; i >= 0; i--) {
            let game = rawData[i];

            playerStats.addGame(game);
            teamStats.addGame(game);
        }

        teamStats.sortByRatingDesc();

        playerStats.sortByRating();

        playerStats.updateWithTeamStats(teamStats);
        playerStats.updateParticipation(rawData.length);

        let globalStats = new GlobalStats(rawData, playerStats, teamStats);

        return {
            playerStats: playerStats,
            teamStats: teamStats,
            globalStats: globalStats,
            getPlayerStat: function (name) {
                return playerStats.allPlayers.find((playerStat) => playerStat.name === name);
            }
        };
    };

    return function (data) {
        let self = this;

        self.rawData = data.reverse();
        self.stats = getAllStats(self.rawData);
    };
}());