// Internationalization system with auto-detection (French/English)

let translations = null;
let translationsLoaded = false;
let currentLang = 'fr'; // Default to French

// Detect browser language and return 'fr' or 'en'
export const detectLanguage = () => {
  const stored = localStorage.getItem('dex-language');
  if (stored && (stored === 'fr' || stored === 'en')) {
    return stored;
  }
  
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  // Check if browser is French
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  return 'en';
};

// Get current language
export const getCurrentLang = () => currentLang;

// Set language and save to localStorage
export const setLanguage = (lang) => {
  if (lang !== 'fr' && lang !== 'en') return;
  currentLang = lang;
  localStorage.setItem('dex-language', lang);
  console.log('[i18n] Language set to:', lang);
};

export const loadTranslations = async () => {
  if (translationsLoaded) return { translations, lang: currentLang };
  
  // Detect language on first load
  currentLang = detectLanguage();
  console.log('[i18n] Detected language:', currentLang);
  
  try {
    // Build translations from dex.json which contains nameFr for each Pokemon
    const response = await fetch('./out/dex.json');
    if (!response.ok) throw new Error('Failed to load dex.json');
    const dexData = await response.json();
    
    // Build translation index: cobblemon.species.{id}.name -> nameFr
    translations = {};
    for (const pokemon of dexData) {
      if (pokemon.id && pokemon.nameFr) {
        translations[`cobblemon.species.${pokemon.id.toLowerCase()}.name`] = pokemon.nameFr;
      }
      // Also add type translations if available
      if (pokemon.primaryType && pokemon.primaryTypeFr) {
        translations[`cobblemon.type.${pokemon.primaryType.toLowerCase()}`] = pokemon.primaryTypeFr;
      }
      if (pokemon.secondaryType && pokemon.secondaryTypeFr) {
        translations[`cobblemon.type.${pokemon.secondaryType.toLowerCase()}`] = pokemon.secondaryTypeFr;
      }
    }
    
    translationsLoaded = true;
    console.log('[i18n] Translations built from dex.json:', Object.keys(translations).length, 'entries');
    return { translations, lang: currentLang };
  } catch (e) {
    console.warn('[i18n] Could not load translations:', e);
    translations = {};
    translationsLoaded = true;
    return { translations, lang: currentLang };
  }
};

export const getTranslations = () => translations || {};

