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

namespace Kicker.Stats.Services
{
    public class GoogleDocsRepository : IGameRepository
    {
        static readonly string[] Scopes = { SheetsService.Scope.SpreadsheetsReadonly };

        public IEnumerable<GameResult> GetResults()
        {
            //return new List<GameResult>
            //{
            //    new GameResult(DateTime.Now, "Aaron", "Bruno", "Wim", "Koen", 10, 6),
            //    new GameResult(DateTime.Now, "Aaron", "Bruno", "Wim", "Koen", 6, 10),
            //    new GameResult(DateTime.Now, "Aaron", "Szilard", "Wim", "Koen", 10, 6),
            //    new GameResult(DateTime.Now, "Anthony", "Vincent", "Wim", "Koen", 6, 10),
            //    new GameResult(DateTime.Now, "Aaron", "Bruno", "Wim", "Koen", 10, 6),
            //    new GameResult(DateTime.Now, "Anthony", "Bruno", "Wim", "Vincent", 6, 10)
            //};
            var result = new List<GameResult>();

            var credential = GetCredential();

            var service = GetService(credential);

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
                    .CreateScoped(Scopes);
            }
        }

    }
}
