export interface MediaInput {
    url: string;
    path: string;
    fileName: string | null;
    mimeType: string | null;
    size: number | null;
}

export interface Media {
    url: string;
    path: string;
    fileName: string | null;
    mimeType: string | null;
    size: number | null;
    productId: string | null;
    variantId: string | null;
    userId: string | null
    merchnatId: string | null
}