// ============================================
// UI TEXT TRANSLATIONS (French ↔ English)
// ============================================
const uiTexts = {
  // Navigation & Headers
  'header.subtitle': { fr: 'Mini-Dex & Outils', en: 'Mini-Dex & Tools' },
  'footer.text': { fr: 'Cobblemon Academy Dex Evolved • Données extraites du modpack • Fait par LnYkLl (0913)', en: 'Cobblemon Academy Dex • Data extracted from modpack • Made By LnYkLl (0913)' },
  'search.pokemon': { fr: 'Rechercher un Pokémon...', en: 'Search a Pokémon...' },
  'search.pokemon.type': { fr: 'Tapez le nom d\'un Pokémon...', en: 'Type a Pokémon name...' },
  'search.item': { fr: 'Rechercher un objet...', en: 'Search an item...' },
  'search.berry': { fr: 'Rechercher une baie ou un effet...', en: 'Search a berry or effect...' },
  'loading': { fr: 'Chargement...', en: 'Loading...' },
  'error': { fr: 'Erreur', en: 'Error' },
  'back': { fr: 'Retour', en: 'Back' },
  'close': { fr: 'Fermer', en: 'Close' },
  
  // Filters
  'filter.all.types': { fr: 'Tous les types', en: 'All types' },
  'filter.results': { fr: 'résultats sur', en: 'results out of' },
  'filter.page': { fr: 'page', en: 'page' },
  
  // Pokemon Info
  'pokemon.types': { fr: 'Types', en: 'Types' },
  'pokemon.abilities': { fr: 'Talents', en: 'Abilities' },
  'pokemon.hidden.ability': { fr: 'Talent caché', en: 'Hidden Ability' },
  'pokemon.stats': { fr: 'Statistiques', en: 'Stats' },
  'pokemon.base.stats': { fr: 'Stats de base', en: 'Base Stats' },
  'pokemon.evs': { fr: 'EVs donnés', en: 'EVs Yield' },
  'pokemon.evolution': { fr: 'Évolution', en: 'Evolution' },
  'pokemon.evolutions': { fr: 'Évolutions', en: 'Evolutions' },
  'pokemon.spawn': { fr: 'Apparition', en: 'Spawn' },
  'pokemon.spawns': { fr: 'Apparitions', en: 'Spawns' },
  'pokemon.drops': { fr: 'Drops', en: 'Drops' },
  'pokemon.moves': { fr: 'Attaques', en: 'Moves' },
  'pokemon.egg.groups': { fr: 'Groupes Œuf', en: 'Egg Groups' },
  'pokemon.height': { fr: 'Taille', en: 'Height' },
  'pokemon.weight': { fr: 'Poids', en: 'Weight' },
  'pokemon.catch.rate': { fr: 'Taux de capture', en: 'Catch Rate' },
  'pokemon.exp.group': { fr: 'Groupe EXP', en: 'EXP Group' },
  'pokemon.gender.ratio': { fr: 'Ratio genre', en: 'Gender Ratio' },
  'pokemon.male': { fr: 'Mâle', en: 'Male' },
  'pokemon.female': { fr: 'Femelle', en: 'Female' },
  'pokemon.genderless': { fr: 'Asexué', en: 'Genderless' },
  
  // Spawn conditions
  'spawn.biome': { fr: 'Biome', en: 'Biome' },
  'spawn.biomes': { fr: 'Biomes', en: 'Biomes' },
  'spawn.time': { fr: 'Moment', en: 'Time' },
  'spawn.weather': { fr: 'Météo', en: 'Weather' },
  'spawn.rarity': { fr: 'Rareté', en: 'Rarity' },
  'spawn.level': { fr: 'Niveau', en: 'Level' },
  'spawn.context': { fr: 'Contexte', en: 'Context' },
  'spawn.conditions': { fr: 'Conditions', en: 'Conditions' },
  'spawn.light': { fr: 'Lumière', en: 'Light' },
  'spawn.sky': { fr: 'Ciel', en: 'Sky' },
  'spawn.sky.open': { fr: 'Ciel ouvert', en: 'Open sky' },
  'spawn.sky.covered': { fr: 'Couvert/Souterrain', en: 'Covered/Underground' },
  'spawn.any': { fr: 'Tous', en: 'Any' },
  'spawn.moon.phase': { fr: 'Phase lunaire', en: 'Moon Phase' },
  
  // Rarity
  'rarity.common': { fr: 'Commun', en: 'Common' },
  'rarity.uncommon': { fr: 'Peu commun', en: 'Uncommon' },
  'rarity.rare': { fr: 'Rare', en: 'Rare' },
  'rarity.ultra-rare': { fr: 'Ultra Rare', en: 'Ultra Rare' },
  
  // Time
  'time.day': { fr: 'Jour', en: 'Day' },
  'time.night': { fr: 'Nuit', en: 'Night' },
  'time.dawn': { fr: 'Aube', en: 'Dawn' },
  'time.dusk': { fr: 'Crépuscule', en: 'Dusk' },
  'time.morning': { fr: 'Matin', en: 'Morning' },
  'time.afternoon': { fr: 'Après-midi', en: 'Afternoon' },
  'time.any': { fr: 'Tous moments', en: 'Any time' },
  
  // Weather
  'weather.clear': { fr: 'Temps clair', en: 'Clear' },
  'weather.rain': { fr: 'Pluie', en: 'Rain' },
  'weather.thunder': { fr: 'Orage', en: 'Thunderstorm' },
  'weather.any': { fr: 'Toute météo', en: 'Any weather' },
  
  // Context
  'context.grounded': { fr: 'Au sol', en: 'Grounded' },
  'context.submerged': { fr: 'Sous l\'eau', en: 'Submerged' },
  'context.surface': { fr: 'Surface', en: 'Surface' },
  'context.seafloor': { fr: 'Fond marin', en: 'Seafloor' },
  
  // Stats
  'stat.hp': { fr: 'PV', en: 'HP' },
  'stat.attack': { fr: 'Attaque', en: 'Attack' },
  'stat.defence': { fr: 'Défense', en: 'Defense' },
  'stat.defense': { fr: 'Défense', en: 'Defense' },
  'stat.special_attack': { fr: 'Att. Spé', en: 'Sp. Atk' },
  'stat.special_defence': { fr: 'Déf. Spé', en: 'Sp. Def' },
  'stat.special_defense': { fr: 'Déf. Spé', en: 'Sp. Def' },
  'stat.speed': { fr: 'Vitesse', en: 'Speed' },
  'stat.total': { fr: 'Total', en: 'Total' },
  
  // EXP Groups
  'exp.slow': { fr: 'Lent', en: 'Slow' },
  'exp.medium_slow': { fr: 'Parabolique', en: 'Medium Slow' },
  'exp.medium_fast': { fr: 'Moyen', en: 'Medium Fast' },
  'exp.fast': { fr: 'Rapide', en: 'Fast' },
  'exp.erratic': { fr: 'Erratique', en: 'Erratic' },
  'exp.fluctuating': { fr: 'Fluctuant', en: 'Fluctuating' },
  
  // Labels
  'label.gen1': { fr: 'Génération 1', en: 'Generation 1' },
  'label.gen2': { fr: 'Génération 2', en: 'Generation 2' },
  'label.gen3': { fr: 'Génération 3', en: 'Generation 3' },
  'label.gen4': { fr: 'Génération 4', en: 'Generation 4' },
  'label.gen5': { fr: 'Génération 5', en: 'Generation 5' },
  'label.gen6': { fr: 'Génération 6', en: 'Generation 6' },
  'label.gen7': { fr: 'Génération 7', en: 'Generation 7' },
  'label.gen8': { fr: 'Génération 8', en: 'Generation 8' },
  'label.gen9': { fr: 'Génération 9', en: 'Generation 9' },
  'label.paradox': { fr: 'Paradoxe', en: 'Paradox' },
  'label.legendary': { fr: 'Légendaire', en: 'Legendary' },
  'label.mythical': { fr: 'Fabuleux', en: 'Mythical' },
  'label.ultra_beast': { fr: 'Ultra-Chimère', en: 'Ultra Beast' },
  'label.starter': { fr: 'Starter', en: 'Starter' },
  'label.fossil': { fr: 'Fossile', en: 'Fossil' },
  'label.baby': { fr: 'Bébé', en: 'Baby' },
  'label.pseudo_legendary': { fr: 'Pseudo-légendaire', en: 'Pseudo-Legendary' },
  
  // PokeSnack specific
  'snack.title': { fr: 'Guide PokéSnack', en: 'PokéSnack Guide' },
  'snack.search': { fr: 'Rechercher un Pokémon à analyser...', en: 'Search a Pokémon to analyze...' },
  'snack.no.spawn': { fr: 'Ce Pokémon n\'apparaît pas naturellement', en: 'This Pokémon doesn\'t spawn naturally' },
  'snack.analysis': { fr: 'Analyse', en: 'Analysis' },
  'snack.competitors': { fr: 'Concurrents', en: 'Competitors' },
  'snack.attracted': { fr: 'Pokémon attirés', en: 'Attracted Pokémon' },
  'snack.blocked': { fr: 'bloqués', en: 'blocked' },
  'snack.blocked.by.ceiling': { fr: 'bloqués par plafond', en: 'blocked by ceiling' },
  'snack.blocked.by.conditions': { fr: 'bloqués par conditions', en: 'blocked by conditions' },
  'snack.efficiency': { fr: 'Efficacité', en: 'Efficiency' },
  'snack.recommendation': { fr: 'Recommandation', en: 'Recommendation' },
  'snack.excellent': { fr: 'Excellent', en: 'Excellent' },
  'snack.good': { fr: 'Bon', en: 'Good' },
  'snack.weak': { fr: 'Faible', en: 'Weak' },
  'snack.type.berry': { fr: 'Baie Type', en: 'Type Berry' },
  'snack.ev.berry': { fr: 'Baie EV', en: 'EV Berry' },
  'snack.golden.apple': { fr: 'Pomme Dorée', en: 'Golden Apple' },
  'snack.enchanted.apple': { fr: 'Pomme Enchantée', en: 'Enchanted Apple' },
  'snack.combo': { fr: 'Combo', en: 'Combo' },
  'snack.combos': { fr: 'Combos', en: 'Combos' },
  'snack.ceiling': { fr: 'Plafond', en: 'Ceiling' },
  'snack.optimal.ceiling': { fr: 'Plafond optimal', en: 'Optimal ceiling' },
  'snack.hitbox': { fr: 'Hitbox', en: 'Hitbox' },
  'snack.blocks': { fr: 'blocs', en: 'blocks' },
  'snack.block': { fr: 'bloc', en: 'block' },
  'snack.same.biome': { fr: 'Même biome', en: 'Same biome' },
  'snack.via.global': { fr: 'Via biome global', en: 'Via global biome' },
  'snack.consume': { fr: 'consomment le PokéSnack', en: 'consume the PokéSnack' },
  'snack.eliminated': { fr: 'éliminés', en: 'eliminated' },
  'snack.eliminated.by.berry': { fr: 'éliminé par cette baie', en: 'eliminated by this berry' },
  'snack.only.gives.ev': { fr: 'Seul à donner cet EV', en: 'Only one giving this EV' },
  'snack.gives.ev': { fr: 'Pokémon donnent cet EV', en: 'Pokémon give this EV' },
  'snack.see.by.rarity': { fr: 'Voir par rareté...', en: 'View by rarity...' },
  'snack.see.blocked': { fr: 'Voir les bloqués...', en: 'View blocked...' },
  'snack.warning.generic.zone': { fr: 'Zone générique détectée', en: 'Generic zone detected' },
  'snack.platform.optimization': { fr: 'Optimisation plateforme', en: 'Platform optimization' },
  'snack.conditions.analysis': { fr: 'Analyse des conditions', en: 'Conditions analysis' },
  'snack.sky.analysis': { fr: 'Analyse ciel', en: 'Sky analysis' },
  'snack.light.analysis': { fr: 'Analyse lumière', en: 'Light analysis' },
  'snack.y.level': { fr: 'Altitude Y', en: 'Y Level' },
  'snack.optimal.conditions': { fr: 'Conditions optimales', en: 'Optimal conditions' },
  
  // Drops page
  'drops.title': { fr: 'Drops des Pokémon', en: 'Pokémon Drops' },
  'drops.search': { fr: 'Rechercher un item...', en: 'Search an item...' },
  'drops.dropped.by': { fr: 'Droppé par', en: 'Dropped by' },
  'drops.chance': { fr: 'Chance', en: 'Chance' },
  'drops.quantity': { fr: 'Quantité', en: 'Quantity' },
  
  // Biome page
  'biome.title': { fr: 'Biomes', en: 'Biomes' },
  'biome.pokemon.count': { fr: 'Pokémon dans ce biome', en: 'Pokémon in this biome' },
  
  // Presets page
  'preset.title': { fr: 'Presets', en: 'Presets' },
  
  // Evolution
  'evo.level': { fr: 'Niveau', en: 'Level' },
  'evo.item': { fr: 'Objet', en: 'Item' },
  'evo.trade': { fr: 'Échange', en: 'Trade' },
  'evo.friendship': { fr: 'Amitié', en: 'Friendship' },
  'evo.held.item': { fr: 'Objet tenu', en: 'Held Item' },
  
  // Misc
  'yes': { fr: 'Oui', en: 'Yes' },
  'no': { fr: 'Non', en: 'No' },
  'none': { fr: 'Aucun', en: 'None' },
  'unknown': { fr: 'Inconnu', en: 'Unknown' },
  'and': { fr: 'et', en: 'and' },
  'or': { fr: 'ou', en: 'or' },
  'to': { fr: 'à', en: 'to' },
  'from': { fr: 'de', en: 'from' },
  'with': { fr: 'avec', en: 'with' },
  'without': { fr: 'sans', en: 'without' },
  'all': { fr: 'Tous', en: 'All' },
  'see.more': { fr: 'Voir plus...', en: 'See more...' },
  'see.less': { fr: 'Voir moins', en: 'See less' },
  'language': { fr: 'Langue', en: 'Language' },
  'french': { fr: 'Français', en: 'French' },
  'english': { fr: 'Anglais', en: 'English' },
};

