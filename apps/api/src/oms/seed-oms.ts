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

export const omsSkuMappings: OmsSkuMapping[] = [
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
      flipkart: 'TS-CAMS-PM-BG-S (THREAD SUTRA BRAND)',
      ajio: '',
      meesho: '',
      snapdeal: ''
    }
  },
  {
    id: 'cams-pm-wht',
    category: 'Camisole',
    masterSku: 'CAMS-PM',
    color: 'WHITE',
    colorCode: 'WHT',
    sizes: ['S', 'M', 'L', '30', '32', '34'],
    packOf: 1,
    marketplaceSkus: {
      amazon: '',
      myntra: 'DRB-CAMS-PM-BG-S (DRESSBERRY BRAND)',
      flipkart: 'DRB-CAMS-PM-BG-S (DRESSBERRY BRAND)',
      ajio: '',
      meesho: '',
      snapdeal: ''
    }
  },
  {
    id: 'cams-pm-blk',
    category: 'Camisole',
    masterSku: 'CAMS-PM',
    color: 'BLACK',
    colorCode: 'BLK',
    sizes: ['S', 'M', 'L', '30', '32', '34'],
    packOf: 1,
    marketplaceSkus: {
      amazon: '',
      myntra: 'HN-CAMS-PM-BG-S (HERE&NOW BRAND)',
      flipkart: 'DBE-CAMS-PM-BG-S (DREAMBE BRAND)',
      ajio: '',
      meesho: '',
      snapdeal: ''
    }
  }
];
