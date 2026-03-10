import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title') || 'Mua Chung Deal';
        const discount = searchParams.get('discount') || '50';
        const image = searchParams.get('image') || '';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0F172A', // slate-900 background
                        position: 'relative',
                    }}
                >
                    {/* Background image if provided */}
                    {image && (
                        <img
                            src={image}
                            alt="Background"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.3, // Darken background slightly to make text pop
                            }}
                        />
                    )}

                    {/* Overlay gradient for readability */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.95))',
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            padding: '40px',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#F97316', // CTA orange
                                color: 'white',
                                padding: '15px 40px',
                                borderRadius: '50px',
                                fontSize: 56,
                                fontWeight: 'bold',
                                marginBottom: 30,
                                boxShadow: '0 10px 25px rgba(249, 115, 22, 0.4)'
                            }}
                        >
                            GIẢM ĐẾN {discount}%
                        </div>

                        <div
                            style={{
                                fontSize: 72,
                                fontWeight: 'bold',
                                color: 'white',
                                lineHeight: 1.2,
                                maxWidth: '1000px',
                                textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                            }}
                        >
                            {title.length > 55 ? title.substring(0, 55) + '...' : title}
                        </div>

                        <div
                            style={{
                                marginTop: 50,
                                fontSize: 36,
                                color: '#94A3B8', // slate-400
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: 600
                            }}
                        >
                            🔥 Mua Chung Co - Càng đông, càng rẻ!
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.error(e);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