// Get UI text in current language
export const t = (key, lang = null) => {
  const useLang = lang || currentLang;
  const text = uiTexts[key];
  if (!text) return key;
  return text[useLang] || text['en'] || key;
};

// ============================================
// POKEMON DATA TRANSLATIONS
// ============================================

// Helper function to capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Get translation from provided translations or global
const getTrans = (providedTrans) => providedTrans || translations || {};

// Get French name of a Pokemon (always, regardless of current language)
// Used for bilingual search
export const getPokemonNameFr = (id, providedTrans = null) => {
  if (!id) return null;
  const trans = getTrans(providedTrans);
  const key = `cobblemon.species.${id.toLowerCase()}.name`;
  const frName = trans[key];
  // Debug: log si pas trouvé
  // if (!frName) console.log('[i18n] No FR translation for:', id, key);
  return frName || null;
};

// Get English name of a Pokemon (always, regardless of current language)
export const getPokemonNameEn = (id) => {
  if (!id) return null;
  return capitalizeFirst(id.replace(/_/g, ' '));
};

// Translate a Pokemon name based on current language
// Pass lang explicitly for reactivity, or it will use module-level currentLang
export const translatePokemonName = (id, providedTrans = null, lang = null) => {
  if (!id) return id;
  const useLang = lang || currentLang;
  
  // In English, just capitalize the ID
  if (useLang === 'en') {
    return capitalizeFirst(id.replace(/_/g, ' '));
  }
  
  // In French, use translations
  const trans = getTrans(providedTrans);
  const key = `cobblemon.species.${id.toLowerCase()}.name`;
  return trans[key] || capitalizeFirst(id);
};

