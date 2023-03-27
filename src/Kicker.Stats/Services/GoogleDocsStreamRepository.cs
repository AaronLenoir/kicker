using Kicker.Stats.Models;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Kicker.Stats.Services
{
    public class GoogleDocsStreamRepository : IGameRepositoryCsvStream
    {

        public GoogleDocsStreamRepository()
        {

        }

        public async IAsyncEnumerable<string> GetResults()
        {
            var line = new StringBuilder();

            using var service = new GoogleDocsService();

            var sheets = service.GetRequest().Execute().Sheets;

            foreach (var sheet in sheets)
            {
                using var values = await service.GetRequest(sheet.Properties.Title).ExecuteAsStreamAsync();

                using var stream = new StreamReader(values);

                while(true)
                {
                    var value = stream.ReadLine();

                    if (value == null)
                    {
                        break;
                    }

                    if (!value.StartsWith("      "))
                    {
                        continue;
                    }

                    value = value.Trim().Replace(",", ";").Replace("\"", "");

                    line.Append(value);

                    if (!value.EndsWith(";"))
                    {
                        yield return line.ToString();

                        line.Clear();
                    }
                }
                
            }

            yield break;
        }

        public IEnumerable<GameResult> GetResults(string year)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<GameResult> GetResults(bool useCache, string year)
        {
            throw new System.NotImplementedException();
        }
    }
}
