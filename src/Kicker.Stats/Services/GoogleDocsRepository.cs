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
        static readonly string[] _scopes = { SheetsService.Scope.SpreadsheetsReadonly };

        private readonly IMemoryCache _cache;

        static readonly string _cacheKey = "kickerStats";

        public GoogleDocsRepository(IMemoryCache cache)
        {
            _cache = cache;
        }

        public IEnumerable<GameResult> GetResults()
        {
            return GetResults(true);
        }

        public IEnumerable<GameResult> GetResults(bool useCache)
        {
            IEnumerable<GameResult> result;

            if (!useCache) {
                _cache.Remove(_cacheKey);
            }

            if (!_cache.TryGetValue(_cacheKey, out result))
            {
                result = GetResultsFromServer();
                _cache.Set(_cacheKey, result, TimeSpan.FromMinutes(30));
            }

            return result;
        }

        private IEnumerable<GameResult> GetResultsFromServer()
        {
            var result = new List<GameResult>();

            var credential = GetCredential();

            var service = GetService(credential);

            var metadata = service.Spreadsheets.DeveloperMetadata;

            var request = GetRequest(service);

            ValueRange response = request.Execute();

            var values = response.Values;

            foreach (var row in values)
            {
                result.Add(new GameResult(row[0].ToString(),
                                          row[1].ToString(),
                                          row[2].ToString(),
                                          row[3].ToString(),
                                          row[4].ToString(),
                                          int.Parse(row[5].ToString()),
                                          int.Parse(row[6].ToString())));
            }

            return result;
        }

        private SpreadsheetsResource.ValuesResource.GetRequest GetRequest(SheetsService service)
        {
            String spreadsheetId = "1MVQfSWt6WOAq0c_4zIWS4sAUnRj7GhVHrYtk_wLDy8c";
            String range = "data!A2:G";
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

    }
}
