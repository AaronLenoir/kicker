using Google.Apis.Auth.OAuth2;
using Google.Apis.Sheets.v4;
using System;
using System.IO;
using System.Net;
using Google.Apis.Services;

namespace Kicker.Stats.Services
{
    public class GoogleDocsService : IDisposable
    {
        static readonly string[] _scopes = { SheetsService.Scope.SpreadsheetsReadonly };

        private const String _spreadsheetId = "1MVQfSWt6WOAq0c_4zIWS4sAUnRj7GhVHrYtk_wLDy8c";

        public SheetsService SheetsService;

        public SpreadsheetsResource Spreadsheets { 
            get {
                return SheetsService.Spreadsheets;
            } 
        }

        public GoogleDocsService()
        {
            SheetsService = GetService(GetCredential());
        }

        public SpreadsheetsResource.GetRequest GetRequest()
        {
            return SheetsService.Spreadsheets.Get(_spreadsheetId);
        }

        public SpreadsheetsResource.ValuesResource.GetRequest GetRequest(string sheet)
        {
            var range = $"{sheet}!A2:G";
            return SheetsService.Spreadsheets.Values.Get(_spreadsheetId, range);
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

        public void Dispose()
        {
            if (SheetsService != null) { SheetsService.Dispose(); }
        }
    }
}