// Translate a type (e.g., "fire" -> "Feu" in French)
const typeTranslationsEn = {
  normal: 'Normal', fire: 'Fire', water: 'Water', electric: 'Electric',
  grass: 'Grass', ice: 'Ice', fighting: 'Fighting', poison: 'Poison',
  ground: 'Ground', flying: 'Flying', psychic: 'Psychic', bug: 'Bug',
  rock: 'Rock', ghost: 'Ghost', dragon: 'Dragon', dark: 'Dark',
  steel: 'Steel', fairy: 'Fairy',
};

export const translateType = (type, providedTrans = null) => {
  if (!type) return type;
  if (currentLang === 'en') {
    return typeTranslationsEn[type.toLowerCase()] || capitalizeFirst(type);
  }
  const trans = getTrans(providedTrans);
  const key = `cobblemon.type.${type.toLowerCase()}`;
  return trans[key] || capitalizeFirst(type);
};

// Translate an ability (e.g., "protosynthesis" -> "Paléosynthèse" in French)
export const translateAbility = (ability, providedTrans = null) => {
  if (!ability) return ability;
  if (currentLang === 'en') {
    return capitalizeFirst(ability.replace(/_/g, ' '));
  }
  const trans = getTrans(providedTrans);
  const key = `cobblemon.ability.${ability.toLowerCase()}`;
  return trans[key] || capitalizeFirst(ability.replace(/_/g, ' '));
};

// Egg group translations (hardcoded since not in dex.json)
const eggGroupTranslationsBilingual = {
  monster: { fr: 'Monstrueux', en: 'Monster' },
  water1: { fr: 'Aquatique 1', en: 'Water 1' },
  water2: { fr: 'Aquatique 2', en: 'Water 2' },
  water3: { fr: 'Aquatique 3', en: 'Water 3' },
  bug: { fr: 'Insectoïde', en: 'Bug' },
  flying: { fr: 'Aérien', en: 'Flying' },
  field: { fr: 'Terrestre', en: 'Field' },
  fairy: { fr: 'Féerique', en: 'Fairy' },
  grass: { fr: 'Végétal', en: 'Grass' },
  human_like: { fr: 'Humanoïde', en: 'Human-Like' },
  humanlike: { fr: 'Humanoïde', en: 'Human-Like' },
  mineral: { fr: 'Minéral', en: 'Mineral' },
  amorphous: { fr: 'Amorphe', en: 'Amorphous' },
  ditto: { fr: 'Métamorph', en: 'Ditto' },
  dragon: { fr: 'Draconique', en: 'Dragon' },
  undiscovered: { fr: 'Inconnu', en: 'Undiscovered' },
};

// Translate an egg group
export const translateEggGroup = (eggGroup, providedTrans = null, lang = null) => {
  if (!eggGroup) return eggGroup;
  const useLang = lang || currentLang;
  const key = eggGroup.toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
  const trans = eggGroupTranslationsBilingual[key];
  if (trans) return trans[useLang] || trans['en'];
  return capitalizeFirst(eggGroup.replace(/_/g, ' '));
};

