export const shareToZalo = async (link: string, title?: string) => {
    try {
        const { openShareSheet } = await import('zmp-sdk/apis');
        openShareSheet({
            type: 'link',
            data: {
                link,
                chatOnly: false,
            },
            success: () => {
                console.log('Shared to Zalo successfully');
            },
            fail: (err) => {
                console.warn('Fallback share due to Zalo SDK error', err);
                fallbackShare(link, title);
            }
        });
    } catch (err) {
        console.warn('Zalo SDK not available, using fallback share', err);
        fallbackShare(link, title);
    }
};

const fallbackShare = (link: string, title?: string) => {
    if (navigator.share) {
        navigator.share({
            title: title || 'Mua Chung Deal',
            url: link
        }).catch(err => {
            console.error('Error sharing:', err);
            copyToClipboard(link);
        });
    } else {
        copyToClipboard(link);
    }
};

const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Đã copy link deal!');
};
