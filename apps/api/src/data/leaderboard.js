// Mock leaderboard data – replace with a real data store as needed.
const NAMES = [
  "ShadowWolf", "NeonRider", "CryptoKing", "BlazeFury", "StormBreaker",
  "IronFist", "PhantomAce", "DarkMatter", "LegendX", "ViperStrike",
  "CobraElite", "ThunderBolt", "GhostKnight", "SilverFox", "MysticRune",
  "BloodMoon", "ArcaneForce", "QuantumLeap", "NovaRush", "CyberEdge",
  "FrostByte", "LavaKing", "RiftWalker", "StarForge", "ZeroGravity",
  "InfinityX", "SoulReaper", "MindBend", "TurboX", "DeltaForce",
  "AlphaOne", "BetaTwo", "GammaThree", "DeltaFour", "EpsilonFive",
  "ZetaSix", "EtaSeven", "ThetaEight", "IotaNine", "KappaTen",
  "LambdaEleven", "MuTwelve", "NuThirteen", "XiFourteen", "OmicronFifteen",
  "PiSixteen", "RhoSeventeen", "SigmaEighteen", "TauNineteen", "UpsilonTwenty",
  "PhiTwentyOne", "ChiTwentyTwo", "PsiTwentyThree", "OmegaTwentyFour", "AlphaTwo",
  "BetaThree", "GammaFour", "DeltaFive", "EpsilonSix", "ZetaSeven",
  "EtaEight", "ThetaNine", "IotaTen", "KappaEleven", "LambdaTwelve",
  "MuThirteen", "NuFourteen", "XiFifteen", "OmicronSixteen", "PiSeventeen",
  "RhoEighteen", "SigmaNineteen", "TauTwenty", "UpsilonTwentyOne",
  "PhiTwentyTwo", "ChiTwentyThree", "PsiTwentyFour", "OmegaTwentyFive",
  "AlphaThree", "BetaFour", "GammaFive", "DeltaSix", "EpsilonSeven",
  "ZetaEight", "EtaNine", "ThetaTen", "IotaEleven", "KappaTwelve",
  "LambdaThirteen", "MuFourteen", "NuFifteen", "XiSixteen", "OmicronSeventeen",
  "PiEighteen", "RhoNineteen", "SigmaTwenty", "TauTwentyOne", "UpsilonTwentyTwo",
  "PhiTwentyThree", "ChiTwentyFour", "PsiTwentyFive", "OmegaTwentySix",
];

function generateEntries(month) {
  return NAMES.slice(0, 100).map((name, i) => ({
    rank: i + 1,
    username: name,
    points: Math.max(1, 10000 - i * 97 - ((month.charCodeAt(5) * 13 + i) % 50)),
    wins: Math.max(1, 120 - i - (i % 7)),
    winRate: parseFloat((Math.max(30, 95 - i * 0.6 - (i % 5))).toFixed(1)),
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`,
  }));
}

const AVAILABLE_MONTHS = [
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02", "2026-03", "2026-04",
];

export function getLeaderboard(month) {
  const m = AVAILABLE_MONTHS.includes(month)
    ? month
    : AVAILABLE_MONTHS[AVAILABLE_MONTHS.length - 1];
  return generateEntries(m);
}

export function getAvailableMonths() {
  return AVAILABLE_MONTHS;
}
