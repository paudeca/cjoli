export interface Message {
  id: number;
  isPublished: boolean;
  mediaContentType: string;
  mediaUrl: string;
  messageId: string;
  time: Date;
}
