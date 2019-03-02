using System;
using System.Collections.Generic;
using Kicker.Stats.Models;

namespace Kicker.Stats.Services
{
    public class GoogleDocsRepository : IGameRepository
    {
        public IEnumerable<GameResult> GetResults()
        {
            return new List<GameResult>
            {
                new GameResult(DateTime.Now, "Aaron", "Bruno", "Wim", "Koen", 10, 6),
                new GameResult(DateTime.Now, "Aaron", "Bruno", "Wim", "Koen", 6, 10),
                new GameResult(DateTime.Now, "Aaron", "Szilard", "Wim", "Koen", 10, 6),
                new GameResult(DateTime.Now, "Anthony", "Vincent", "Wim", "Koen", 6, 10),
                new GameResult(DateTime.Now, "Aaron", "Bruno", "Wim", "Koen", 10, 6),
                new GameResult(DateTime.Now, "Anthony", "Bruno", "Wim", "Vincent", 6, 10)
            };
        }
    }
}
