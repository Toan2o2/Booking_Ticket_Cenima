namespace BookingTicketSysten.Services.StoreService
{
    public interface IStorageService
    {
        Task<string?> UploadFileAsync(IFormFile file);
    }
}
