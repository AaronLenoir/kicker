using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Kicker.Stats.Services
{
    public class CsvOutputFormatter : TextOutputFormatter
    {
        public CsvOutputFormatter() {
            SupportedMediaTypes.Add(MediaTypeHeaderValue.Parse("text/plain"));

            SupportedEncodings.Add(Encoding.UTF8);
            SupportedEncodings.Add(Encoding.Unicode);
        }

        public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding selectedEncoding)
        {
            var httpContext = context.HttpContext;

            if (context.Object is IAsyncEnumerable<string> results)
            {
                await foreach (var result in results)
                {
                    await httpContext.Response.WriteAsync(result, selectedEncoding);
                    await httpContext.Response.WriteAsync("\r\n", selectedEncoding);
                }
            }
        }

        protected override bool CanWriteType(Type? type)
            => typeof(IAsyncEnumerable<string>).IsAssignableFrom(type);

        public override bool CanWriteResult(OutputFormatterCanWriteContext context)
        {
            if (context.Object is IAsyncEnumerable<string>) { return true; }

            return false;
        }
    }
}