// Common Minecraft item translations (for items not in the translation files)
const minecraftItemTranslations = {
  // Powders and dusts
  blaze_powder: { fr: 'Poudre de Blaze', en: 'Blaze Powder' },
  glowstone_dust: { fr: 'Poudre lumineuse', en: 'Glowstone Dust' },
  redstone: { fr: 'Redstone', en: 'Redstone' },
  gunpowder: { fr: 'Poudre à canon', en: 'Gunpowder' },
  sugar: { fr: 'Sucre', en: 'Sugar' },
  // Rods and sticks
  blaze_rod: { fr: 'Bâton de Blaze', en: 'Blaze Rod' },
  stick: { fr: 'Bâton', en: 'Stick' },
  // Gems and minerals
  diamond: { fr: 'Diamant', en: 'Diamond' },
  emerald: { fr: 'Émeraude', en: 'Emerald' },
  gold_ingot: { fr: 'Lingot d\'or', en: 'Gold Ingot' },
  iron_ingot: { fr: 'Lingot de fer', en: 'Iron Ingot' },
  coal: { fr: 'Charbon', en: 'Coal' },
  lapis_lazuli: { fr: 'Lapis-lazuli', en: 'Lapis Lazuli' },
  quartz: { fr: 'Quartz du Nether', en: 'Nether Quartz' },
  amethyst_shard: { fr: 'Éclat d\'améthyste', en: 'Amethyst Shard' },
  // Bones and body parts
  bone: { fr: 'Os', en: 'Bone' },
  bone_meal: { fr: 'Poudre d\'os', en: 'Bone Meal' },
  feather: { fr: 'Plume', en: 'Feather' },
  leather: { fr: 'Cuir', en: 'Leather' },
  rabbit_hide: { fr: 'Peau de lapin', en: 'Rabbit Hide' },
  string: { fr: 'Ficelle', en: 'String' },
  spider_eye: { fr: 'Œil d\'araignée', en: 'Spider Eye' },
  ender_pearl: { fr: 'Perle de l\'Ender', en: 'Ender Pearl' },
  slime_ball: { fr: 'Boule de slime', en: 'Slimeball' },
  ink_sac: { fr: 'Poche d\'encre', en: 'Ink Sac' },
  glow_ink_sac: { fr: 'Poche d\'encre luisante', en: 'Glow Ink Sac' },
  // Food
  apple: { fr: 'Pomme', en: 'Apple' },
  golden_apple: { fr: 'Pomme dorée', en: 'Golden Apple' },
  enchanted_golden_apple: { fr: 'Pomme dorée enchantée', en: 'Enchanted Golden Apple' },
  bread: { fr: 'Pain', en: 'Bread' },
  egg: { fr: 'Œuf', en: 'Egg' },
  honey_bottle: { fr: 'Fiole de miel', en: 'Honey Bottle' },
  honeycomb: { fr: 'Rayon de miel', en: 'Honeycomb' },
  // Mob drops
  ghast_tear: { fr: 'Larme de Ghast', en: 'Ghast Tear' },
  magma_cream: { fr: 'Crème de magma', en: 'Magma Cream' },
  phantom_membrane: { fr: 'Membrane de Phantom', en: 'Phantom Membrane' },
  prismarine_shard: { fr: 'Éclat de prismarine', en: 'Prismarine Shard' },
  prismarine_crystals: { fr: 'Cristaux de prismarine', en: 'Prismarine Crystals' },
  nautilus_shell: { fr: 'Coquille de nautile', en: 'Nautilus Shell' },
  scute: { fr: 'Écaille de tortue', en: 'Scute' },
  // Others
  clay_ball: { fr: 'Boule d\'argile', en: 'Clay Ball' },
  snowball: { fr: 'Boule de neige', en: 'Snowball' },
  flint: { fr: 'Silex', en: 'Flint' },
  gravel: { fr: 'Gravier', en: 'Gravel' },
  sand: { fr: 'Sable', en: 'Sand' },
  netherrack: { fr: 'Netherrack', en: 'Netherrack' },
  soul_sand: { fr: 'Sable des âmes', en: 'Soul Sand' },
  nether_wart: { fr: 'Verrues du Nether', en: 'Nether Wart' },
};

// Translate an item
export const translateItem = (item, providedTrans = null, lang = null) => {
  if (!item) return item;
  const useLang = lang || currentLang;
  let cleanItem = item;
  
  if (item.includes(':')) {
    const parts = item.split(':');
    const namespace = parts[0];
    const id = parts[1];
    
    // Check hardcoded Minecraft translations first
    if (minecraftItemTranslations[id]) {
      return minecraftItemTranslations[id][useLang] || minecraftItemTranslations[id]['en'];
    }
    
    if (useLang === 'en') {
      return capitalizeFirst(id.replace(/_/g, ' '));
    }
    
    const trans = getTrans(providedTrans);
    const keys = [
      `item.${namespace}.${id}`,
      `block.${namespace}.${id}`,
      `item.minecraft.${id}`,
      `block.minecraft.${id}`,
    ];
    for (const key of keys) {
      if (trans[key]) return trans[key];
    }
    cleanItem = id;
  }
  return capitalizeFirst(cleanItem.replace(/_/g, ' '));
};

// Translate a move name
export const translateMove = (move, providedTrans = null) => {
  if (!move) return move;
  if (currentLang === 'en') {
    return capitalizeFirst(move.replace(/_/g, ' '));
  }
  const trans = getTrans(providedTrans);
  const cleanMove = move.toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `cobblemon.move.${cleanMove}`;
  return trans[key] || capitalizeFirst(move.replace(/_/g, ' '));
};

// Translate stat names
const statTranslationsBilingual = {
  hp: { fr: 'PV', en: 'HP' },
  attack: { fr: 'Attaque', en: 'Attack' },
  defence: { fr: 'Défense', en: 'Defense' },
  defense: { fr: 'Défense', en: 'Defense' },
  special_attack: { fr: 'Att. Spé', en: 'Sp. Atk' },
  special_defence: { fr: 'Déf. Spé', en: 'Sp. Def' },
  special_defense: { fr: 'Déf. Spé', en: 'Sp. Def' },
  speed: { fr: 'Vitesse', en: 'Speed' },
};

export const translateStat = (stat, lang = null) => {
  if (!stat) return stat;
  const useLang = lang || currentLang;
  const key = stat.toLowerCase().replace(/ /g, '_');
  const trans = statTranslationsBilingual[key];
  if (trans) return trans[useLang] || trans['en'];
  return capitalizeFirst(stat.replace(/_/g, ' '));
};

// Translate experience group
const expGroupTranslationsBilingual = {
  slow: { fr: 'Lent', en: 'Slow' },
  medium_slow: { fr: 'Parabolique', en: 'Medium Slow' },
  medium_fast: { fr: 'Moyen', en: 'Medium Fast' },
  fast: { fr: 'Rapide', en: 'Fast' },
  erratic: { fr: 'Erratique', en: 'Erratic' },
  fluctuating: { fr: 'Fluctuant', en: 'Fluctuating' },
};

export const translateExpGroup = (group, lang = null) => {
  if (!group) return group;
  const useLang = lang || currentLang;
  const key = group.toLowerCase().replace(/ /g, '_');
  const trans = expGroupTranslationsBilingual[key];
  if (trans) return trans[useLang] || trans['en'];
  return capitalizeFirst(group.replace(/_/g, ' '));
};

