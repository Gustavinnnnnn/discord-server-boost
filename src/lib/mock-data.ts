export const mockUser = {
  username: "GamerPro",
  discriminator: "1337",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ServerBoost",
  id: "123456789",
  balance: 247.5,
};

export const mockServers = [
  { id: "1", name: "Roblox Trade Hub", icon: "🎮", members: 1240, status: "active" as const, boost: true },
  { id: "2", name: "Free Fire BR", icon: "🔥", members: 812, status: "active" as const, boost: false },
  { id: "3", name: "Loja Digital VIP", icon: "🛒", members: 456, status: "inactive" as const, boost: false },
  { id: "4", name: "Comunidade Geral", icon: "💬", members: 230, status: "active" as const, boost: true },
];

export const mockCampaigns = [
  {
    id: "c1",
    name: "Boost Roblox Trade",
    server: "Roblox Trade Hub",
    niche: "Roblox",
    status: "active" as const,
    impressions: 12480,
    clicks: 942,
    members: 187,
    budget: 50,
    spent: 32.4,
  },
  {
    id: "c2",
    name: "Lançamento Loja",
    server: "Loja Digital VIP",
    niche: "Loja digital",
    status: "paused" as const,
    impressions: 5230,
    clicks: 411,
    members: 64,
    budget: 30,
    spent: 18.2,
  },
  {
    id: "c3",
    name: "FF Comunidade",
    server: "Free Fire BR",
    niche: "Free Fire",
    status: "finished" as const,
    impressions: 24100,
    clicks: 1820,
    members: 412,
    budget: 100,
    spent: 100,
  },
];

export const growthData = [
  { day: "Seg", members: 24, clicks: 120 },
  { day: "Ter", members: 38, clicks: 180 },
  { day: "Qua", members: 31, clicks: 150 },
  { day: "Qui", members: 52, clicks: 240 },
  { day: "Sex", members: 71, clicks: 320 },
  { day: "Sáb", members: 88, clicks: 410 },
  { day: "Dom", members: 95, clicks: 460 },
];

export const sourceData = [
  { name: "Bot Discord", value: 62 },
  { name: "Convite Direto", value: 23 },
  { name: "Indicação", value: 15 },
];

export const walletHistory = [
  { id: "t1", date: "2026-04-25", description: "Recarga via Pix", amount: 100, type: "in" as const },
  { id: "t2", date: "2026-04-24", description: "Campanha: Boost Roblox", amount: -32.4, type: "out" as const },
  { id: "t3", date: "2026-04-20", description: "Recarga via Cartão", amount: 50, type: "in" as const },
  { id: "t4", date: "2026-04-15", description: "Campanha: FF Comunidade", amount: -100, type: "out" as const },
];
