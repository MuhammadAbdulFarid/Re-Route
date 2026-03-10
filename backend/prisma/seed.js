// Database Seed - Initial Data for Re-Route
// Re-Route - Reverse Logistics SaaS Platform
// Includes: 10 Admin (UMKM Merchants) and 10 Client Accounts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seed Data
const adminData = [
  {
    store: {
      name: "Re-Route Admin",
      slug: "reroute-admin",
      description: "Platform Administrator",
      category: "Platform",
    },
    user: {
      email: "admin@reroute.id",
      name: "Admin Re-Route",
      phone: "+6281234567890",
      businessName: "Re-Route",
      role: "admin",
    },
    password: "admin123",
  },
  {
    store: {
      name: "UMM Store",
      slug: "umm-store",
      description: "Toko fashion mahasiswa UMM Makassar",
      category: "Fashion",
    },
    user: {
      email: "umm.store@reroute.id",
      name: "Ahmad Faisal",
      phone: "+6285234567801",
      businessName: "UMM Store",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Kopi Kampus",
      slug: "kopi-kampus",
      description: "Kedai kopi khas Makassar untuk mahasiswa",
      category: "F&B",
    },
    user: {
      email: "kopikampus@reroute.id",
      name: "Nurul Hidayati",
      phone: "+6285234567802",
      businessName: "Kopi Kampus",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Gadget Second Makassar",
      slug: "gadget-second-makassar",
      description: "Toko gadget second berkualitas di Makassar",
      category: "Elektronik",
    },
    user: {
      email: "gadgetsecond@reroute.id",
      name: "Rizal Pratama",
      phone: "+6285234567803",
      businessName: "Gadget Second Makassar",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Hijab UMM",
      slug: "hijab-umm",
      description: "Toko hijab moderna dan tradisional",
      category: "Fashion",
    },
    user: {
      email: "hijabumm@reroute.id",
      name: "Siti Aisyah",
      phone: "+6285234567804",
      businessName: "Hijab UMM",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Catering Mahasiswa",
      slug: "catering-mahasiswa",
      description: "Catering sehat dan affordable untuk mahasiswa",
      category: "F&B",
    },
    user: {
      email: "cateringmhs@reroute.id",
      name: "Hasanuddin",
      phone: "+6285234567805",
      businessName: "Catering Mahasiswa",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Percetakan Al-Amin",
      slug: "percetakan-al-amin",
      description: "Jasa percetakan dan desain untuk mahasiswa",
      category: "Jasa",
    },
    user: {
      email: "percetakan@reroute.id",
      name: "Baharuddin",
      phone: "+6285234567806",
      businessName: "Percetakan Al-Amin",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Toko Sembako Berkah",
      slug: "sembako-berkah",
      description: "Toko kebutuhan pokok mahasiswa",
      category: "Retail",
    },
    user: {
      email: "sembako@reroute.id",
      name: "Mardiana",
      phone: "+6285234567807",
      businessName: "Toko Sembako Berkah",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Snack Kering UMKM",
      slug: "snack-kering-umkm",
      description: "Kerupuk dan snack kering khas Sulawesi",
      category: "F&B",
    },
    user: {
      email: "snackkering@reroute.id",
      name: "Andi Wijaya",
      phone: "+6285234567808",
      businessName: "Snack Kering UMKM",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Thrifting UMM",
      slug: "thrifting-umm",
      description: "Pakaian second berkualitas untuk mahasiswa",
      category: "Fashion",
    },
    user: {
      email: "thrifting@reroute.id",
      name: "Putriani",
      phone: "+6285234567809",
      businessName: "Thrifting UMM",
      role: "merchant",
    },
    password: "password123",
  },
  {
    store: {
      name: "Jasa Titip UMM",
      slug: "jasatitip-umm",
      description: "Jasa titip belanja dan kurir kampus",
      category: "Kurir",
    },
    user: {
      email: "jasatitip@reroute.id",
      name: "Khaerul Anwar",
      phone: "+6285234567810",
      businessName: "Jasa Titip UMM",
      role: "merchant",
    },
    password: "password123",
  },
];

