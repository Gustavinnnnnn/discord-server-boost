// Sistema de público estilo Meta/Facebook Ads
// Macro categorias agrupam nichos granulares (multi-seleção)

export type Niche = {
  value: string;
  label: string;
  emoji: string;
  description?: string;
};

export type CategoryGroup = {
  id: string;
  label: string;
  emoji: string;
  color: string; // tailwind classes
  description: string;
  niches: Niche[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "stores",
    label: "Lojas & E-commerce",
    emoji: "🛒",
    color: "from-orange-500/20 to-red-500/20 border-orange-500/40",
    description: "Pessoas que compram em lojas digitais",
    niches: [
      { value: "store_games", label: "Loja de Games", emoji: "🎮", description: "Jogos PC, console, mobile" },
      { value: "store_steam", label: "Loja Steam", emoji: "🟦", description: "Chaves, jogos da Steam" },
      { value: "store_robux", label: "Loja de Robux", emoji: "🟥", description: "Robux, gift cards Roblox" },
      { value: "store_blox_fruit", label: "Blox Fruit", emoji: "🍓", description: "Itens, contas, frutas" },
      { value: "store_roblox", label: "Loja de Roblox", emoji: "🟫", description: "Contas, itens Roblox" },
      { value: "store_streaming", label: "Loja de Streaming", emoji: "📺", description: "Netflix, Prime, Disney+" },
      { value: "store_balance", label: "Loja de Saldo", emoji: "💳", description: "Recargas, gift cards" },
      { value: "store_discord", label: "Produtos Discord", emoji: "🎟️", description: "Nitro, boosts, decorações" },
      { value: "store_general", label: "Loja Geral", emoji: "🏪", description: "E-commerce diverso" },
    ],
  },
  {
    id: "servers",
    label: "Comunidades & Servidores",
    emoji: "💬",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/40",
    description: "Servidores Discord ativos",
    niches: [
      { value: "server_general", label: "Comunidade Geral", emoji: "🌐", description: "Conversa, amigos" },
      { value: "server_gaming", label: "Servidor de Jogos", emoji: "🕹️", description: "Squads, gameplay" },
      { value: "server_friends", label: "Amigos & Interação", emoji: "🤝", description: "Social, chill" },
      { value: "server_voice", label: "Voice & Comunicação", emoji: "🎙️", description: "Voz, podcasts" },
      { value: "server_web3", label: "Web3 / Hype", emoji: "🚀", description: "NFTs, hype, drops" },
      { value: "server_meme", label: "Memes & Humor", emoji: "😂", description: "Memes, diversão" },
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    emoji: "🎮",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/40",
    description: "Jogadores ativos",
    niches: [
      { value: "gaming_fps", label: "FPS / Tiro", emoji: "🔫", description: "Valorant, CS, COD" },
      { value: "gaming_moba", label: "MOBA", emoji: "⚔️", description: "LoL, Dota" },
      { value: "gaming_mmo", label: "MMO / RPG", emoji: "🐉", description: "WoW, FFXIV" },
      { value: "gaming_mobile", label: "Mobile Gaming", emoji: "📱", description: "Free Fire, ML" },
      { value: "gaming_minecraft", label: "Minecraft", emoji: "🟩", description: "MC servers" },
    ],
  },
  {
    id: "money",
    label: "Crypto & Trading",
    emoji: "💰",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/40",
    description: "Investidores e traders",
    niches: [
      { value: "money_crypto", label: "Crypto", emoji: "₿", description: "Bitcoin, altcoins" },
      { value: "money_trading", label: "Trading", emoji: "📊", description: "Day trade, forex" },
      { value: "money_business", label: "Negócios", emoji: "💼", description: "Empreendedorismo" },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle & Hobby",
    emoji: "🌸",
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/40",
    description: "Interesses pessoais",
    niches: [
      { value: "life_anime", label: "Anime & Mangá", emoji: "🌸", description: "Otaku, mangá" },
      { value: "life_music", label: "Música", emoji: "🎵", description: "Produtores, fãs" },
      { value: "life_tech", label: "Tecnologia", emoji: "💻", description: "Dev, IA, gadgets" },
      { value: "life_education", label: "Educação", emoji: "📚", description: "Estudo, vestibular" },
    ],
  },
];

// Helpers
export const ALL_NICHES: Niche[] = CATEGORY_GROUPS.flatMap((g) => g.niches);

export const findNiche = (value: string): Niche | undefined =>
  ALL_NICHES.find((n) => n.value === value);

export const findGroupOfNiche = (value: string): CategoryGroup | undefined =>
  CATEGORY_GROUPS.find((g) => g.niches.some((n) => n.value === value));

// Conversão: 1 coin = 10 DMs
export const DMS_PER_COIN = 10;
export const coinsToDms = (coins: number) => coins * DMS_PER_COIN;
export const dmsToCoins = (dms: number) => Math.ceil(dms / DMS_PER_COIN);