// Translate labels
const labelTranslationsBilingual = {
  gen1: { fr: 'Génération 1', en: 'Generation 1' },
  gen2: { fr: 'Génération 2', en: 'Generation 2' },
  gen3: { fr: 'Génération 3', en: 'Generation 3' },
  gen4: { fr: 'Génération 4', en: 'Generation 4' },
  gen5: { fr: 'Génération 5', en: 'Generation 5' },
  gen6: { fr: 'Génération 6', en: 'Generation 6' },
  gen7: { fr: 'Génération 7', en: 'Generation 7' },
  gen8: { fr: 'Génération 8', en: 'Generation 8' },
  gen9: { fr: 'Génération 9', en: 'Generation 9' },
  paradox: { fr: 'Paradoxe', en: 'Paradox' },
  legendary: { fr: 'Légendaire', en: 'Legendary' },
  mythical: { fr: 'Fabuleux', en: 'Mythical' },
  ultra_beast: { fr: 'Ultra-Chimère', en: 'Ultra Beast' },
  starter: { fr: 'Starter', en: 'Starter' },
  fossil: { fr: 'Fossile', en: 'Fossil' },
  baby: { fr: 'Bébé', en: 'Baby' },
  pseudo_legendary: { fr: 'Pseudo-légendaire', en: 'Pseudo-Legendary' },
};

export const translateLabel = (label, lang = null) => {
  if (!label) return label;
  const useLang = lang || currentLang;
  const key = label.toLowerCase();
  const trans = labelTranslationsBilingual[key];
  if (trans) return trans[useLang] || trans['en'];
  return capitalizeFirst(label.replace(/_/g, ' '));
};

// Translate rarity
const rarityTranslationsBilingual = {
  common: { fr: 'Commun', en: 'Common' },
  uncommon: { fr: 'Peu commun', en: 'Uncommon' },
  rare: { fr: 'Rare', en: 'Rare' },
  'ultra-rare': { fr: 'Ultra Rare', en: 'Ultra Rare' },
  ultrarare: { fr: 'Ultra Rare', en: 'Ultra Rare' },
};

export const translateRarity = (rarity, lang = null) => {
  if (!rarity) return rarity;
  const useLang = lang || currentLang;
  const key = rarity.toLowerCase().replace(/ /g, '-');
  const trans = rarityTranslationsBilingual[key];
  if (trans) return trans[useLang] || trans['en'];
  return capitalizeFirst(rarity);
};

// Translate time of day
const timeTranslationsBilingual = {
  day: { fr: 'Jour', en: 'Day' },
  night: { fr: 'Nuit', en: 'Night' },
  dawn: { fr: 'Aube', en: 'Dawn' },
  dusk: { fr: 'Crépuscule', en: 'Dusk' },
  morning: { fr: 'Matin', en: 'Morning' },
  afternoon: { fr: 'Après-midi', en: 'Afternoon' },
  midnight: { fr: 'Minuit', en: 'Midnight' },
};

export const translateTime = (time, lang = null) => {
  if (!time) return time;
  const useLang = lang || currentLang;
  const key = time.toLowerCase();
  const trans = timeTranslationsBilingual[key];
  if (trans) return trans[useLang] || trans['en'];
  return capitalizeFirst(time);
};

// Translate context
const contextTranslationsBilingual = {
  grounded: { fr: 'Au sol', en: 'Grounded' },
  submerged: { fr: 'Sous l\'eau', en: 'Submerged' },
  surface: { fr: 'Surface', en: 'Surface' },
  seafloor: { fr: 'Fond marin', en: 'Seafloor' },
};

export const translateContext = (context, lang = null) => {
  if (!context) return context;
  const useLang = lang || currentLang;
  const key = context.toLowerCase();
  const trans = contextTranslationsBilingual[key];
  if (trans) return trans[useLang] || trans['en'];
  return capitalizeFirst(context);
};

