using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using Google.Apis.Util.Store;
using Kicker.Stats.Models;
using Microsoft.Extensions.Caching.Memory;

namespace Kicker.Stats.Services
{
    public class GoogleDocsRepository : IGameRepository
    {
        private class Column
        {
            public const int Date = 0;
            public const int KeeperA = 1;
            public const int StrikerA = 2;
            public const int ScoreA = 3;
            public const int ScoreB = 4;
            public const int KeeperB = 5;
            public const int StrikerB = 6;
        }

        static readonly string[] _scopes = { SheetsService.Scope.SpreadsheetsReadonly };

        private readonly IMemoryCache _cache;

        static readonly string _cacheKey = "kickerStats";

        public GoogleDocsRepository(IMemoryCache cache)
        {
            _cache = cache;
        }

        public IEnumerable<GameResult> GetResults(string year)
        {
            return GetResults(true, year);
        }

        public IEnumerable<GameResult> GetResults(bool useCache, string year)
        {
            if(!IsYear(year)) { year = DateTime.UtcNow.Year.ToString(); }

            var cacheKey = $"{_cacheKey}_{year}";

            IEnumerable<GameResult> result;

            if (!useCache) {
                _cache.Remove(cacheKey);
            }

            if (!_cache.TryGetValue(cacheKey, out result))
            {
                result = GetResultsFromServer(year);
                _cache.Set(cacheKey, result, TimeSpan.FromMinutes(30));
            }

            return result;
        }

        private IEnumerable<GameResult> GetResultsFromServer(string year)
        {
            var result = new List<GameResult>();

            var credential = GetCredential();

            var service = GetService(credential);

            var metadata = service.Spreadsheets.DeveloperMetadata;

            var request = GetRequest(service, year);

            ValueRange response = request.Execute();

            var values = response.Values;

            foreach (var row in values)
            {
                if (row.Count < 7) { continue; }

                if (!int.TryParse(row[Column.ScoreA].ToString(), out int scoreA)) { continue; }
                if (!int.TryParse(row[Column.ScoreB].ToString(), out int scoreB)) { continue; }

                result.Add(new GameResult(row[Column.Date].ToString(),
                                          row[Column.KeeperA].ToString(),
                                          row[Column.StrikerA].ToString(),
                                          row[Column.KeeperB].ToString(),
                                          row[Column.StrikerB].ToString(),
                                          scoreA,
                                          scoreB));
            }

            return result;
        }

        private SpreadsheetsResource.ValuesResource.GetRequest GetRequest(SheetsService service, string year)
        {
            String spreadsheetId = "1MVQfSWt6WOAq0c_4zIWS4sAUnRj7GhVHrYtk_wLDy8c";
            String range = $"{year}!A2:G";
            return service.Spreadsheets.Values.Get(spreadsheetId, range);
        }

        private SheetsService GetService(GoogleCredential credential)
        {
            // Create Google Sheets API service.
            return new SheetsService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = "Kicker.Stats"
            });
        }

        private GoogleCredential GetCredential()
        {
            using (var stream = new FileStream("Configuration/service-account-key.json", FileMode.Open, FileAccess.Read))
            {
                return GoogleCredential.FromStream(stream)
                    .CreateScoped(_scopes);
            }
        }

        private bool IsYear(string year)
        {
            int yearNumber;

            if (year == null || year.Length != 4) { return false; }

            return int.TryParse(year, out yearNumber);
        }

    }
}
