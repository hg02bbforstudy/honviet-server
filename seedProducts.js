// seedProducts.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    image: 'https://picsum.photos/seed/prod1/200/200',
    brand: 'ZYGOMATIC',
    name: 'The Werewolves of Millers Hollow Characters',
    price: 455000,
    oldPrice: 479000,
  },
  {
    image: 'https://picsum.photos/seed/prod2/200/200',
    brand: 'STRONGHOLD GAMES',
    name: 'Terraforming Mars: Small Box Retail',
    price: 3466000,
    oldPrice: 3649000,
  },
  {
    image: 'https://picsum.photos/seed/prod3/200/200',
    brand: 'LEDER GAMES',
    name: 'Root Core game',
    price: 2108000,
    oldPrice: 2219000,
  },
  {
    image: 'https://picsum.photos/seed/prod4/200/200',
    brand: 'INDIE BOARDS & CARDS',
    name: 'The Resistance: Hidden Agenda',
    price: 426000,
    oldPrice: 449000,
  },
  {
    image: 'https://picsum.photos/seed/prod5/200/200',
    brand: 'INDIE BOARDS & CARDS',
    name: 'Coup: Rebellion G54 – Anarchy',
    price: 426000,
    oldPrice: 449000,
  },
  {
    image: 'https://picsum.photos/seed/prod6/200/200',
    brand: 'LEDER GAMES',
    name: 'Another Product Name',
    price: 1234000,
    oldPrice: 1350000,
  },
  {
    image: 'https://picsum.photos/seed/prod7/200/200',
    brand: 'LEDER GAMES',
    name: 'Root: The Riverfolk Expansion',
    price: 1234000,
    oldPrice: 1350000,
  },
  {
    image: 'https://picsum.photos/seed/prod8/200/200',
    brand: 'LEDER GAMES',
    name: 'Root: The Underworld Expansion',
    price: 1234000,
    oldPrice: 1350000,
  },
  {
    image: 'https://picsum.photos/seed/prod9/200/200',
    brand: 'LEDER GAMES',
    name: 'Root: The Marauder Expansion',
    price: 1234000,
    oldPrice: 1350000,
  },
  {
    image: 'https://picsum.photos/seed/prod10/200/200',
    brand: 'LEDER GAMES',
    name: 'Root: The Clockwork Expansion',
    price: 1234000,
    oldPrice: 1350000,
  },
  // Accessories (không có brand, có thể để trống)
  {
    image: 'https://picsum.photos/seed/acc1/300/300',
    name: 'Túi đựng board game',
    price: 190000,
    brand: '',
  },
  {
    image: 'https://picsum.photos/seed/acc2/300/300',
    name: 'Sleeves bảo vệ bài (100 cái)',
    price: 85000,
    brand: '',
  },
  {
    image: 'https://picsum.photos/seed/acc3/300/300',
    name: 'Hộp đựng token đa năng',
    price: 135000,
    brand: '',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Product.deleteMany(); // xoá hết sản phẩm cũ (nếu cần)
    const inserted = await Product.insertMany(products);
    console.log('✅ Đã thêm sản phẩm thành công:', inserted.length);
    process.exit();
  } catch (err) {
    console.error('❌ Lỗi khi thêm sản phẩm:', err);
    process.exit(1);
  }
};

seed();