// ============================================
// BERRY TRANSLATIONS (for PokéSnack guide)
// ============================================
const berryTranslationsBilingual = {
  // Type berries
  'tanga berry': { fr: 'Baie Zalis', en: 'Tanga Berry' },
  'colbur berry': { fr: 'Baie Pitaye', en: 'Colbur Berry' },
  'haban berry': { fr: 'Baie Yapap', en: 'Haban Berry' },
  'wacan berry': { fr: 'Baie Parma', en: 'Wacan Berry' },
  'roseli berry': { fr: 'Baie Selro', en: 'Roseli Berry' },
  'chople berry': { fr: 'Baie Chocco', en: 'Chople Berry' },
  'occa berry': { fr: 'Baie Chérim', en: 'Occa Berry' },
  'coba berry': { fr: 'Baie Cobaba', en: 'Coba Berry' },
  'kasib berry': { fr: 'Baie Jouca', en: 'Kasib Berry' },
  'rindo berry': { fr: 'Baie Kébia', en: 'Rindo Berry' },
  'shuca berry': { fr: 'Baie Batoa', en: 'Shuca Berry' },
  'yache berry': { fr: 'Baie Nanone', en: 'Yache Berry' },
  'chilan berry': { fr: 'Baie Chélan', en: 'Chilan Berry' },
  'kebia berry': { fr: 'Baie Panga', en: 'Kebia Berry' },
  'payapa berry': { fr: 'Baie Babiri', en: 'Payapa Berry' },
  'charti berry': { fr: 'Baie Charti', en: 'Charti Berry' },
  'babiri berry': { fr: 'Baie Bacaba', en: 'Babiri Berry' },
  'passho berry': { fr: 'Baie Pocpoc', en: 'Passho Berry' },
  
  // Egg group berries
  'lum berry': { fr: 'Baie Prine', en: 'Lum Berry' },
  'pecha berry': { fr: 'Baie Pêcha', en: 'Pecha Berry' },
  'cheri berry': { fr: 'Baie Ceriz', en: 'Cheri Berry' },
  'chesto berry': { fr: 'Baie Maron', en: 'Chesto Berry' },
  'rawst berry': { fr: 'Baie Fraive', en: 'Rawst Berry' },
  'aspear berry': { fr: 'Baie Willia', en: 'Aspear Berry' },
  'persim berry': { fr: 'Baie Kika', en: 'Persim Berry' },
  
  // EV berries
  'pomeg berry': { fr: 'Baie Grena', en: 'Pomeg Berry' },
  'kelpsy berry': { fr: 'Baie Algue', en: 'Kelpsy Berry' },
  'qualot berry': { fr: 'Baie Lonfo', en: 'Qualot Berry' },
  'hondew berry': { fr: 'Baie Résin', en: 'Hondew Berry' },
  'grepa berry': { fr: 'Baie Pampa', en: 'Grepa Berry' },
  'tamato berry': { fr: 'Baie Tamato', en: 'Tamato Berry' },
  
  // Nature berries (spicy -> attack, etc.)
  'razz berry': { fr: 'Baie Framby', en: 'Razz Berry' },
  'figy berry': { fr: 'Baie Figuy', en: 'Figy Berry' },
  'touga berry': { fr: 'Baie Repoi', en: 'Touga Berry' },
  'spelon berry': { fr: 'Baie Kiwan', en: 'Spelon Berry' },
  'pinap berry': { fr: 'Baie Nanana', en: 'Pinap Berry' },
  'iapapa berry': { fr: 'Baie Papaya', en: 'Iapapa Berry' },
  'nomel berry': { fr: 'Baie Myrte', en: 'Nomel Berry' },
  'belue berry': { fr: 'Baie Remu', en: 'Belue Berry' },
  'bluk berry': { fr: 'Baie Myrt', en: 'Bluk Berry' },
  'wiki berry': { fr: 'Baie Wiki', en: 'Wiki Berry' },
  'cornn berry': { fr: 'Baie Mais', en: 'Cornn Berry' },
  'pamtre berry': { fr: 'Baie Palma', en: 'Pamtre Berry' },
  'wepear berry': { fr: 'Baie Poirée', en: 'Wepear Berry' },
  'aguav berry': { fr: 'Baie Gowav', en: 'Aguav Berry' },
  'rabuta berry': { fr: 'Baie Abriko', en: 'Rabuta Berry' },
  'durin berry': { fr: 'Baie Durin', en: 'Durin Berry' },
  'nanab berry': { fr: 'Baie Nanab', en: 'Nanab Berry' },
  'mago berry': { fr: 'Baie Mangou', en: 'Mago Berry' },
  'magost berry': { fr: 'Baie Mangue', en: 'Magost Berry' },
  'watmel berry': { fr: 'Baie Stéka', en: 'Watmel Berry' },
  
  // IV berries
  'lansat berry': { fr: 'Baie Lansat', en: 'Lansat Berry' },
  'liechi berry': { fr: 'Baie Lichii', en: 'Liechi Berry' },
  'ganlon berry': { fr: 'Baie Lingan', en: 'Ganlon Berry' },
  'petaya berry': { fr: 'Baie Pitaye', en: 'Petaya Berry' },
  'apicot berry': { fr: 'Baie Abriko', en: 'Apicot Berry' },
  'salac berry': { fr: 'Baie Sailak', en: 'Salac Berry' },
  
  // Special berries
  'starf berry': { fr: 'Baie Étoile', en: 'Starf Berry' },
  'enigma berry': { fr: 'Baie Énigma', en: 'Enigma Berry' },
  'kee berry': { fr: 'Baie Kée', en: 'Kee Berry' },
  'maranga berry': { fr: 'Baie Marangua', en: 'Maranga Berry' },
  'leppa berry': { fr: 'Baie Mepo', en: 'Leppa Berry' },
  'hopo berry': { fr: 'Baie Hopo', en: 'Hopo Berry' },
  'jaboca berry': { fr: 'Baie Jaboca', en: 'Jaboca Berry' },
  'rowap berry': { fr: 'Baie Rowap', en: 'Rowap Berry' },
  'custap berry': { fr: 'Baie Chéka', en: 'Custap Berry' },
  'micle berry': { fr: 'Baie Micle', en: 'Micle Berry' },
  'sitrus berry': { fr: 'Baie Sitrus', en: 'Sitrus Berry' },
  'oran berry': { fr: 'Baie Oran', en: 'Oran Berry' },
  
  // Apples and special items
  'golden apple': { fr: 'Pomme dorée', en: 'Golden Apple' },
  'enchanted golden apple': { fr: 'Pomme dorée enchantée', en: 'Enchanted Golden Apple' },
  'apple': { fr: 'Pomme', en: 'Apple' },
  'glow berries': { fr: 'Baies luisantes', en: 'Glow Berries' },
  'sweet berries': { fr: 'Baies sucrées', en: 'Sweet Berries' },
  'glistering melon slice': { fr: 'Tranche de pastèque scintillante', en: 'Glistering Melon Slice' },
  'golden carrot': { fr: 'Carotte dorée', en: 'Golden Carrot' },
};

export const translateBerry = (berry, lang = null) => {
  if (!berry) return berry;
  const useLang = lang || currentLang;
  const key = berry.toLowerCase();
  const trans = berryTranslationsBilingual[key];
  if (trans) return trans[useLang] || trans['en'];
  return berry; // Return as-is if not found
};

