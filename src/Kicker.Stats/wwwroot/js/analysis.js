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
        self.eloRating = new TeamEloRating(team);

        let _currentStreak = 0;

        self.updateStreak = function () {
            _currentStreak++;
            if (_currentStreak > self.longestStreak) { self.longestStreak = _currentStreak; }
        };

        self.endStreak = function () {
            _currentStreak = 0;
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
        self.longestStreak = 0;
        self.averageTeamRating = 0;
        self.highestTeamRank = 0;

        let _currentStreak = 0;

        self.updateStreak = function () {
            _currentStreak++;
            if (_currentStreak > self.longestStreak) { self.longestStreak = _currentStreak; }
        };

        self.endStreak = function () {
            _currentStreak = 0;
        };
    }

    let PlayerStats = function () {
        let self = this;

        self.allPlayers = [];

        self.sortByName = function () {
            self.allPlayers.sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
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
        };

        self.addGame = function (game) {
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

                for (let j = 0; j < teamStats.allTeams.length; j++) {
                    let teamRank = j + 1;
                    if (teamStats.allTeams[j].team.getTeamId().indexOf(player.name) > -1) {
                        if (player.highestTeamRank === 0 || player.highestTeamRank > teamRank) { player.highestTeamRank = teamRank; }

                        totalRating += teamStats.allTeams[j].eloRating.rating;
                        totalTeams++;
                    }
                }

                player.averageTeamRating = totalRating / totalTeams;
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

        playerStats.sortByName();
        teamStats.sortByRatingDesc();

        playerStats.updateWithTeamStats(teamStats);

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