const clientData = [
  {
    email: "budi.santoso@email.com",
    name: "Budi Santoso",
    phone: "+6289876543201",
    address: "Jl. Pettarani No. 45, Makassar",
  },
  {
    email: "siti.rahayu@email.com",
    name: "Siti Rahayu",
    phone: "+6289876543202",
    address: "Jl. Perintis Kemerdekaan No. 12, Makassar",
  },
  {
    email: "ahmad.wijaya@email.com",
    name: "Ahmad Wijaya",
    phone: "+6289876543203",
    address: "Jl. Toddopuli Raya No. 8, Makassar",
  },
  {
    email: "dewi.kartika@email.com",
    name: "Dewi Kartika",
    phone: "+6289876543204",
    address: "Jl. AP Pettarani No. 33, Makassar",
  },
  {
    email: "rudi.hermawan@email.com",
    name: "Rudi Hermawan",
    phone: "+6289876543205",
    address: "Jl. Rappocini Raya No. 21, Makassar",
  },
  {
    email: "nur.haliza@email.com",
    name: "Nur Haliza",
    phone: "+6289876543206",
    address: "Jl. Bintang No. 17, Makassar",
  },
  {
    email: "japar.sidique@email.com",
    name: "Japar Sidique",
    phone: "+6289876543207",
    address: "Jl. Veteran Utara No. 9, Makassar",
  },
  {
    email: "aminah.tahir@email.com",
    name: "Aminah Tahir",
    phone: "+6289876543208",
    address: "Jl. Daeng Tata No. 5, Makassar",
  },
  {
    email: "tono.abdul@email.com",
    name: "Tono Abdul",
    phone: "+6289876543209",
    address: "Jl. Sultan Alauddin No. 28, Makassar",
  },
  {
    email: "kartika.sari@email.com",
    name: "Kartika Sari",
    phone: "+6289876543210",
    address: "Jl. Nuri No. 14, Makassar",
  },
];

