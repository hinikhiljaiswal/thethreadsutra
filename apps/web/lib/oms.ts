export type OmsSkuMapping = {
  id: string;
  barcode: string;
  marketPlace: string;
  brand: string;
  styleId: string;
  van: string;
  sellerSku: string;
  masterSku: string;
  skuCode: string;
  size: string;
  material: string;
  packOf: number;
  grouping: string;
  closure: string;
  style: string;
  productName: string;
  category: string;
};

export type OmsSummary = {
  masterSkus: number;
  variants: number;
  colors: number;
  marketplaces: string[];
  brands: string[];
  categories: string[];
  mappedCounts: Record<string, number>;
};

export const sampleOmsMappings: OmsSkuMapping[] = [
  {
    id: '0001-flipkart-dressberry-drbbkbludotxlpo1',
    barcode: '0001',
    marketPlace: 'Flipkart',
    brand: 'DressBerry',
    styleId: '42135004',
    van: 'DRB-BK-BLUDOT-XL-PO1',
    sellerSku: 'DRBBKBLUDOTXLPO1',
    masterSku: 'BK-C-BLUDOT',
    skuCode: 'DSBYBREF134605124',
    size: 'XL',
    material: 'Cotton',
    packOf: 1,
    grouping: '',
    closure: '',
    style: 'Bikini',
    productName: 'DressBerry Women Anti Microbial Lace Cotton Blend Bikini Briefs',
    category: 'Briefs'
  },
  {
    id: '0002-flipkart-thread-sutra-tsbkblklcsp11',
    barcode: '0002',
    marketPlace: 'Flipkart',
    brand: 'Thread Sutra',
    styleId: '42135171',
    van: 'TS-BK-BLK-LC-S-P11',
    sellerSku: 'TSBKBLKLCSP11',
    masterSku: 'BK-BLK',
    skuCode: 'THSUBREF134605429',
    size: 'M',
    material: 'Cotton',
    packOf: 1,
    grouping: '',
    closure: '',
    style: 'Bikini',
    productName: 'DressBerry Women Anti Microbial Lace Cotton Blend Bikini Bra',
    category: 'Bra'
  }
];

export const sampleOmsSummary: OmsSummary = {
  masterSkus: 2,
  variants: 8,
  colors: 2,
  marketplaces: ['Flipkart', 'Myntra'],
  brands: ['DressBerry', 'Thread Sutra'],
  categories: ['Bra', 'Briefs'],
  mappedCounts: {
    flipkart: 4,
    myntra: 4
  }
};
