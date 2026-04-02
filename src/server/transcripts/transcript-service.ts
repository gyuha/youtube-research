import {
  YoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
} from 'youtube-transcript';

function isNoCaptionsError(error: unknown) {
  return (
    error instanceof YoutubeTranscriptDisabledError ||
    error instanceof YoutubeTranscriptNotAvailableError
  );
}

export const transcriptService = {
  async getTranscript(youtubeVideoId: string): Promise<string | null> {
    try {
      const items = await YoutubeTranscript.fetchTranscript(youtubeVideoId);

      if (items.length === 0) {
        return null;
      }

      return items.map((item) => item.text.trim()).join(' ').trim() || null;
    } catch (error) {
      if (isNoCaptionsError(error)) {
        return null;
      }

      throw error;
    }
  },
};
