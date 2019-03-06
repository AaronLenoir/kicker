using Kicker.Stats.Models;
using Kicker.Stats.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace Kicker.Stats.Controllers
{
    [Produces("application/json")]
    [Route("api/Results")]
    public class ResultsController : Controller
    {
        private IGameRepository _gameRepository;

        public ResultsController(IGameRepository gameRepository)
        {
            _gameRepository = gameRepository;
        }

        // GET api/results
        [HttpGet]
        public IEnumerable<GameResult> Get(bool useCache)
        {
            return _gameRepository.GetResults(useCache);
        }
    }
}