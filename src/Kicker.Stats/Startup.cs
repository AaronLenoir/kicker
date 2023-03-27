using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kicker.Stats.Controllers;
using Kicker.Stats.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Kicker.Stats
{
    public class Startup
    {
        private const string CorsPolicyName = "allowCors";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc(x => {
                x.EnableEndpointRouting = false;
            });
            services.AddControllers(x =>
            {
                x.OutputFormatters.Insert(0, new CsvOutputFormatter());
            });

            services.AddSingleton<IMemoryCache, MemoryCache>();
            services.AddSingleton<IGameRepository, GoogleDocsRepository>();
            services.AddSingleton<IGameRepositoryCsvStream, GoogleDocsStreamRepository>();

            services.AddCors(options =>
            {
                options.AddPolicy(name: CorsPolicyName,
                                      policy =>
                                      {
                                          policy.WithOrigins("https://kicker-stats.aaronlenoir.com");
                                      });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDeveloperExceptionPage();
            // Will ensure files from wwwroot are served
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseCors();

            app.UseMvc();

        }
    }
}
