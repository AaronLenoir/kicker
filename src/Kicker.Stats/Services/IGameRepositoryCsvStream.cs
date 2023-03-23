using Kicker.Stats.Models;
using System.Collections.Generic;

namespace Kicker.Stats.Services
{
    public interface IGameRepositoryCsvStream
    {
        IAsyncEnumerable<string> GetResults();
    }
}
