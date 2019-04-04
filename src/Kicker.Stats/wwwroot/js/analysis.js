let KickerStatsAnalysis = (function (data) {

    /*
     * Team Stats
     */

    let Team = function (keeper, striker) {
        let self = this;

        self.keeper = keeper;
        self.striker = striker;
        self.getTeamId = function () {
            return keeper + " - " + striker;
        };
    };

    let EloRating = function () {
        let self = this;

        let _factor = 400;
        let _kFactor = 32;

        self.rating = _factor;

        self.updateRating = function (ourScore, theirScore, theirRating, ourCustomRating) {
            let ourRating = ourCustomRating || self.rating;

            let qa = Math.pow(10, ourRating / _factor);
            let qb = Math.pow(10, theirRating / _factor);

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

            self.rating += _kFactor * (ourResult - ourExpectedResult);
        };
    };

    let TeamStat = function (team) {
        let self = this;

        self.team = team;
        self.gamesWon = 0;
        self.gamesPlayed = 0;
        self.winRatio = 0;
        self.longestStreak = 0;
        self.currentStreak = 0;

        self.highestRatingEver = 0;

        self.eloRating = new EloRating();


        self.updateStreak = function () {
            self.currentStreak++;
            if (self.currentStreak > self.longestStreak) { self.longestStreak = self.currentStreak; }
        };

        self.endStreak = function () {
            self.currentStreak = 0;
        };

        self.updateHighestRating = function () {
            if (self.eloRating.rating > self.highestRatingEver) {
                self.highestRatingEver = self.eloRating.rating;
            }
        };
    };

    let TeamStats = function () {
        let self = this;

        self.allTeams = [];

        self.longestStreak = 0;

        self.sortByRatingDesc = function () {
            self.allTeams.sort(function (a, b) {
                if (a.eloRating.rating < b.eloRating.rating) { return 1; }
                if (a.eloRating.rating > b.eloRating.rating) { return -1; }
                return 0;
            });
        };

        self.addGame = function (game) {
            let teamA = new Team(game.keeperA, game.strikerA);
            let teamB = new Team(game.keeperB, game.strikerB);

            let teamAStat = self.allTeams.find(function (teamStat) { return teamStat.team.getTeamId() === teamA.getTeamId(); });
            let teamBStat = self.allTeams.find(function (teamStat) { return teamStat.team.getTeamId() === teamB.getTeamId(); });

            if (!teamAStat) {
                teamAStat = new TeamStat(teamA);
                self.allTeams.push(teamAStat);
            }
            if (!teamBStat) {
                teamBStat = new TeamStat(teamB);
                self.allTeams.push(teamBStat);
            }

            teamAStat.gamesPlayed++;
            teamBStat.gamesPlayed++;

            if (game.scoreA === 10) {
                teamAStat.gamesWon++;
                teamAStat.updateStreak();
                teamBStat.endStreak();
            } else {
                teamBStat.gamesWon++;
                teamBStat.updateStreak();
                teamAStat.endStreak();
            }

            if (teamAStat.longestStreak > self.longestStreak) {
                self.longestStreak = teamAStat.longestStreak;
            }
            if (teamBStat.longestStreak > self.longestStreak) {
                self.longestStreak = teamBStat.longestStreak;
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
        };
    };

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
            let playerStat = self.allPlayers.find(function (playerStat) { return playerStat.name === name; });

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

            teamAPlayers.keeper = self.allPlayers.find(function (playerStat) { return playerStat.name === game.keeperA; });
            teamAPlayers.striker = self.allPlayers.find(function (playerStat) { return playerStat.name === game.strikerA; });

            teamBPlayers.keeper = self.allPlayers.find(function (playerStat) { return playerStat.name === game.keeperB; });
            teamBPlayers.striker = self.allPlayers.find(function (playerStat) { return playerStat.name === game.strikerB; });

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

            for (let i = 0; i < self.allPlayers.length; i++) {
                let player = self.allPlayers[i];

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
            let playerStat = self.allPlayers.find(function (playerStat) { return playerStat.name === name; });
            return playerStat;
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

            self.longestTeamStreak.teams = teamStats.allTeams.filter(function (team) { return team.longestStreak === self.longestTeamStreak.streak });

            self.longestPlayerStreak.streak = playerStats.allPlayers.reduce(function (previous, current) {
                if (current.longestStreak > previous.longestStreak) {
                    return current;
                } else {
                    return previous;
                }
            }).longestStreak;

            self.longestPlayerStreak.players = playerStats.allPlayers.filter(function (player) { return player.longestStreak === self.longestPlayerStreak.streak });

            let keepers = playerStats.allPlayers.filter(function (player) { return player.timesPlayedAsKeeper >= 10 });

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
        };

        self.loadStats();
    }

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

        playerStats.updateWithTeamStats(teamStats);
        playerStats.updateParticipation(rawData.length);

        playerStats.sortByRating();

        let globalStats = new GlobalStats(rawData, playerStats, teamStats);

        return {
            playerStats: playerStats,
            teamStats: teamStats,
            globalStats: globalStats,
            getPlayerStat: function (name) {
                return playerStats.allPlayers.find(function (playerStat) { return playerStat.name === name; });
            }
        };
    };

    return function (data) {
        let self = this;

        self.rawData = data.reverse();
        self.stats = getAllStats(self.rawData);
    };
}());