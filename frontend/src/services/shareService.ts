export interface ShareOptions {
  title: string;
  text: string;
  url: string;
}

export const shareService = {
  shareToFacebook: (options: ShareOptions) => {
    const { url, text } = options;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  },

  shareToTwitter: (options: ShareOptions) => {
    const { url, text, title } = options;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title}: ${text}`)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  },

  shareToWhatsApp: (options: ShareOptions) => {
    const { url, text, title } = options;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${text}\n${url}`)}`;
    window.open(shareUrl, '_blank');
  },

  shareToLinkedIn: (options: ShareOptions) => {
    const { url, text, title } = options;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}&title=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  },

  shareViaEmail: (options: ShareOptions) => {
    const { url, text, title } = options;
    const subject = encodeURIComponent(`Check out this story: ${title}`);
    const body = encodeURIComponent(`${text}\n\nRead more: ${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  },

  copyLink: async (url: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          document.body.removeChild(textArea);
          return true;
        } catch (err) {
          document.body.removeChild(textArea);
          return false;
        }
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      return false;
    }
  },

  shareViaWebShare: async (options: ShareOptions): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Web Share API error:', error);
        }
        return false;
      }
    }
    return false;
  },
};
