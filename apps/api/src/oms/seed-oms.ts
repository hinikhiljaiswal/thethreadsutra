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

export type OmsOrderStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Allocated' | 'Picked' | 'Shipped';

export type OmsOrderRow = {
  id: string;
  extOrderNo: string;
  orderNo: string;
  channelName: string;
  orderType: string;
  orderDate: string;
  skuCode: string;
  skuDesc: string;
  walkinLocation: string;
  fulfillmentLocation: string;
  orderQty: number;
  lineNo: number;
  lineAmount: number;
  customer: string;
  status: OmsOrderStatus;
  zone: string;
  bin: string;
};

export type OmsWave = {
  id: string;
  zone: string;
  picklistType: string;
  orders: number;
  qty: number;
  status: 'Draft' | 'Generated' | 'Released';
  createdAt: string;
  filters: Record<string, string>;
};

export const omsSkuMappings: OmsSkuMapping[] = [
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
    id: '0001-flipkart-thread-sutra-tsbkblklcspo1',
    barcode: '0001',
    marketPlace: 'Flipkart',
    brand: 'Thread Sutra',
    styleId: '42135071',
    van: 'TS-BK-BLK-LC-S-PO1',
    sellerSku: 'TSBKBLKLCSPO1',
    masterSku: 'BK-BLK',
    skuCode: 'THSUBREF134605429',
    size: '5XL',
    material: 'Cotton',
    packOf: 1,
    grouping: '',
    closure: '',
    style: 'Bikini',
    productName: 'DressBerry Women Anti Microbial Lace Cotton Blend Bikini Briefs',
    category: 'Briefs'
  },
  {
    id: '0001-myntra-dressberry-drbbkbludotxlpo2',
    barcode: '0001',
    marketPlace: 'Myntra',
    brand: 'DressBerry',
    styleId: '42135005',
    van: 'DRB-BK-BLUDOT-XL-PO1',
    sellerSku: 'DRBBKBLUDOTXLPO2',
    masterSku: 'BK-C-BLUDOT',
    skuCode: 'DSBYBREF134605125',
    size: 'XL',
    material: 'Cotton',
    packOf: 1,
    grouping: '',
    closure: '',
    style: 'Bikini',
    productName: 'Thread Sutra Women Anti Microbial Lace Cotton Blend Basic Briefs',
    category: 'Briefs'
  },
  {
    id: '0001-myntra-thread-sutra-tsbkblklcmpo2',
    barcode: '0001',
    marketPlace: 'Myntra',
    brand: 'Thread Sutra',
    styleId: '42135072',
    van: 'TS-BK-BLK-LC-M-PO1',
    sellerSku: 'TSBKBLKLCMPO2',
    masterSku: 'BK-BLK',
    skuCode: 'THSUBREF134605430',
    size: '5XL',
    material: 'Cotton',
    packOf: 1,
    grouping: '',
    closure: '',
    style: 'Bikini',
    productName: 'Thread Sutra Women Anti Microbial Lace Cotton Blend Basic Briefs',
    category: 'Briefs'
  },
  {
    id: '0002-flipkart-dressberry-drbbkbludotxlp11',
    barcode: '0002',
    marketPlace: 'Flipkart',
    brand: 'DressBerry',
    styleId: '42135104',
    van: 'DRB-BK-BLUDOT-XL-P11',
    sellerSku: 'DRBBKBLUDOTXLP11',
    masterSku: 'BK-C-BLUDOT',
    skuCode: 'DSBYBREF134605124',
    size: 'S',
    material: 'Cotton',
    packOf: 1,
    grouping: '',
    closure: '',
    style: 'Bikini',
    productName: 'DressBerry Women Anti Microbial Lace Cotton Blend Bikini Bra',
    category: 'Bra'
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
  },
  {
    id: '0002-myntra-dressberry-drbbkbludotxlp12',
    barcode: '0002',
    marketPlace: 'Myntra',
    brand: 'DressBerry',
    styleId: '42135005',
    van: 'DRB-BK-BLUDOT-XL-P11',
    sellerSku: 'DRBBKBLUDOTXLP12',
    masterSku: 'BK-C-BLUDOT',
    skuCode: 'DSBYBREF134605125',
    size: 'S',
    material: 'Cotton',
    packOf: 1,
    grouping: '',
    closure: '',
    style: 'Bikini',
    productName: 'Thread Sutra Women Anti Microbial Lace Cotton Blend Basic Bra',
    category: 'Bra'
  },
  {
    id: '0002-myntra-thread-sutra-tsbkblklcmp12',
    barcode: '0002',
    marketPlace: 'Myntra',
    brand: 'Thread Sutra',
    styleId: '42135072',
    van: 'TS-BK-BLK-LC-M-P11',
    sellerSku: 'TSBKBLKLCMP12',
    masterSku: 'BK-BLK',
    skuCode: 'THSUBREF134605430',
    size: 'M',
    material: 'Cotton',
    packOf: 1,
    grouping: '',
    closure: '',
    style: 'Bikini',
    productName: 'Thread Sutra Women Anti Microbial Lace Cotton Blend Basic Bra',
    category: 'Bra'
  }
];

