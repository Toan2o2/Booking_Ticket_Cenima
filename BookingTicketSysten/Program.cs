using Amazon.Runtime;
using Amazon.S3;
using BookingTicketSysten.Extensions;
using BookingTicketSysten.Middleware;
using BookingTicketSysten.Models;
using BookingTicketSysten.Models.DTOs.StoreDTO;
using BookingTicketSysten.Services.BookingServices;
using BookingTicketSysten.Services.GenerService;
using BookingTicketSysten.Services.MovieServices;
using BookingTicketSysten.Services.PersonServices;
using BookingTicketSysten.Services.ShowServices;
using BookingTicketSysten.Services.CinemaHallServices;
using BookingTicketSysten.Services.CinemaServices;
using BookingTicketSysten.Services.CommentServices;
using BookingTicketSysten.Services.GenerService;
using BookingTicketSysten.Services.MovieServices;
using BookingTicketSysten.Services.PersonServices;
using BookingTicketSysten.Services.SeatServices;
using BookingTicketSysten.Services.StoreService;
using BookingTicketSysten.Services.SystemService;
using BookingTicketSysten.Services.UserSerivce;
using BookingTicketSysten.Services.VoteServices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ProjectHouseWithLeaves.Helper.Email;
using System.Text;
using System.Text.Json.Serialization;

namespace BookingTicketSysten
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            #region Database_Context
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                });
            builder.Services.AddDbContext<MovieTicketBookingSystemContext>(options =>
                 options.UseSqlServer(builder.Configuration.GetConnectionString("MyCnn")));
            #endregion

            #region CORS
            // Add CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
            });
            #endregion

            #region s3Client_with_DI
            builder.Services.Configure<R2Config>(builder.Configuration.GetSection("R2"));
            var r2Config = builder.Configuration.GetSection("R2").Get<R2Config>();

            var s3Config = new AmazonS3Config { ServiceURL = r2Config.Endpoint };
            var credentials = new BasicAWSCredentials(r2Config.AccessKey, r2Config.SecretKey);
            builder.Services.AddSingleton<IAmazonS3>(new AmazonS3Client(credentials, s3Config));

            #endregion

            #region DI_Services
            builder.Services.AddScoped<IPersonService, PersonService>();
            builder.Services.AddScoped<IMovieService, MovieService>();
            builder.Services.AddScoped<IGenreService, GenreService>();
            builder.Services.AddScoped<IStorageService, R2StorageService>();
            builder.Services.AddScoped<IVoteService, VoteService>();
            builder.Services.AddScoped<IMovieFavoriteService, MovieFavoriteService>();
            builder.Services.AddScoped<IVoteService, VoteService>();
            builder.Services.AddScoped<ICommentService, CommentService>();
            builder.Services.AddScoped<ICinemaService, CinemaService>();
            builder.Services.AddScoped<ICinemaHallService, CinemaHallService>();
            builder.Services.AddScoped<ISeatService, SeatService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<JWTConfig>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            // Add Payment Services
            builder.Services.AddPaymentServices();
            // Add City Services
            builder.Services.AddCityServices();

            builder.Services.AddScoped<IShowService, ShowService>();
            builder.Services.AddScoped<IBookingService, BookingService>();

            #endregion

            #region IConfiguration
            builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
            #endregion

            #region mapper
            builder.Services.AddAutoMapper(typeof(Program).Assembly);
            #endregion
            #region JWT
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration["JWT:ValidAudience"],
                    ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]))
                };
                options.Events = new JwtBearerEvents
                {
                    OnChallenge = context =>
                    {
                        context.HandleResponse();
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";
                        var result = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            status = "error",
                            message = "Bạn chưa đăng nhập hoặc token hết hạn",
                            data = (object)null,
                            errors = (object)null
                        });
                        return context.Response.WriteAsync(result);
                    },
                    OnForbidden = context =>
                    {
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";
                        var result = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            status = "error",
                            message = "Bạn không có quyền truy cập",
                            data = (object)null,
                            errors = (object)null
                        });
                        return context.Response.WriteAsync(result);
                    }
                };
            });
            #endregion
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            #region Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(option =>
            {
                            option.SwaggerDoc("v1", new OpenApiInfo { Title = "Management_Schedule", Version = "v1" });
                            option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                            {
                                In = ParameterLocation.Header,
                                Description = "Please enter a valid token",
                                Name = "Authorization",
                                Type = SecuritySchemeType.Http,
                                BearerFormat = "JWT",
                                Scheme = "Bearer"
                            });
                            option.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type=ReferenceType.SecurityScheme,
                                Id="Bearer"
                            }
                        },
                        new string[]{}
                    }
                });
            });
            #endregion

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            // Add Payment Logging Middleware
            app.UsePaymentLogging();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
