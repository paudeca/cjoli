namespace cjoli.Server.Dtos
{
    public class GalleryDto
    {
        public int Page { get;set; }
        public int PageSize { get;set; }
        public int Total { get;set; }
        public int TotalWaiting { get; set; }
        public List<MessageDto> Messages { get;set; } = new List<MessageDto>();
    }
}
