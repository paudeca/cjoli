using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace cjoli.Server.Services
{
    public class StorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        public StorageService(IConfiguration configuation)
        {
            _blobServiceClient = new(configuation.GetConnectionString("AzureStorage"));
        }

        public async Task<string> SaveBlob(Stream data, string uid, string name, string contentType)
        {
            var container = _blobServiceClient.GetBlobContainerClient(uid);
            var blob = container.GetBlobClient(name);
            await blob.UploadAsync(data, new BlobUploadOptions { HttpHeaders = new BlobHttpHeaders { ContentType = contentType } });
            return blob.Uri.AbsoluteUri;
        }

        public void DeleteBlob(string uid, string name)
        {
            var container = _blobServiceClient.GetBlobContainerClient(uid);
            var blob = container.GetBlobClient(name);
            blob.DeleteIfExists();
        }
    }
}
