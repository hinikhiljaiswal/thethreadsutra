export type MarketplaceChannel = {
  name: string;
  url: string;
  price: number;
  stockStatus: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  sizes: string[];
  colors: string[];
  channels: MarketplaceChannel[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${apiUrl}/api/catalog/products`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error('Catalog request failed');
    }

    return response.json();
  } catch {
    return [];
  }
}
