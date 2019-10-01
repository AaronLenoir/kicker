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

        this.rating += Math.round(this._kFactor * (ourResult - ourExpectedResult));
    }
}

/*
 * Team stats
 */

class Team {
    constructor(keeper, striker) {
        this.keeper = keeper;
        this.striker = striker;
        this.teamId = keeper + ' - ' + striker;
    }

    getTeamId() {
        return this.teamId;
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

        let teamAStat = this.allTeams.find((teamStat) => teamStat.team.teamId === teamA.teamId);
        let teamBStat = this.allTeams.find((teamStat) => teamStat.team.teamId === teamB.teamId);

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

        game.teamA = teamA;
        game.teamB = teamB;
    }
}

/*
 * Player Stats
 */

class PlayerStat {
    constructor(name) {
        this.name = name;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.totalGoalsAllowed = 0;
        this.averageGoalsAllowed = 0;
        this.winRatio = 0;
        this.participationRatio = 0;
        this.eloRating = new EloRating();
        this.ranking = 0;
        this.longestStreak = 0;
        this.currentStreak = 0;
        this.averageTeamRating = 0;
        this.averageKeeperTeamRating = 0;
        this.averageStrikerTeamRating = 0;
        this.highestTeamRank = 0;
        this.highestRankingTeam = {
            team: undefined,
            ranking: 0
        };

        this.highestRatingEver = 0;

        this.preferredPosition = {
            position: 'unknown',
            ratio: 0
        };
        this.bestPosition = {
            position: 'unknown',
            averageTeamRating: 0
        };
        this.timesPlayedAsKeeper = 0;
        this.timesPlayedAsStriker = 0;
    }

    updateStreak() {
        this.currentStreak++;
        if (this.currentStreak > this.longestStreak) { this.longestStreak = this.currentStreak; }
    }

    endStreak() {
        this.currentStreak = 0;
    }

    addPosition(positionPlayed) {
        if (positionPlayed === 'keeper') { this.timesPlayedAsKeeper++; }
        if (positionPlayed === 'striker') { this.timesPlayedAsStriker++; }
    }

    updatePreferredPositionRatio() {
        if (this.timesPlayedAsKeeper > this.timesPlayedAsStriker) {
            this.preferredPosition.position = 'keeper';
            this.preferredPosition.ratio = this.timesPlayedAsKeeper / (this.timesPlayedAsStriker + this.timesPlayedAsKeeper);
        }
        if (this.timesPlayedAsKeeper < this.timesPlayedAsStriker) {
            this.preferredPosition.position = 'striker';
            this.preferredPosition.ratio = this.timesPlayedAsStriker / (this.timesPlayedAsStriker + this.timesPlayedAsKeeper);
        }
        if (this.timesPlayedAsKeeper === this.timesPlayedAsStriker) {
            this.preferredPosition.position = 'both';
            this.preferredPosition.ratio = 0.5;
        }
    }

    updateHighestRating() {
        if (this.eloRating.rating > this.highestRatingEver) {
            this.highestRatingEver = this.eloRating.rating;
        }
    }
}

class PlayerStats {
    constructor() {
        this.allPlayers = [];

        this.totalGames = 0;
        this.longestStreak = 0;
    }

    sortByName() {
        this.allPlayers.sort(function (a, b) {
            if (a.name < b.name) { return -1; }
            if (a.name > b.name) { return 1; }
            return 0;
        });
    }

    sortByAverageTeamRating() {
        this.allPlayers.sort(function (a, b) {
            if (a.averageTeamRating < b.averageTeamRating) { return 1; }
            if (a.averageTeamRating > b.averageTeamRating) { return -1; }
            return 0;
        });
    }

    sortByRating() {
        this.allPlayers.sort(function (a, b) {
            if (a.eloRating.rating < b.eloRating.rating) { return 1; }
            if (a.eloRating.rating > b.eloRating.rating) { return -1; }
            return 0;
        });
    }

