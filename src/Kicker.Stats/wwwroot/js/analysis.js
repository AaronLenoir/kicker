let KickerStatsAnalysis = (function (data) {
    let TeamEloRating = function (team) {
        let self = this;

        self.team = team;
        self.rating = 400;
    };

    let TeamEloRatings = function (rawData) {
        let self = this;

        self.factor = 400;
        self.kFactor = 32;

        self.calculateRatings = function (rawData) {
            let ratings = [];

            // rawData has most recent game first, so we go backwards
            for (let i = rawData.length - 1; i >= 0; i--) {
                let gameResult = rawData[i];

                let teamA = new Team(gameResult.keeperA, gameResult.strikerA);
                let teamB = new Team(gameResult.keeperB, gameResult.strikerB);

                let ratingA = ratings[teamA.getTeamId()];
                let ratingB = ratings[teamB.getTeamId()];

                if (!ratingA) { ratingA = new TeamEloRating(teamA); ratings[teamA.getTeamId()] = ratingA; }
                if (!ratingB) { ratingB = new TeamEloRating(teamB); ratings[teamB.getTeamId()] = ratingB; }

                let qa = Math.pow(10, ratingA.rating / self.factor);
                let qb = Math.pow(10, ratingB.rating / self.factor);

                let expectedScoreA = qa / (qa + qb);
                let expectedScoreB = qb / (qa + qb);

                // reminder: 0 = loss, 0.5 = win, 1 = Clean win (10 - 0)
                let resultA = 0;
                let resultB = 0;

                if (gameResult.scoreA > gameResult.scoreB) {
                    resultA += 0.5;
                    if (gameResult.scoreB === 0) { resultA += 0.5; }
                }

                if (gameResult.scoreB > gameResult.scoreA) {
                    resultB += 0.5;
                    if (gameResult.scoreA === 0) { resultB += 0.5; }
                }

                ratingA.rating = ratingA.rating + self.kFactor * (resultA - expectedScoreA);
                ratingB.rating = ratingB.rating + self.kFactor * (resultB - expectedScoreB);
            }

            let result = [];
            for (let key in ratings) {
                result.push(ratings[key]);
            }

            return result.sort(function (a, b) { return b.rating - a.rating; });
        };

        self.ratings = self.calculateRatings(rawData);
    };

    let Team = function (keeper, striker) {
        let self = this;

        self.keeper = keeper;
        self.striker = striker;
        self.getTeamId = function () {
            return keeper + " - " + striker;
        };
    };

    let TeamStats = function (team) {
        let self = this;

        self.team = team;
        self.gamesWon = 0;
        self.gamesPlayed = 0;
        self.winRatio = 0;
        self.score = 0;
        self.longestStreak = 0;
        let _currentStreak = 0;

        self.addResult = function (ourScore, otherScore) {
            let weWon = ourScore > otherScore;

            if (weWon) {
                _currentStreak++;
                if (_currentStreak > self.longestStreak) {
                    self.longestStreak = _currentStreak;
                }

                self.gamesWon++;

                self.score += 10;
                if (otherScore === 0) { self.score += 5; }
            } else {
                _currentStreak = 0;

                self.score -= 5;
                if (ourScore === 0) { self.score -= 5; }
            }

            self.gamesPlayed++;

            self.winRatio = self.gamesWon / self.gamesPlayed;
        }
    };

    let loadTeamRanking = function (teamStats) {
        return teamStats.slice(0, 9);
    };

    let loadTeamStats = function (rawData, allPlayers) {
        let result = [];

        // Create all possible teams (even if no games are played that way)
        let teams = [];

        for (let i = 0; i < allPlayers.length; i++) {
            for (let j = 0; j < allPlayers.length; j++) {
                let keeper = allPlayers[i];
                let striker = allPlayers[j];

                if (keeper === striker) { continue; }

                let team = new Team(keeper, striker)
                teams[team.getTeamId()] = new TeamStats(team);
            }
        }

        for (let i = 0; i < rawData.length; i++) {
            let gameResult = rawData[i];

            let teamA = new Team(gameResult.keeperA, gameResult.strikerA);
            let teamB = new Team(gameResult.keeperB, gameResult.strikerB);

            teams[teamA.getTeamId()].addResult(gameResult.scoreA, gameResult.scoreB);
            teams[teamB.getTeamId()].addResult(gameResult.scoreB, gameResult.scoreA);
        }

        for (let key in teams) {
            if (teams[key].gamesPlayed === 0) { continue; }

            result.push(teams[key]);
        }

        result.sort(function (a, b) { return b.score - a.score; });

        return result;
    };

    let getAllPlayers = function (rawData) {
        let allPlayers = [];

        for (let i = 0; i < rawData.length; i++) {
            let playerTypes = ["keeperA", "strikerA", "keeperB", "strikerB"];

            let gameResult = rawData[i];

            for (let j = 0; j < playerTypes.length; j++) {
                let playerType = playerTypes[j];

                let player = gameResult[playerType];

                if (allPlayers.indexOf(player) === -1) { allPlayers.push(player); }
            }
        }

        return allPlayers.sort();
    };

    return function (data) {
        let self = this;

        self.rawData = data.reverse();
        self.allPlayers = getAllPlayers(self.rawData);
        self.teamStats = loadTeamStats(self.rawData, self.allPlayers);
        self.teamRanking = loadTeamRanking(self.teamStats);
        self.eloRatings = new TeamEloRatings(self.rawData);
    };
}());