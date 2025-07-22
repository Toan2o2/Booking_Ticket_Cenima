using Amazon.S3.Model;
using Amazon.S3;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel;
using Minio.DataModel.Args;
using BookingTicketSysten.Models.DTOs.StoreDTO;

namespace BookingTicketSysten.Services.StoreService
{
    public class R2StorageService : IStorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly R2Config _r2Config;

        public R2StorageService(IAmazonS3 s3Client, IOptions<R2Config> r2Config)
        {
            _s3Client = s3Client;
            _r2Config = r2Config.Value;
        }

        public async Task<string?> UploadFileAsync(IFormFile file)
        {           
            var fileName = $"{Guid.NewGuid()}-{file.FileName}";
            var endpoint = _r2Config.Endpoint.Replace("https://", "").Replace("http://", "");
            var accessKey = _r2Config.AccessKey;
            var secretKey = _r2Config.SecretKey;
            var bucketName = _r2Config.BucketName;
            var publicUrlBase = _r2Config.PublicUrlBase;

            var minio = new MinioClient()
                .WithEndpoint(endpoint)
                .WithCredentials(accessKey, secretKey)
                .WithSSL(true)
                .Build();

            using (var stream = file.OpenReadStream())
            {
                var putObjectArgs = new PutObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(fileName)
                    .WithStreamData(stream)
                    .WithObjectSize(stream.Length)
                    .WithContentType(file.ContentType);

                await minio.PutObjectAsync(putObjectArgs, CancellationToken.None);
            }
            return $"{publicUrlBase}/{fileName}";
        }
    }
}
