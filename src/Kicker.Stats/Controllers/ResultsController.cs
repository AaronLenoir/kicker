using Kicker.Stats.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace Kicker.Stats.Controllers
{
    [Produces("application/json")]
    [Route("api/Results")]
    public class ResultsController : Controller
    {
        // GET api/results
        [HttpGet]
        public IEnumerable<GameResult> Get()
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