export const transcriptService = {
  async getTranscript(youtubeVideoId: string): Promise<string | null> {
    throw new Error(`Transcript adapter is not configured for ${youtubeVideoId}`);
  },
};