async function main() {
  console.log("🌱 Seeding database...");
  console.log("=".repeat(50));

  // Hash default password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ============================================
  // CREATE ADMIN (MERCHANT) ACCOUNTS WITH STORES
  // ============================================
  console.log("\n🏪 Creating Admin (UMKM Merchant) Accounts...");

  for (const data of adminData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.user.email },
    });

    let user;
    if (existingUser) {
      user = existingUser;
      console.log(`  ↳ User already exists: ${data.user.email}`);
    } else {
      // Create user
      user = await prisma.user.create({
        data: {
          email: data.user.email,
          password: hashedPassword,
          name: data.user.name,
          phone: data.user.phone,
          businessName: data.user.businessName,
          role: data.user.role,
        },
      });
      console.log(`  ✅ Created user: ${data.user.email}`);
    }

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { slug: data.store.slug },
    });

    if (existingStore) {
      console.log(`  ↳ Store already exists: ${data.store.name}`);
    } else {
      // Create store with user relation
      await prisma.store.create({
        data: {
          name: data.store.name,
          slug: data.store.slug,
          description: data.store.description,
          phone: data.user.phone,
          email: data.user.email,
          userId: user.id,
        },
      });
      console.log(
        `  ✅ Created store: ${data.store.name} (${data.store.category})`,
      );
    }
  }

  // ============================================
  // CREATE CLIENT ACCOUNTS
  // ============================================
  console.log("\n👤 Creating Client (Konsumen) Accounts...");

  for (const data of clientData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log(`  ↳ User already exists: ${data.email}`);
    } else {
      // Create client user
      await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phone: data.phone,
          role: "client",
        },
      });
      console.log(`  ✅ Created client: ${data.name} (${data.email})`);
    }
  }

  // ============================================
  // CREATE SAMPLE ORDERS FOR CLIENTS
  // ============================================
  console.log("\n📦 Creating Sample Orders...");

  // Get first admin user for orders
  const firstAdmin = await prisma.user.findUnique({
    where: { email: "umm.store@reroute.id" },
  });

  if (firstAdmin) {
    const sampleOrders = [
      {
        orderNumber: "ORD-2024-001",
        customerName: "Budi Santoso",
        customerPhone: "+6289876543201",
        customerEmail: "budi.santoso@email.com",
        productName: "Kaos Polos Hitam Size L",
        productSku: "FASH-001",
        quantity: 2,
        price: 75000,
        status: "delivered",
      },
      {
        orderNumber: "ORD-2024-002",
        customerName: "Siti Rahayu",
        customerPhone: "+6289876543202",
        customerEmail: "siti.rahayu@email.com",
        productName: "Hijab Pashmina Cerutti",
        productSku: "HIJAB-001",
        quantity: 1,
        price: 125000,
        status: "delivered",
      },
      {
        orderNumber: "ORD-2024-003",
        customerName: "Ahmad Wijaya",
        customerPhone: "+6289876543203",
        customerEmail: "ahmad.wijaya@email.com",
        productName: "iPhone 11 Second 64GB",
        productSku: "GADGET-001",
        quantity: 1,
        price: 3500000,
        status: "shipped",
      },
      {
        orderNumber: "ORD-2024-004",
        customerName: "Dewi Kartika",
        customerPhone: "+6289876543204",
        customerEmail: "dewi.kartika@email.com",
        productName: "Nasi Kotak Menu Ayam",
        productSku: "FOOD-001",
        quantity: 5,
        price: 25000,
        status: "delivered",
      },
      {
        orderNumber: "ORD-2024-005",
        customerName: "Rudi Hermawan",
        customerPhone: "+6289876543205",
        customerEmail: "rudi.hermawan@email.com",
        productName: "Kerupuk Udang 1Kg",
        productSku: "SNACK-001",
        quantity: 3,
        price: 35000,
        status: "pending",
      },
    ];

    for (const order of sampleOrders) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: order.orderNumber },
      });

      if (existingOrder) {
        console.log(`  ↳ Order already exists: ${order.orderNumber}`);
      } else {
        await prisma.order.create({
          data: {
            ...order,
            source: "manual",
            userId: firstAdmin.id,
          },
        });
        console.log(
          `  ✅ Created order: ${order.orderNumber} - ${order.productName}`,
        );
      }
    }
  }

  // ============================================
  // CREATE SAMPLE INVENTORY
  // ============================================
  console.log("\n📋 Creating Sample Inventory...");

  if (firstAdmin) {
    const sampleInventory = [
      {
        productSku: "FASH-001",
        productName: "Kaos Polos Hitam Size L",
        quantity: 50,
      },
      {
        productSku: "FASH-002",
        productName: "Kaos Polos Putih Size M",
        quantity: 35,
      },
      {
        productSku: "HIJAB-001",
        productName: "Hijab Pashmina Cerutti",
        quantity: 25,
      },
      {
        productSku: "HIJAB-002",
        productName: "Hijab Instan Bergo",
        quantity: 40,
      },
      {
        productSku: "GADGET-001",
        productName: "iPhone 11 Second 64GB",
        quantity: 3,
      },
      {
        productSku: "GADGET-002",
        productName: "Samsung A31 Second",
        quantity: 5,
      },
      {
        productSku: "FOOD-001",
        productName: "Nasi Kotak Menu Ayam",
        quantity: 100,
      },
      {
        productSku: "FOOD-002",
        productName: "Nasi Kotak Menu Fisch",
        quantity: 80,
      },
      {
        productSku: "SNACK-001",
        productName: "Kerupuk Udang 1Kg",
        quantity: 60,
      },
      {
        productSku: "SNACK-002",
        productName: "Kopi Bubuk 250gr",
        quantity: 45,
      },
    ];

    for (const item of sampleInventory) {
      const existingItem = await prisma.inventory.findUnique({
        where: { productSku: item.productSku },
      });

      if (existingItem) {
        console.log(`  ↳ Inventory already exists: ${item.productSku}`);
      } else {
        await prisma.inventory.create({
          data: {
            ...item,
            userId: firstAdmin.id,
            location: "GUDANG-UTAMA",
            minStock: 10,
            maxStock: 200,
          },
        });
        console.log(
          `  ✅ Created inventory: ${item.productSku} - ${item.productName}`,
        );
      }
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n" + "=".repeat(50));
  console.log("🎉 Seeding completed!");
  console.log("\n📋 Credentials Summary:");
  console.log("\n🔐 Admin (UMKM Merchant) Accounts:");
  for (const data of adminData) {
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Password: password123`);
    console.log(`   Store: ${data.store.name} (${data.store.category})`);
    console.log("");
  }

  console.log("👤 Client (Konsumen) Accounts:");
  for (const data of clientData) {
    console.log(`   ${data.name} - ${data.email} (Password: password123)`);
  }

  console.log("\n📦 Sample Order Numbers:");
  console.log("   - ORD-2024-001 s/d ORD-2024-005");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
