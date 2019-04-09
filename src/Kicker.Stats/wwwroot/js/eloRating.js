class EloRating {
    _factor = 400;
    _kFactor = 32;

    constructor() {
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

export { EloRating };