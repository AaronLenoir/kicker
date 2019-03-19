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

    let TeamEloRating = function (team) {
        let self = this;

        let _factor = 400;
        let _kFactor = 32;

        self.team = team;
        self.rating = _factor;

        self.updateRating = function (ourScore, theirScore, theirRating) {
            let qa = Math.pow(10, self.rating / _factor);
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

            self.rating = self.rating + _kFactor * (ourResult - ourExpectedResult);
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
        self.eloRating = new TeamEloRating(team);


        self.updateStreak = function () {
            self.currentStreak++;
            if (self.currentStreak > self.longestStreak) { self.longestStreak = self.currentStreak; }
        };

        self.endStreak = function () {
            self.currentStreak = 0;
        };
    };

    let TeamStats = function () {
        let self = this;

        self.allTeams = [];

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

            teamAStat.winRatio = teamAStat.gamesWon / teamAStat.gamesPlayed;
            teamBStat.winRatio = teamBStat.gamesWon / teamBStat.gamesPlayed;

            let teamARating = teamAStat.eloRating.rating;
            let teamBRating = teamBStat.eloRating.rating;
            teamAStat.eloRating.updateRating(game.scoreA, game.scoreB, teamBRating);
            teamBStat.eloRating.updateRating(game.scoreB, game.scoreA, teamARating);
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
        self.winRatio = 0;
        self.participationRatio = 0;
        self.rating = 0;
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
    }

    let PlayerStats = function () {
        let self = this;

        self.allPlayers = [];

        self.totalGames = 0;

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
                if (a.rating < b.rating) { return 1; }
                if (a.rating > b.rating) { return -1; }
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

            playerStat.winRatio = playerStat.gamesWon / playerStat.gamesPlayed;

            playerStat.participationRatio = playerStat.gamesPlayed / self.totalGames;

            playerStat.rating = playerStat.winRatio * playerStat.participationRatio;

            playerStat.updatePreferredPosition(position);
        };

        self.addGame = function (game) {
            self.totalGames++;

            self.updatePlayer(game.keeperA, "keeper", game.scoreA, game.scoreB);
            self.updatePlayer(game.strikerA, "striker", game.scoreA, game.scoreB);
            self.updatePlayer(game.keeperB, "keeper", game.scoreB, game.scoreA);
            self.updatePlayer(game.strikerB, "striker", game.scoreB, game.scoreA);
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
    };

    self.getAllStats = function (rawData) {
        let playerStats = new PlayerStats();
        let teamStats = new TeamStats();

        // rawData has most recent game first, so we go backwards
        for (let i = rawData.length - 1; i >= 0; i--) {
            let game = rawData[i];

            playerStats.addGame(game);
            teamStats.addGame(game);
        }

        teamStats.sortByRatingDesc();

        playerStats.updateWithTeamStats(teamStats);

        playerStats.sortByRating();

        return {
            playerStats: playerStats,
            teamStats: teamStats
        };
    };

    return function (data) {
        let self = this;

        self.rawData = data.reverse();
        self.stats = getAllStats(self.rawData);
    };
}());