// ============================================
// SNACK PAGE UI TRANSLATIONS
// ============================================
const snackUiTranslations = {
  // Categories
  'cat.all': { fr: 'Tout', en: 'All' },
  'cat.types': { fr: 'Types', en: 'Types' },
  'cat.eggGroups': { fr: 'Groupes Œuf', en: 'Egg Groups' },
  'cat.evYield': { fr: 'EVs', en: 'EVs' },
  'cat.natures': { fr: 'Natures', en: 'Natures' },
  'cat.ivBoost': { fr: 'IVs', en: 'IVs' },
  'cat.special': { fr: 'Spécial', en: 'Special' },
  'cat.speed': { fr: 'Vitesse', en: 'Speed' },
  'cat.rarity': { fr: 'Rareté', en: 'Rarity' },
  
  // Section titles
  'section.types': { fr: '🎯 Attirer par Type', en: '🎯 Attract by Type' },
  'section.types.desc': { fr: 'Augmente x10 les chances d\'attirer un Pokémon du type ciblé', en: 'x10 chances to attract a Pokémon of the targeted type' },
  'section.eggGroups': { fr: '🥚 Attirer par Groupe d\'Œuf', en: '🥚 Attract by Egg Group' },
  'section.eggGroups.desc': { fr: 'Augmente x10 les chances d\'attirer un Pokémon du groupe d\'œuf ciblé', en: 'x10 chances to attract a Pokémon of the targeted egg group' },
  'section.evYield': { fr: '📊 Attirer par EV', en: '📊 Attract by EV' },
  'section.evYield.desc': { fr: 'Attire les Pokémon qui donnent des EVs dans la stat ciblée', en: 'Attracts Pokémon that give EVs in the targeted stat' },
  'section.natures': { fr: '🎭 Attirer par Nature', en: '🎭 Attract by Nature' },
  'section.natures.desc': { fr: 'Attire les Pokémon avec une nature qui boost la stat ciblée', en: 'Attracts Pokémon with a nature that boosts the targeted stat' },
  'section.ivBoost': { fr: '💪 Boost IVs', en: '💪 IV Boost' },
  'section.ivBoost.desc': { fr: 'Augmente les IVs du Pokémon attiré de +5', en: 'Increases the attracted Pokémon\'s IVs by +5' },
  'section.special': { fr: '⭐ Effets Spéciaux', en: '⭐ Special Effects' },
  'section.special.desc': { fr: 'Effets uniques et bonus rares', en: 'Unique effects and rare bonuses' },
  'section.speed': { fr: '⏱️ Réduire Temps de Morsure', en: '⏱️ Reduce Bite Time' },
  'section.speed.desc': { fr: 'Réduit le temps d\'attente avant qu\'un Pokémon morde', en: 'Reduces the wait time before a Pokémon bites' },
  'section.rarity': { fr: '💎 Boost Rareté', en: '💎 Rarity Boost' },
  'section.rarity.desc': { fr: 'Augmente les chances de Pokémon rares', en: 'Increases chances of rare Pokémon' },
  
  // Effects translations
  'effect.shiny': { fr: 'Shiny', en: 'Shiny' },
  'effect.bite': { fr: 'Morsure', en: 'Bite' },
  'effect.rarity': { fr: 'Rareté', en: 'Rarity' },
  'effect.tier': { fr: 'tier', en: 'tier' },
  'effect.tiers': { fr: 'tiers', en: 'tiers' },
  'effect.female': { fr: 'Femelle', en: 'Female' },
  'effect.male': { fr: 'Mâle', en: 'Male' },
  'effect.level': { fr: 'Niveau', en: 'Level' },
  'effect.friendship': { fr: 'Amitié', en: 'Friendship' },
  'effect.reroll': { fr: 'Reroll Drops', en: 'Reroll Drops' },
  'effect.hidden.ability': { fr: 'Talent Caché', en: 'Hidden Ability' },
  'effect.bite.time': { fr: 'Temps de morsure', en: 'Bite Time' },
  'effect.catch.rate': { fr: 'Capture', en: 'Catch rate' },
  
  // Stat effects
  'effect.hp.ev': { fr: 'EV PV', en: 'HP EV' },
  'effect.attack.ev': { fr: 'EV Attaque', en: 'Attack EV' },
  'effect.defense.ev': { fr: 'EV Défense', en: 'Defense EV' },
  'effect.sp.attack.ev': { fr: 'EV Att. Spé', en: 'Sp. Attack EV' },
  'effect.sp.defense.ev': { fr: 'EV Déf. Spé', en: 'Sp. Defense EV' },
  'effect.speed.ev': { fr: 'EV Vitesse', en: 'Speed EV' },
  'effect.hp.iv': { fr: 'IV PV', en: 'HP IVs' },
  'effect.attack.iv': { fr: 'IV Attaque', en: 'Attack IVs' },
  'effect.defense.iv': { fr: 'IV Défense', en: 'Defense IVs' },
  'effect.sp.attack.iv': { fr: 'IV Att. Spé', en: 'Sp. Attack IVs' },
  'effect.sp.defense.iv': { fr: 'IV Déf. Spé', en: 'Sp. Defense IVs' },
  'effect.speed.iv': { fr: 'IV Vitesse', en: 'Speed IVs' },
  'effect.attack+': { fr: 'Attaque+', en: 'Attack+' },
  'effect.defense+': { fr: 'Défense+', en: 'Defense+' },
  'effect.sp.atk+': { fr: 'Att. Spé+', en: 'Sp. Atk+' },
  'effect.sp.def+': { fr: 'Déf. Spé+', en: 'Sp. Def+' },
  'effect.speed+': { fr: 'Vitesse+', en: 'Speed+' },
  
  // UI labels
  'ui.egg.groups': { fr: 'Groupes d\'Œufs', en: 'Egg Groups' },
  'ui.evs.given': { fr: 'EVs donnés', en: 'EVs given' },
  'ui.blocks': { fr: 'blocs', en: 'blocks' },
  'ui.fixed.size': { fr: 'taille fixe', en: 'fixed size' },
  'ui.spawn.blocks': { fr: 'Spawn', en: 'Spawn' },
  
  // Disclaimer
  'snack.disclaimer': { fr: '⚠️ Certaines informations peuvent être incorrectes car la logique d\'analyse provient de mon interprétation personnelle du système PokéSnack.', en: '⚠️ Some information may be inaccurate as the analysis logic comes from my personal interpretation of the PokéSnack system.' },
};

export const tSnack = (key, lang = null) => {
  const useLang = lang || currentLang;
  const text = snackUiTranslations[key];
  if (!text) return key;
  return text[useLang] || text['en'] || key;
};
