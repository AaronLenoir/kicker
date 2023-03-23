using Google.Apis;
using Kicker.Stats.Models;
using Kicker.Stats.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Kicker.Stats.Controllers
{
    [Route("api/Results/Csv")]
    public class ResultsCsvController : Controller
    {
        private IGameRepositoryCsvStream _gameRepository;

        public ResultsCsvController(IGameRepositoryCsvStream gameRepository)
        {
            _gameRepository = gameRepository;
        }

        // GET api/results
        [HttpGet]
        public async IAsyncEnumerable<string> Get()
        {
            await foreach(var result in _gameRepository.GetResults())
            {
                yield return result;
            }
        }
    }
}