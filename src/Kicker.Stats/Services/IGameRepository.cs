using Kicker.Stats.Models;
using System.Collections.Generic;

namespace Kicker.Stats.Services
{
    public interface IGameRepository
    {
        IEnumerable<string> GetResults();

        IEnumerable<GameResult> GetResults(string year);

        IEnumerable<GameResult> GetResults(bool useCache, string year);
    }
}
