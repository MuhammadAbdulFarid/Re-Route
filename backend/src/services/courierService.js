// Courier Service - Simulated Courier API Integration
// Re-Route - Reverse Logistics SaaS Platform

// Simulated courier API - In production, this would connect to real courier APIs
// like JNE, SiCepat, J&T, etc.

// Generate random waybill number
const generateWaybillNumber = () => {
  const prefix = ["JNE", "SIC", "J&T", "NIN"][Math.floor(Math.random() * 4)];
  const number = Math.random().toString(36).substring(2, 12).toUpperCase();
  return `${prefix}${number}`;
};

// Simulate courier API response
export const generateWaybill = async (data) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const waybillNumber = generateWaybillNumber();
  const shippingCost = Math.floor(Math.random() * 15000) + 5000; // 5000-20000 IDR

  console.log(`📦 [Courier API] Generating waybill for ${data.recipient.name}`);
  console.log(`   From: ${data.sender.address}`);
  console.log(`   To: ${data.recipient.address}`);
  console.log(`   Weight: ${data.package.weight}kg`);

  return {
    success: true,
    waybillNumber,
    labelUrl: `/api/labels/${waybillNumber}.pdf`,
    shippingCost,
    courier: "JNE Express", // Default courier
    estimatedDelivery: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 3 days
    serviceType: "REGULAR",
    trackingUrl: `https://track.jne.co.id/${waybillNumber}`,
  };
};

// Simulate getting courier tracking info
export const getCourierTracking = async (waybillNumber, courierName) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const statuses = [
    {
      status: "PICKED_UP",
      location: "Surabaya",
      description: "Paket telah diambil oleh kurir",
    },
    {
      status: "IN_TRANSIT",
      location: "Surabaya",
      description: "Paket dalam perjalanan ke gudang",
    },
    {
      status: "AT_WAREHOUSE",
      location: "Surabaya Gudang",
      description: "Paket arrived di gudang tujuan",
    },
    {
      status: "DELIVERED",
      location: "Surabaya Gudang",
      description: "Paket telah diterima di gudang",
    },
  ];

  // Random status for simulation
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    success: true,
    waybillNumber,
    courier: courierName || "JNE Express",
    currentStatus: randomStatus.status,
    location: randomStatus.location,
    description: randomStatus.description,
    timestamp: new Date().toISOString(),
    history: statuses.map((s, i) => ({
      ...s,
      timestamp: new Date(
        Date.now() - (statuses.length - i) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    })),
  };
};

// List of available couriers (for dropdown)
export const getAvailableCouriers = async () => {
  return [
    {
      id: "jne",
      name: "JNE Express",
      logo: "/logos/jne.png",
      serviceTypes: ["REGULAR", "EXPRESS"],
    },
    {
      id: "sicepat",
      name: "SiCepat",
      logo: "/logos/sicepat.png",
      serviceTypes: ["REGULAR", "HALU", "BEST"],
    },
    {
      id: "jnt",
      name: "J&T Express",
      logo: "/logos/jnt.png",
      serviceTypes: ["REGULAR", "EXPRESS"],
    },
    {
      id: "pos",
      name: "POS Indonesia",
      logo: "/logos/pos.png",
      serviceTypes: ["REGULAR", "EXPRESS"],
    },
  ];
};
