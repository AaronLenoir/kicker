using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Kicker.Stats.Models
{
    public class GameResult
    {
        public GameResult(DateTime date, string keeperA, string strikerA, string keeperB, string strikerB, int scoreA, int scoreB)
        {
            Date = date;
            KeeperA = keeperA;
            KeeperB = keeperB;
            StrikerA = strikerA;
            StrikerB = strikerB;
            ScoreA = scoreA;
            ScoreB = scoreB;
        }

        public DateTime Date { get; private set; }

        public string KeeperA { get; private set; }

        public string StrikerA { get; private set; }

        public string KeeperB { get; private set; }

        public string StrikerB { get; private set; }

        public int ScoreA { get; private set; }

        public int ScoreB { get; private set; }
    }
}