export const omsOrders: OmsOrderRow[] = [
  {
    id: 'TEST-0001',
    extOrderNo: 'TEST-0001',
    orderNo: 'ACD194',
    channelName: 'Jeevacare Magento-12',
    orderType: 'Prepaid',
    orderDate: '2026-07-07 12:00 PM',
    skuCode: 'DS_VINCULUM_A_001',
    skuDesc: 'DS_Vinculum_A_001 T',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 1,
    lineNo: 1,
    lineAmount: 1000,
    customer: 'Riya Sen',
    status: 'Pending',
    zone: 'A',
    bin: 'A-01-07'
  },
  {
    id: 'UWH6750973',
    extOrderNo: 'UWH6750973',
    orderNo: 'UWH6750973',
    channelName: 'Amazon SOUQ-113',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 12:03 PM',
    skuCode: '51H',
    skuDesc: 'Yonex CAB 6000 Plus',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 10,
    lineNo: 1,
    lineAmount: 100,
    customer: 'Aarav Mehta',
    status: 'Pending',
    zone: 'B',
    bin: 'B-04-11'
  },
  {
    id: 'UWH6750957',
    extOrderNo: 'UWH6750957',
    orderNo: 'UWH6750957',
    channelName: 'Test Woocommerce-33',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 12:00 PM',
    skuCode: 'DS2',
    skuDesc: 'Yonex CAB 7000 Plus',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 10,
    lineNo: 1,
    lineAmount: 20400,
    customer: 'Mira Rao',
    status: 'Allocated',
    zone: 'A',
    bin: 'A-03-22'
  },
  {
    id: 'UWH6750938',
    extOrderNo: 'UWH6750938',
    orderNo: 'UWH6750938',
    channelName: 'JX Karawaci',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 11:55 AM',
    skuCode: '1H',
    skuDesc: 'Yonex CAB 6000 Plus',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 10,
    lineNo: 1,
    lineAmount: 12340,
    customer: 'Devika Nair',
    status: 'Accepted',
    zone: 'C',
    bin: 'C-09-02'
  },
  {
    id: 'NWB933553',
    extOrderNo: 'NWB933553',
    orderNo: 'ACD193',
    channelName: 'Nykaa PO UAT',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 03:02 AM',
    skuCode: 'DS_VINCULUM_A_001',
    skuDesc: 'DS_Vinculum_A_001 T',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 3,
    lineNo: 1,
    lineAmount: 3000,
    customer: 'Ishaan Kapoor',
    status: 'Pending',
    zone: 'B',
    bin: 'B-02-18'
  },
  {
    id: 'NWB933572',
    extOrderNo: 'NWB933572',
    orderNo: 'ACD190',
    channelName: 'Nykaa PO UAT',
    orderType: 'COD',
    orderDate: '2026-07-04 03:02 AM',
    skuCode: 'DS_VINCULUM_A_001',
    skuDesc: 'DS_Vinculum_A_001 T',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 3,
    lineNo: 1,
    lineAmount: 3000,
    customer: 'Naina Shah',
    status: 'Rejected',
    zone: 'D',
    bin: 'D-05-19'
  },
  {
    id: 'NWB933577',
    extOrderNo: 'NWB933577',
    orderNo: 'ACD191',
    channelName: 'Fashion Techies Shopify-44',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 03:02 AM',
    skuCode: 'TSBKBLKLCMP12',
    skuDesc: 'Thread Sutra Cotton Blend Basic Bra',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 5,
    lineNo: 1,
    lineAmount: 4495,
    customer: 'Sara Dsouza',
    status: 'Allocated',
    zone: 'A',
    bin: 'A-08-04'
  },
  {
    id: 'NWB933578',
    extOrderNo: 'NWB933578',
    orderNo: 'ACD192',
    channelName: 'vajorOm-12',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 03:02 AM',
    skuCode: 'DRBBKBLUDOTXLPO1',
    skuDesc: 'DressBerry Cotton Blend Bikini Briefs',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 4,
    lineNo: 1,
    lineAmount: 2396,
    customer: 'Kabir Jain',
    status: 'Picked',
    zone: 'C',
    bin: 'C-01-10'
  }
];
