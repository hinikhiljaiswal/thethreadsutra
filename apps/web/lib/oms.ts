export type OmsSkuMapping = {
  id: string;
  category: string;
  masterSku: string;
  color: string;
  colorCode: string;
  sizes: string[];
  packOf: number;
  marketplaceSkus: Record<string, string>;
};

export type OmsSummary = {
  masterSkus: number;
  variants: number;
  colors: number;
  marketplaces: string[];
  mappedCounts: Record<string, number>;
};

export const sampleOmsMappings: OmsSkuMapping[] = [
  {
    id: 'cams-pm-bg',
    category: 'Camisole',
    masterSku: 'CAMS-PM',
    color: 'BEIGE',
    colorCode: 'BG',
    sizes: ['S', 'M', 'L', '30', '32', '34'],
    packOf: 1,
    marketplaceSkus: {
      amazon: 'TS-CAMS-PM-BG-S',
      myntra: 'TS-CAMS-PM-BG-S (THREAD SUTRA BRAND)',
      flipkart: 'TS-CAMS-PM-BG-S (THREAD SUTRA BRAND)'
    }
  }
];

export const sampleOmsSummary: OmsSummary = {
  masterSkus: 1,
  variants: 3,
  colors: 3,
  marketplaces: ['amazon', 'myntra', 'flipkart', 'ajio', 'meesho', 'snapdeal'],
  mappedCounts: {
    amazon: 1,
    myntra: 3,
    flipkart: 3,
    ajio: 0,
    meesho: 0,
    snapdeal: 0
  }
};