    updatePlayer(name, position, ourScore, otherScore) {
        let playerStat = this.allPlayers.find((playerStat) => playerStat.name === name);

        if (!playerStat) {
            playerStat = new PlayerStat(name);
            this.allPlayers.push(playerStat);
        }

        playerStat.gamesPlayed++;

        if (ourScore > otherScore) {
            playerStat.gamesWon++;
            playerStat.updateStreak();
        } else {
            playerStat.endStreak();
        }

        if (playerStat.currentStreak > this.longestStreak) {
            this.longestStreak = playerStat.currentStreak;
        }

        playerStat.winRatio = playerStat.gamesWon / playerStat.gamesPlayed;

        playerStat.addPosition(position);

        if (position === 'keeper') {
            playerStat.totalGoalsAllowed += otherScore;
            //playerStat.averageGoalsAllowed = playerStat.totalGoalsAllowed / playerStat.timesPlayedAsKeeper;
        }
    }

    updatePlayerRatings(game) {
        let teamAPlayers = {};
        let teamBPlayers = {};

        teamAPlayers.keeper = this.allPlayers.find((playerStat) => playerStat.name === game.keeperA);
        teamAPlayers.striker = this.allPlayers.find((playerStat) => playerStat.name === game.strikerA);

        teamBPlayers.keeper = this.allPlayers.find((playerStat) => playerStat.name === game.keeperB);
        teamBPlayers.striker = this.allPlayers.find((playerStat) => playerStat.name === game.strikerB);

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
    }

    addGame(game) {
        this.updatePlayer(game.keeperA, 'keeper', game.scoreA, game.scoreB);
        this.updatePlayer(game.strikerA, 'striker', game.scoreA, game.scoreB);
        this.updatePlayer(game.keeperB, 'keeper', game.scoreB, game.scoreA);
        this.updatePlayer(game.strikerB, 'striker', game.scoreB, game.scoreA);

        this.updatePlayerRatings(game);
    }

    updateWithTeamStats(teamStats) {
        for (let player of this.allPlayers) {
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

                if (team.teamId.indexOf(player.name) > -1) {
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
                player.bestPosition.position = 'keeper';
                player.bestPosition.averageTeamRating = player.averageKeeperTeamRating;
            }

            if (player.averageKeeperTeamRating < player.averageStrikerTeamRating) {
                player.bestPosition.position = 'striker';
                player.bestPosition.averageTeamRating = player.averageStrikerTeamRating;
            }

            if (player.averageKeeperTeamRating === player.averageStrikerTeamRating) {
                player.bestPosition.position = 'both';
                player.bestPosition.averageTeamRating = player.averageKeeperTeamRating;
            }
        }
    }

    updateRatios(totalGames) {
        for (let i = 0; i < this.allPlayers.length; i++) {
            let playerStat = this.allPlayers[i];
            playerStat.participationRatio = this.allPlayers[i].gamesPlayed / totalGames;
            playerStat.updatePreferredPositionRatio();
            playerStat.averageGoalsAllowed = playerStat.totalGoalsAllowed / playerStat.timesPlayedAsKeeper;
        }
    }

    getPlayerStat(name) {
        let playerStat = this.allPlayers.find((playerStat) => playerStat.name === name);
        return playerStat;
    }

    getPlayerRanking(name) {
        let frequentPlayers = this.allPlayers.filter((playerStat) => playerStat.gamesPlayed >= 10);
        return frequentPlayers.findIndex((stat) => stat.name === name) + 1;
    }

    getTotalRankedPlayers() {
        return this.allPlayers.filter((playerStat) => playerStat.gamesPlayed >= 10).length;
    }
}

class GlobalStats {
    constructor(rawData, playerStats, teamStats) {
        this.rawData = rawData;
        this.playerStats = playerStats;
        this.teamStats = teamStats;

        this.leadingTeam = undefined;
        this.leadingPlayer = undefined;
        this.longestTeamStreak = {};
        this.longestPlayerStreak = {};
        this.bestKeeper = undefined;

        this.loadStats();
    }

    findLongestTeamStreak(teamStats) {
        let streak = teamStats.allTeams.reduce(function (previous, current) {
            if (current.longestStreak > previous.longestStreak) {
                return current;
            } else {
                return previous;
            }
        }).longestStreak;

        let teams = this.teamStats.allTeams.filter((team) => team.longestStreak === streak);

        return {
            streak: streak,
            teams: teams
        };
    }

    findLongestPlayerStreak(playerStats) {
        let streak = playerStats.allPlayers.reduce(function (previous, current) {
            if (current.longestStreak > previous.longestStreak) {
                return current;
            } else {
                return previous;
            }
        }).longestStreak;

        let players = playerStats.allPlayers.filter((player) => player.longestStreak === streak);

        return {
            streak: streak,
            players: players
        };
    }

    findBestKeeper(playerStats) {
        let keepers = playerStats.allPlayers.filter((player) => player.timesPlayedAsKeeper >= 10);

        if (keepers.length > 0) {
            return keepers.
                reduce(function (previous, current) {
                    if (current.averageGoalsAllowed < previous.averageGoalsAllowed) {
                        return current;
                    } else {
                        return previous;
                    }
                });
        }

        return undefined;
    }

    findBestDefense(teamStats) {
        let frequentPlayerTeams = teamStats.allTeams.filter((team) => team.gamesPlayed >= 5);

        if (frequentPlayerTeams.length > 0) {
            return frequentPlayerTeams.
                reduce(function (previous, current) {
                    if (current.averageGoalsAllowed < previous.averageGoalsAllowed) {
                        return current;
                    } else {
                        return previous;
                    }
                });
        }

        return undefined;
    }

    findHighestRatedTeamEver(teamStats) {
        let highestRatedTeamEver = teamStats.allTeams.reduce(function (previous, current) {
            if (current.highestRatingEver > previous.highestRatingEver) {
                return current;
            } else {
                return previous;
            }
        });

        return highestRatedTeamEver;
    }

    findHighestRatedPlayerEver(playerStats) {
        let highestRatedPlayerEver = playerStats.allPlayers.reduce(function (previous, current) {
            if (current.highestRatingEver > previous.highestRatingEver) {
                return current;
            } else {
                return previous;
            }
        });

        return highestRatedPlayerEver;
    }

    findGamesForPlayer(name) {
        return this.rawData.filter((game) => game.keeperA === name || game.strikerA === name || game.keeperB === name || game.strikerB === name);
    }

    loadStats() {
        this.leadingTeam = this.teamStats.allTeams[0];
        this.leadingPlayer = this.playerStats.allPlayers[0];

        this.longestTeamStreak = this.findLongestTeamStreak(this.teamStats);
        this.longestPlayerStreak = this.findLongestPlayerStreak(this.playerStats);
        this.bestKeeper = this.findBestKeeper(this.playerStats);
        this.bestDefense = this.findBestDefense(this.teamStats);
        this.highestRatedTeamEver = this.findHighestRatedTeamEver(this.teamStats);
        this.highestRatedPlayerEver = this.findHighestRatedPlayerEver(this.playerStats);
    }
}

class KickerStatsAnalysis {
    constructor(data) {
        this.rawData = data.reverse();
        this.stats = this.getAllStats(this.rawData);
    }

    getAllStats(rawData) {
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
        playerStats.updateRatios(rawData.length);

        let globalStats = new GlobalStats(rawData, playerStats, teamStats);

        return {
            playerStats: playerStats,
            teamStats: teamStats,
            globalStats: globalStats,
            getPlayerStat: function (name) {
                return playerStats.allPlayers.find((playerStat) => playerStat.name === name);
            }
        };
    }
}