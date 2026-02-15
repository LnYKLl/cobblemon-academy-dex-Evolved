import {
  ref,
  computed,
  inject,
  watch,
} from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";
import { spriteFrom, flatSpawns } from "../utils/helpers.js";
import { translatePokemonName, translateType, translateEggGroup, translateStat, t, getCurrentLang, getPokemonNameFr, getPokemonNameEn, translateBerry, tSnack } from "../utils/i18n.js";

export default {
  name: "SnackPage",
  props: {
    dex: { type: Array, default: () => [] },
    sprites: { type: Object, default: () => ({ images: {} }) },
    presets: { type: Object, default: () => ({}) },
    currentLang: { type: String, default: 'fr' },
  },
  setup(props) {
    const searchQuery = ref("");
    const selectedCategory = ref("all");
    const searchMode = ref("baits"); // "baits" ou "pokemon"
    const pokemonSearchQuery = ref("");
    const selectedPokemon = ref(null);
    const fullPokemonData = ref(null); // Données complètes du Pokémon
    const loadingPokemon = ref(false);
    const appleType = ref("golden"); // "golden" ou "enchanted"
    const i18n = inject("i18n", ref({}));
    const getMon = inject("getMon", null); // Injecter le loader de Pokémon
    const injectedLang = inject("currentLang", ref('fr')); // Get from parent

    // Translation helpers - use injected currentLang for reactivity
    const lang = computed(() => injectedLang.value || props.currentLang || 'fr');
    const tName = (id) => translatePokemonName(id, i18n.value, lang.value);
    const tType = (type) => translateType(type, i18n.value);
    const tEggGroup = (group) => translateEggGroup(group, i18n.value, lang.value);
    const tStat = (stat) => translateStat(stat, lang.value);
    const sprite = (id) => spriteFrom(props.sprites, id);
    const tBerry = (berry) => translateBerry(berry, lang.value);
    const tSnackUI = (key) => tSnack(key, lang.value);

    // Traduction des horaires de spawn (dynamique selon la langue)
    const formatTime = (time) => {
      const timeLabels = {
        day: { fr: '☀️ Jour', en: '☀️ Day' },
        night: { fr: '🌙 Nuit', en: '🌙 Night' },
        dawn: { fr: '🌅 Aube', en: '🌅 Dawn' },
        dusk: { fr: '🌇 Crépuscule', en: '🌇 Dusk' },
        noon: { fr: '🌞 Midi', en: '🌞 Noon' },
        midnight: { fr: '🌑 Minuit', en: '🌑 Midnight' }
      };
      return timeLabels[time]?.[lang.value] || time;
    };

    // Recherche de Pokémon (bilingue: cherche en FR et EN)
    const pokemonResults = computed(() => {
      const query = pokemonSearchQuery.value.toLowerCase().trim();
      if (!query || query.length < 2) return [];
      
      return props.dex
        .filter(p => {
          const nameEn = getPokemonNameEn(p.id)?.toLowerCase() || '';
          const nameFr = getPokemonNameFr(p.id, i18n.value)?.toLowerCase() || '';
          const idLower = p.id.toLowerCase();
          return nameEn.includes(query) || nameFr.includes(query) || idLower.includes(query);
        })
        .slice(0, 10); // Limiter à 10 résultats
    });

    const selectPokemon = async (pokemon) => {
      selectedPokemon.value = pokemon;
      pokemonSearchQuery.value = "";
      
      // Charger les données complètes
      if (getMon) {
        loadingPokemon.value = true;
        try {
          const fullData = await getMon(pokemon.id);
          fullPokemonData.value = fullData;
          console.log('[SnackPage] Full pokemon data loaded:', fullData);
        } catch (e) {
          console.warn('[SnackPage] Could not load full pokemon data:', e);
          fullPokemonData.value = null;
        } finally {
          loadingPokemon.value = false;
        }
      }
    };

    const clearPokemon = () => {
      selectedPokemon.value = null;
      fullPokemonData.value = null;
      pokemonSearchQuery.value = "";
    };

    const getTypeClass = (typeName) => {
      if (!typeName) return '';
      return 'type-' + typeName.toLowerCase();
    };

    // Données des baits organisées par catégorie (computed pour réactivité de la langue)
    const baitData = computed(() => ({
      types: {
        title: lang.value === 'fr' ? "🎯 Attirer par Type" : "🎯 Attract by Type",
        description: lang.value === 'fr' ? "Augmente x10 les chances d'attirer un Pokémon du type ciblé" : "x10 chance to attract a Pokémon of the targeted type",
        items: [
          { berry: "Tanga Berry", effect: tType("Bug"), icon: "🐛", color: "#a8b820" },
          { berry: "Colbur Berry", effect: tType("Dark"), icon: "🌑", color: "#705848" },
          { berry: "Haban Berry", effect: tType("Dragon"), icon: "🐉", color: "#7038f8" },
          { berry: "Wacan Berry", effect: tType("Electric"), icon: "⚡", color: "#f8d030" },
          { berry: "Roseli Berry", effect: tType("Fairy"), icon: "🧚", color: "#ee99ac" },
          { berry: "Chople Berry", effect: tType("Fighting"), icon: "🥊", color: "#c03028" },
          { berry: "Occa Berry", effect: tType("Fire"), icon: "🔥", color: "#f08030" },
          { berry: "Coba Berry", effect: tType("Flying"), icon: "🦅", color: "#a890f0" },
          { berry: "Kasib Berry", effect: tType("Ghost"), icon: "👻", color: "#705898" },
          { berry: "Rindo Berry", effect: tType("Grass"), icon: "🌿", color: "#78c850" },
          { berry: "Shuca Berry", effect: tType("Ground"), icon: "🏔️", color: "#e0c068" },
          { berry: "Yache Berry", effect: tType("Ice"), icon: "❄️", color: "#98d8d8" },
          { berry: "Chilan Berry", effect: tType("Normal"), icon: "⚪", color: "#a8a878" },
          { berry: "Kebia Berry", effect: tType("Poison"), icon: "☠️", color: "#a040a0" },
          { berry: "Payapa Berry", effect: tType("Psychic"), icon: "🔮", color: "#f85888" },
          { berry: "Charti Berry", effect: tType("Rock"), icon: "🪨", color: "#b8a038" },
          { berry: "Babiri Berry", effect: tType("Steel"), icon: "⚙️", color: "#b8b8d0" },
          { berry: "Passho Berry", effect: tType("Water"), icon: "💧", color: "#6890f0" },
        ]
      },
      eggGroups: {
        title: lang.value === 'fr' ? "🥚 Attirer par Groupe d'Œuf" : "🥚 Attract by Egg Group",
        description: lang.value === 'fr' ? "Augmente x10 les chances d'attirer un Pokémon du groupe d'œuf ciblé" : "x10 chance to attract a Pokémon of the targeted egg group",
        items: [
          { berry: "Lum Berry", effect: tEggGroup("Dragon") + " & " + tEggGroup("Monster"), icon: "🐲", color: "#7038f8" },
          { berry: "Pecha Berry", effect: tEggGroup("Water3") + " & " + tEggGroup("Bug"), icon: "🦀", color: "#6890f0" },
          { berry: "Cheri Berry", effect: tEggGroup("Fairy") + " & " + tEggGroup("Grass"), icon: "🌸", color: "#ee99ac" },
          { berry: "Chesto Berry", effect: tEggGroup("Human-Like") + " & " + tEggGroup("Flying"), icon: "🧑", color: "#a890f0" },
          { berry: "Rawst Berry", effect: tEggGroup("Field"), icon: "🦊", color: "#e0c068" },
          { berry: "Aspear Berry", effect: tEggGroup("Water1") + " & " + tEggGroup("Water2"), icon: "🐟", color: "#6890f0" },
          { berry: "Persim Berry", effect: tEggGroup("Mineral") + " & " + tEggGroup("Amorphous"), icon: "💎", color: "#b8b8d0" },
        ]
      },
      evYield: {
        title: lang.value === 'fr' ? "📊 Attirer par EV" : "📊 Attract by EV",
        description: lang.value === 'fr' ? "Attire les Pokémon qui donnent des EVs dans la stat ciblée" : "Attracts Pokémon that give EVs in the targeted stat",
        items: [
          { berry: "Pomeg Berry", effect: lang.value === 'fr' ? "EV PV" : "HP EV", icon: "❤️", color: "#ff5959" },
          { berry: "Kelpsy Berry", effect: lang.value === 'fr' ? "EV Attaque" : "Attack EV", icon: "⚔️", color: "#f08030" },
          { berry: "Qualot Berry", effect: lang.value === 'fr' ? "EV Défense" : "Defense EV", icon: "🛡️", color: "#f8d030" },
          { berry: "Hondew Berry", effect: lang.value === 'fr' ? "EV Att. Spé" : "Sp. Attack EV", icon: "✨", color: "#6890f0" },
          { berry: "Grepa Berry", effect: lang.value === 'fr' ? "EV Déf. Spé" : "Sp. Defense EV", icon: "🌟", color: "#78c850" },
          { berry: "Tamato Berry", effect: lang.value === 'fr' ? "EV Vitesse" : "Speed EV", icon: "💨", color: "#f85888" },
        ]
      },
      natures: {
        title: lang.value === 'fr' ? "🎭 Attirer par Nature" : "🎭 Attract by Nature",
        description: lang.value === 'fr' ? "Attire les Pokémon avec une nature qui boost la stat ciblée" : "Attracts Pokémon with a nature that boosts the targeted stat",
        items: [
          { berry: "Razz Berry", effect: (lang.value === 'fr' ? "Attaque" : "Attack") + "+ (25%)", icon: "⚔️", color: "#f08030" },
          { berry: "Figy Berry", effect: (lang.value === 'fr' ? "Attaque" : "Attack") + "+ (50%)", icon: "⚔️", color: "#f08030" },
          { berry: "Touga Berry", effect: (lang.value === 'fr' ? "Attaque" : "Attack") + "+ (75%)", icon: "⚔️", color: "#f08030" },
          { berry: "Spelon Berry", effect: (lang.value === 'fr' ? "Attaque" : "Attack") + "+ (100%)", icon: "⚔️", color: "#f08030" },
          { berry: "Pinap Berry", effect: (lang.value === 'fr' ? "Défense" : "Defense") + "+ (25%)", icon: "🛡️", color: "#f8d030" },
          { berry: "Iapapa Berry", effect: (lang.value === 'fr' ? "Défense" : "Defense") + "+ (50%)", icon: "🛡️", color: "#f8d030" },
          { berry: "Nomel Berry", effect: (lang.value === 'fr' ? "Défense" : "Defense") + "+ (75%)", icon: "🛡️", color: "#f8d030" },
          { berry: "Belue Berry", effect: (lang.value === 'fr' ? "Défense" : "Defense") + "+ (100%)", icon: "🛡️", color: "#f8d030" },
          { berry: "Bluk Berry", effect: (lang.value === 'fr' ? "Att. Spé" : "Sp. Atk") + "+ (25%)", icon: "✨", color: "#6890f0" },
          { berry: "Wiki Berry", effect: (lang.value === 'fr' ? "Att. Spé" : "Sp. Atk") + "+ (50%)", icon: "✨", color: "#6890f0" },
          { berry: "Cornn Berry", effect: (lang.value === 'fr' ? "Att. Spé" : "Sp. Atk") + "+ (75%)", icon: "✨", color: "#6890f0" },
          { berry: "Pamtre Berry", effect: (lang.value === 'fr' ? "Att. Spé" : "Sp. Atk") + "+ (100%)", icon: "✨", color: "#6890f0" },
          { berry: "Wepear Berry", effect: (lang.value === 'fr' ? "Déf. Spé" : "Sp. Def") + "+ (25%)", icon: "🌟", color: "#78c850" },
          { berry: "Aguav Berry", effect: (lang.value === 'fr' ? "Déf. Spé" : "Sp. Def") + "+ (50%)", icon: "🌟", color: "#78c850" },
          { berry: "Rabuta Berry", effect: (lang.value === 'fr' ? "Déf. Spé" : "Sp. Def") + "+ (75%)", icon: "🌟", color: "#78c850" },
          { berry: "Durin Berry", effect: (lang.value === 'fr' ? "Déf. Spé" : "Sp. Def") + "+ (100%)", icon: "🌟", color: "#78c850" },
          { berry: "Nanab Berry", effect: (lang.value === 'fr' ? "Vitesse" : "Speed") + "+ (25%)", icon: "💨", color: "#f85888" },
          { berry: "Mago Berry", effect: (lang.value === 'fr' ? "Vitesse" : "Speed") + "+ (50%)", icon: "💨", color: "#f85888" },
          { berry: "Magost Berry", effect: (lang.value === 'fr' ? "Vitesse" : "Speed") + "+ (75%)", icon: "💨", color: "#f85888" },
          { berry: "Watmel Berry", effect: (lang.value === 'fr' ? "Vitesse" : "Speed") + "+ (100%)", icon: "💨", color: "#f85888" },
        ]
      },
      ivBoost: {
        title: lang.value === 'fr' ? "💪 Boost IVs" : "💪 IV Boost",
        description: lang.value === 'fr' ? "Augmente les IVs du Pokémon attiré de +5" : "Increases the attracted Pokémon's IVs by +5",
        items: [
          { berry: "Lansat Berry", effect: lang.value === 'fr' ? "IV PV +5" : "HP IVs +5", icon: "❤️", color: "#ff5959" },
          { berry: "Liechi Berry", effect: lang.value === 'fr' ? "IV Attaque +5" : "Attack IVs +5", icon: "⚔️", color: "#f08030" },
          { berry: "Ganlon Berry", effect: lang.value === 'fr' ? "IV Défense +5" : "Defense IVs +5", icon: "🛡️", color: "#f8d030" },
          { berry: "Petaya Berry", effect: lang.value === 'fr' ? "IV Att. Spé +5" : "Sp. Attack IVs +5", icon: "✨", color: "#6890f0" },
          { berry: "Apicot Berry", effect: lang.value === 'fr' ? "IV Déf. Spé +5" : "Sp. Defense IVs +5", icon: "🌟", color: "#78c850" },
          { berry: "Salac Berry", effect: lang.value === 'fr' ? "IV Vitesse +5" : "Speed IVs +5", icon: "💨", color: "#f85888" },
        ]
      },
      special: {
        title: lang.value === 'fr' ? "⭐ Effets Spéciaux" : "⭐ Special Effects",
        description: lang.value === 'fr' ? "Effets uniques et bonus rares" : "Unique effects and rare bonuses",
        items: [
          { berry: "Golden Apple", effect: lang.value === 'fr' ? "Rareté +1 tier, Shiny x2, Morsure -25%" : "Rarity +1 tier, Shiny x2, Bite -25%", icon: "🍎", color: "#ffd700" },
          { berry: "Enchanted Golden Apple", effect: lang.value === 'fr' ? "Rareté +3 tiers, Shiny x10, Morsure -10%" : "Rarity +3 tiers, Shiny x10, Bite -10%", icon: "✨", color: "#ffd700" },
          { berry: "Starf Berry", effect: "Shiny x3", icon: "🌟", color: "#ffd700" },
          { berry: "Enigma Berry", effect: lang.value === 'fr' ? "Talent Caché (5%)" : "Hidden Ability (5%)", icon: "❓", color: "#705898" },
          { berry: "Kee Berry", effect: lang.value === 'fr' ? "Femelle (25%)" : "Female (25%)", icon: "♀️", color: "#f85888" },
          { berry: "Maranga Berry", effect: lang.value === 'fr' ? "Mâle (25%)" : "Male (25%)", icon: "♂️", color: "#6890f0" },
          { berry: "Leppa Berry", effect: lang.value === 'fr' ? "Niveau +5" : "Level +5", icon: "📈", color: "#78c850" },
          { berry: "Hopo Berry", effect: lang.value === 'fr' ? "Niveau +10" : "Level +10", icon: "📈", color: "#78c850" },
          { berry: "Jaboca Berry", effect: lang.value === 'fr' ? "Amitié +100" : "Friendship +100", icon: "💕", color: "#ee99ac" },
          { berry: "Rowap Berry", effect: "Reroll Drops x1", icon: "🎲", color: "#a040a0" },
        ]
      },
      speed: {
        title: lang.value === 'fr' ? "⏱️ Réduire Temps de Morsure" : "⏱️ Reduce Bite Time",
        description: lang.value === 'fr' ? "Réduit le temps d'attente avant qu'un Pokémon morde" : "Reduces the wait time before a Pokémon bites",
        items: [
          { berry: "Apple", effect: lang.value === 'fr' ? "-100% Temps de morsure" : "-100% Bite Time", icon: "🍎", color: "#78c850" },
          { berry: "Sitrus Berry", effect: lang.value === 'fr' ? "-100% Temps de morsure" : "-100% Bite Time", icon: "🍋", color: "#f8d030" },
          { berry: "Oran Berry", effect: lang.value === 'fr' ? "-33% Temps de morsure" : "-33% Bite Time", icon: "🫐", color: "#6890f0" },
          { berry: "Glow Berries", effect: lang.value === 'fr' ? "-25% Temps de morsure" : "-25% Bite Time", icon: "✨", color: "#ffd700" },
          { berry: "Custap Berry", effect: lang.value === 'fr' ? "-25% + Capture ↑ (70%)" : "-25% + Catch ↑ (70%)", icon: "🍇", color: "#a040a0" },
          { berry: "Micle Berry", effect: lang.value === 'fr' ? "-25% + Capture ↑ (100%)" : "-25% + Catch ↑ (100%)", icon: "🍈", color: "#78c850" },
          { berry: "Sweet Berries", effect: lang.value === 'fr' ? "-12.5% Temps de morsure" : "-12.5% Bite Time", icon: "🍓", color: "#ff5959" },
        ]
      },
      rarity: {
        title: lang.value === 'fr' ? "💎 Boost Rareté" : "💎 Rarity Boost",
        description: lang.value === 'fr' ? "Augmente les chances de Pokémon rares" : "Increases chances of rare Pokémon",
        items: [
          { berry: "Golden Apple", effect: lang.value === 'fr' ? "Rareté +1 tier" : "Rarity +1 tier", icon: "🍎", color: "#ffd700" },
          { berry: "Glistering Melon Slice", effect: lang.value === 'fr' ? "Rareté +1 tier" : "Rarity +1 tier", icon: "🍉", color: "#78c850" },
          { berry: "Golden Carrot", effect: lang.value === 'fr' ? "Rareté +1 tier" : "Rarity +1 tier", icon: "🥕", color: "#f8d030" },
          { berry: "Enchanted Golden Apple", effect: lang.value === 'fr' ? "Rareté +3 tiers" : "Rarity +3 tiers", icon: "✨", color: "#ffd700" },
        ]
      },
    }));

    const categories = computed(() => [
      { id: "all", name: tSnackUI('cat.all'), icon: "📋" },
      { id: "types", name: tSnackUI('cat.types'), icon: "🎯" },
      { id: "eggGroups", name: tSnackUI('cat.eggGroups'), icon: "🥚" },
      { id: "evYield", name: tSnackUI('cat.evYield'), icon: "📊" },
      { id: "natures", name: tSnackUI('cat.natures'), icon: "🎭" },
      { id: "ivBoost", name: tSnackUI('cat.ivBoost'), icon: "💪" },
      { id: "special", name: tSnackUI('cat.special'), icon: "⭐" },
      { id: "speed", name: tSnackUI('cat.speed'), icon: "⏱️" },
      { id: "rarity", name: tSnackUI('cat.rarity'), icon: "💎" },
    ]);

    // Mapping type -> berry pour les recommandations
    const typeToBerry = {
      bug: { berry: "Tanga Berry", icon: "🐛" },
      dark: { berry: "Colbur Berry", icon: "🌑" },
      dragon: { berry: "Haban Berry", icon: "🐉" },
      electric: { berry: "Wacan Berry", icon: "⚡" },
      fairy: { berry: "Roseli Berry", icon: "🧚" },
      fighting: { berry: "Chople Berry", icon: "🥊" },
      fire: { berry: "Occa Berry", icon: "🔥" },
      flying: { berry: "Coba Berry", icon: "🦅" },
      ghost: { berry: "Kasib Berry", icon: "👻" },
      grass: { berry: "Rindo Berry", icon: "🌿" },
      ground: { berry: "Shuca Berry", icon: "🏔️" },
      ice: { berry: "Yache Berry", icon: "❄️" },
      normal: { berry: "Chilan Berry", icon: "⚪" },
      poison: { berry: "Kebia Berry", icon: "☠️" },
      psychic: { berry: "Payapa Berry", icon: "🔮" },
      rock: { berry: "Charti Berry", icon: "🪨" },
      steel: { berry: "Babiri Berry", icon: "⚙️" },
      water: { berry: "Passho Berry", icon: "💧" },
    };

    // Mapping egg group -> berry
    const eggGroupToBerry = {
      dragon: { berry: "Lum Berry", icon: "🐲", shared: "Monster" },
      monster: { berry: "Lum Berry", icon: "🐲", shared: "Dragon" },
      water3: { berry: "Pecha Berry", icon: "🦀", shared: "Bug" },
      bug: { berry: "Pecha Berry", icon: "🦀", shared: "Water 3" },
      fairy: { berry: "Cheri Berry", icon: "🌸", shared: "Grass" },
      grass: { berry: "Cheri Berry", icon: "🌸", shared: "Fairy" },
      "human-like": { berry: "Chesto Berry", icon: "🧑", shared: "Flying" },
      humanlike: { berry: "Chesto Berry", icon: "🧑", shared: "Flying" },
      flying: { berry: "Chesto Berry", icon: "🧑", shared: "Human-Like" },
      field: { berry: "Rawst Berry", icon: "🦊", shared: null },
      water1: { berry: "Aspear Berry", icon: "🐟", shared: "Water 2" },
      water2: { berry: "Aspear Berry", icon: "🐟", shared: "Water 1" },
      mineral: { berry: "Persim Berry", icon: "💎", shared: "Amorphous" },
      amorphous: { berry: "Persim Berry", icon: "💎", shared: "Mineral" },
    };

    // Mapping EV stat -> berry
    const evToBerry = {
      hp: { berry: "Pomeg Berry", icon: "❤️", stat: "PV" },
      attack: { berry: "Kelpsy Berry", icon: "⚔️", stat: "Attaque" },
      defence: { berry: "Qualot Berry", icon: "🛡️", stat: "Défense" },
      defense: { berry: "Qualot Berry", icon: "🛡️", stat: "Défense" },
      special_attack: { berry: "Hondew Berry", icon: "✨", stat: "Atq. Spé" },
      special_defence: { berry: "Grepa Berry", icon: "🌟", stat: "Déf. Spé" },
      special_defense: { berry: "Grepa Berry", icon: "🌟", stat: "Déf. Spé" },
      speed: { berry: "Tamato Berry", icon: "💨", stat: "Vitesse" },
    };

    // ========== RARITY BUCKET ODDS ==========
    // Tier = somme des bonus (Golden Apple +1, Enchanted Golden Apple +2)
    // Max accessible: 3× Golden = tier 3, ou Enchanted + Golden = tier 3
    const rarityOdds = {
      0:  { common: 86.2, uncommon: 10.3, rare: 2.5, 'ultra-rare': 1.0 },
      1:  { common: 80.2, uncommon: 13.6, rare: 4.2, 'ultra-rare': 2.0 },
      2:  { common: 74.6, uncommon: 16.3, rare: 6.0, 'ultra-rare': 3.1 },
      3:  { common: 69.6, uncommon: 18.4, rare: 7.6, 'ultra-rare': 4.3 },
      4:  { common: 65.0, uncommon: 20.0, rare: 9.0, 'ultra-rare': 6.0 }, // Enchanted + 2 Golden (extrapolé)
      5:  { common: 60.0, uncommon: 21.5, rare: 10.5, 'ultra-rare': 8.0 }, // Enchanted + 3 Golden (extrapolé)
    };

    // Fonction pour obtenir les odds d'une rareté selon le tier
    const getRarityOdds = (tier, rarity) => {
      const normalizedRarity = rarity?.toLowerCase().replace(/_/g, '-') || 'common';
      const tierData = rarityOdds[tier] || rarityOdds[0];
      return tierData[normalizedRarity] || tierData.common;
    };

    // Recommandations pour le Pokémon sélectionné
    const pokemonRecommendations = computed(() => {
      const mon = selectedPokemon.value;
      const fullMon = fullPokemonData.value;
      if (!mon) return null;

      const recommendations = {
        types: [],
        eggGroups: [],
        evs: [],
      };

      // Baies par type (depuis l'index dex)
      if (mon.primaryType) {
        const typeKey = mon.primaryType.toLowerCase();
        if (typeToBerry[typeKey]) {
          recommendations.types.push({
            ...typeToBerry[typeKey],
            type: mon.primaryType,
            multiplier: "x10",
          });
        }
      }
      if (mon.secondaryType) {
        const typeKey = mon.secondaryType.toLowerCase();
        if (typeToBerry[typeKey]) {
          recommendations.types.push({
            ...typeToBerry[typeKey],
            type: mon.secondaryType,
            multiplier: "x10",
          });
        }
      }

      // Baies par groupe d'œuf - utiliser fullMon si disponible, sinon mon
      const eggGroups = fullMon?.eggGroups || mon.eggGroups || [];
      if (eggGroups.length) {
        for (const eg of eggGroups) {
          const egKey = eg.toLowerCase().replace(/[- ]/g, '');
          if (eggGroupToBerry[egKey]) {
            recommendations.eggGroups.push({
              ...eggGroupToBerry[egKey],
              group: eg,
              multiplier: "x10",
            });
          }
        }
      }

      // Baies par EV yield - UTILISER LES DONNÉES COMPLÈTES
      const evBerries = {
        hp: { berry: "Pomeg Berry", icon: "❤️", statName: "PV" },
        attack: { berry: "Kelpsy Berry", icon: "⚔️", statName: "Attaque" },
        defence: { berry: "Qualot Berry", icon: "🛡️", statName: "Défense" },
        defense: { berry: "Qualot Berry", icon: "🛡️", statName: "Défense" },
        special_attack: { berry: "Hondew Berry", icon: "✨", statName: "Att. Spé" },
        specialattack: { berry: "Hondew Berry", icon: "✨", statName: "Att. Spé" },
        special_defence: { berry: "Grepa Berry", icon: "🌟", statName: "Déf. Spé" },
        special_defense: { berry: "Grepa Berry", icon: "🌟", statName: "Déf. Spé" },
        specialdefence: { berry: "Grepa Berry", icon: "🌟", statName: "Déf. Spé" },
        specialdefense: { berry: "Grepa Berry", icon: "🌟", statName: "Déf. Spé" },
        speed: { berry: "Tamato Berry", icon: "💨", statName: "Vitesse" },
      };

      // Utiliser les données complètes pour les EVs
      const evYield = fullMon?.evYield || mon.evYield || {};
      if (Object.keys(evYield).length > 0) {
        for (const [stat, value] of Object.entries(evYield)) {
          if (value > 0) {
            const statKey = stat.toLowerCase().replace(/ /g, '_');
            if (evBerries[statKey]) {
              recommendations.evs.push({
                ...evBerries[statKey],
                stat: evBerries[statKey].statName || tStat(stat),
                value: value,
              });
            }
          }
        }
      }

      return recommendations;
    });

    // État pour stocker les Pokémon concurrents chargés
    const competingPokemonData = ref([]);
    const loadingAnalysis = ref(false);
    
    // ========== HIÉRARCHIE DES BIOMES COBBLEMON ==========
    // Les biomes parents contiennent les biomes enfants
    // Si un Pokémon spawne dans is_overworld, il peut spawner PARTOUT dans l'overworld
    const biomeParents = {
      // is_overworld est le plus large - couvre tout
      '#cobblemon:is_overworld': [
        '#cobblemon:is_grassland', '#cobblemon:is_forest', '#cobblemon:is_mountain',
        '#cobblemon:is_cave', '#cobblemon:is_dripstone', '#cobblemon:is_lush',
        '#cobblemon:is_taiga', '#cobblemon:is_plains', '#cobblemon:is_swamp',
        '#cobblemon:is_desert', '#cobblemon:is_badlands', '#cobblemon:is_beach',
        '#cobblemon:is_jungle', '#cobblemon:is_snowy', '#cobblemon:is_tundra',
        '#cobblemon:is_river', '#cobblemon:is_ocean', '#cobblemon:is_mushroom',
        '#cobblemon:is_cherry_grove', '#cobblemon:is_bamboo', '#cobblemon:is_floral',
        '#cobblemon:is_deep_dark', '#cobblemon:is_sky',
        // Biomes spéciaux overworld
        '#cobblemon:is_spooky', '#cobblemon:is_volcanic', '#cobblemon:is_magical',
        '#cobblemon:is_freezing', '#cobblemon:is_hills', '#cobblemon:is_highlands',
        // Biomes Minecraft directs (pour les Pokémon qui utilisent minecraft:xxx)
        'minecraft:lush_caves', 'minecraft:dripstone_caves', 'minecraft:deep_dark'
      ],
      // is_cave inclut les variantes de grottes
      '#cobblemon:is_cave': [
        '#cobblemon:is_dripstone', '#cobblemon:is_lush', '#cobblemon:is_deep_dark',
        // Biomes Minecraft directs
        'minecraft:lush_caves', 'minecraft:dripstone_caves', 'minecraft:deep_dark'
      ],
      // is_lush correspond aux lush caves
      '#cobblemon:is_lush': [
        'minecraft:lush_caves'
      ],
      // is_dripstone correspond aux dripstone caves
      '#cobblemon:is_dripstone': [
        'minecraft:dripstone_caves'
      ],
      // is_deep_dark correspond au deep dark
      '#cobblemon:is_deep_dark': [
        'minecraft:deep_dark'
      ],
      // is_forest inclut les sous-types
      '#cobblemon:is_forest': [
        '#cobblemon:is_taiga', '#cobblemon:is_jungle', '#cobblemon:is_bamboo', '#cobblemon:is_cherry_grove'
      ],
      // is_cold inclut les biomes froids
      '#cobblemon:is_cold': [
        '#cobblemon:is_snowy', '#cobblemon:is_tundra', '#cobblemon:is_taiga', '#cobblemon:is_freezing'
      ],
      // is_aquatic pour les biomes aquatiques
      '#cobblemon:is_aquatic': [
        '#cobblemon:is_ocean', '#cobblemon:is_river', '#cobblemon:is_beach'
      ]
    };
    
    // Mapping inverse: biomes Minecraft -> tags Cobblemon équivalents
    // Utilisé pour normaliser les biomes lors des comparaisons
    const biomeToTags = {
      'minecraft:lush_caves': ['#cobblemon:is_lush', '#cobblemon:is_cave', '#cobblemon:is_overworld'],
      'minecraft:dripstone_caves': ['#cobblemon:is_dripstone', '#cobblemon:is_cave', '#cobblemon:is_overworld'],
      'minecraft:deep_dark': ['#cobblemon:is_deep_dark', '#cobblemon:is_cave', '#cobblemon:is_overworld'],
    };
    
    // Biomes Nether et End (pas dans is_overworld)
    const netherEndBiomes = new Set([
      'minecraft:nether_wastes', 'minecraft:soul_sand_valley', 'minecraft:crimson_forest',
      'minecraft:warped_forest', 'minecraft:basalt_deltas', 'minecraft:the_end',
      'minecraft:end_highlands', 'minecraft:end_midlands', 'minecraft:end_barrens',
      'minecraft:small_end_islands', 'minecraft:the_void'
    ]);
    
    // Fonction pour vérifier si un biome (parent) couvre un autre biome (enfant)
    const biomeCovers = (parentBiome, childBiome) => {
      if (parentBiome === childBiome) return true;
      
      // Si childBiome est un biome Minecraft direct, vérifier via ses tags équivalents
      const childTags = biomeToTags[childBiome];
      if (childTags && childTags.includes(parentBiome)) {
        return true;
      }
      
      // IMPORTANT: Tous les biomes minecraft:xxx de l'overworld sont couverts par is_overworld
      // Cela permet de détecter que les Pokémon avec is_overworld peuvent spawner dans minecraft:mangrove_swamp
      if (parentBiome === '#cobblemon:is_overworld' && childBiome.startsWith('minecraft:')) {
        // Exclure les biomes du Nether et de l'End
        if (!netherEndBiomes.has(childBiome)) {
          return true;
        }
      }
      
      const children = biomeParents[parentBiome];
      if (!children) return false;
      if (children.includes(childBiome)) return true;
      // Vérifier récursivement
      for (const c of children) {
        if (biomeCovers(c, childBiome)) return true;
      }
      return false;
    };

    // Charger les données de spawn pour l'analyse
    const loadSpawnAnalysis = async () => {
      const mon = selectedPokemon.value;
      const fullMon = fullPokemonData.value;
      if (!mon || !fullMon || !getMon) {
        competingPokemonData.value = [];
        return;
      }

      const monSpawns = flatSpawns(fullMon);
      if (!monSpawns.length) {
        competingPokemonData.value = [];
        return;
      }

      // Extraire les conditions de spawn
      const targetBiomes = new Set();
      const targetPresets = new Set();
      
      for (const spawn of monSpawns) {
        for (const b of (spawn.biomeTags?.include || [])) {
          targetBiomes.add(b);
        }
        for (const p of (spawn.presets || [])) {
          targetPresets.add(p);
        }
      }

      if (targetBiomes.size === 0 && targetPresets.size === 0) {
        competingPokemonData.value = [];
        return;
      }

      loadingAnalysis.value = true;
      
      // Filtrer les Pokémon avec des spawns
      const allCandidates = props.dex.filter(p => 
        p.id !== mon.id && p.spawnCount > 0
      );
      
      // Prioriser les Pokémon qui ont le même type (plus susceptibles d'être de vrais concurrents)
      const targetTypes = [mon.primaryType, mon.secondaryType].filter(Boolean).map(t => t.toLowerCase());
      
      const prioritized = allCandidates.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        
        // Bonus pour même type primaire
        if (targetTypes.includes(a.primaryType?.toLowerCase())) scoreA += 2;
        if (targetTypes.includes(b.primaryType?.toLowerCase())) scoreB += 2;
        
        // Bonus pour même type secondaire  
        if (targetTypes.includes(a.secondaryType?.toLowerCase())) scoreA += 1;
        if (targetTypes.includes(b.secondaryType?.toLowerCase())) scoreB += 1;
        
        return scoreB - scoreA;
      });

      // Charger TOUS les Pokémon pour avoir une couverture complète
      // On charge en batches pour éviter de bloquer l'UI
      const BATCH_SIZE = 30;
      const toLoad = prioritized; // Charger tous les candidats
      
      try {
        // Charger en batches pour ne pas surcharger
        const loadedData = [];
        for (let i = 0; i < toLoad.length; i += BATCH_SIZE) {
          const batch = toLoad.slice(i, i + BATCH_SIZE);
          const batchResults = await Promise.all(
            batch.map(async (p) => {
              try {
                const data = await getMon(p.id);
                return { ...p, fullData: data };
              } catch {
                return null;
              }
            })
          );
          loadedData.push(...batchResults);
        }

        // Filtrer et analyser les spawns
        const competing = [];
        
        // Presets génériques qui ne doivent pas être considérés comme un vrai match
        const genericPresets = new Set(['natural', 'urban', 'underground', 'freshwater', 'saltwater']);
        
        for (const loaded of loadedData) {
          if (!loaded || !loaded.fullData) continue;
          
          const spawns = flatSpawns(loaded.fullData);
          if (!spawns.length) continue;

          let matchScore = 0;
          let matchedBiomes = [];
          let matchedPresets = [];
          let matchedRarities = new Set();
          let matchedTimes = new Set();
          let hasParentBiomeMatch = false; // Track si au moins un match vient d'un biome parent
          // Nouvelles conditions de spawn détaillées
          let matchedConditions = {
            canSeeSky: new Set(),      // true, false, 'any'
            weather: new Set(),         // 'clear', 'rain', 'thunder'
            moonPhase: new Set(),       // 0-7, 'any'
            minLight: null,
            maxLight: null,
            minY: null,
            maxY: null
          };

          for (const spawn of spawns) {
            let spawnMatches = false;
            let biomeMatch = false;
            let isParentBiome = false; // Track si c'est via un biome parent (comme is_overworld)
            
            // Priorité aux biomes - c'est le vrai indicateur de zone
            for (const b of (spawn.biomeTags?.include || [])) {
              // Match direct
              if (targetBiomes.has(b)) {
                matchScore += 5; // Score plus élevé pour les biomes
                if (!matchedBiomes.includes(b)) matchedBiomes.push(b);
                spawnMatches = true;
                biomeMatch = true;
              }
              // Match via biome parent (ex: is_overworld couvre is_dripstone)
              // CAS 1: Le concurrent spawne dans un biome parent qui contient notre cible
              // CAS 2: NOTRE CIBLE spawne dans un biome parent qui contient le biome du concurrent
              else {
                for (const targetBiome of targetBiomes) {
                  // CAS 1: Concurrent (is_overworld) couvre Target (is_forest)
                  if (biomeCovers(b, targetBiome)) {
                    matchScore += 3;
                    if (!matchedBiomes.includes(b)) matchedBiomes.push(b);
                    spawnMatches = true;
                    biomeMatch = true;
                    isParentBiome = true;
                    break;
                  }
                  // CAS 2: Target (is_overworld) couvre Concurrent (is_forest)
                  // Important pour les Pokémon comme Xurkitree qui spawnent partout
                  if (biomeCovers(targetBiome, b)) {
                    matchScore += 2; // Score plus bas car le concurrent est dans un biome plus spécifique
                    if (!matchedBiomes.includes(b)) matchedBiomes.push(b);
                    spawnMatches = true;
                    biomeMatch = true;
                    isParentBiome = true;
                    break;
                  }
                }
              }
            }
            
            // Les presets ne comptent que si :
            // 1. C'est un preset spécifique (pas générique) OU
            // 2. Le biome matche aussi
            for (const p of (spawn.presets || [])) {
              if (targetPresets.has(p)) {
                // Ne compter que si le biome matche aussi OU si c'est un preset spécifique
                const isGeneric = genericPresets.has(p);
                if (!isGeneric || biomeMatch) {
                  matchScore += isGeneric ? 0 : 3; // Presets génériques ne donnent pas de score seuls
                  if (!matchedPresets.includes(p)) matchedPresets.push(p);
                  if (!isGeneric) spawnMatches = true; // Seuls les presets spécifiques comptent comme match
                }
              }
            }
            
            // Si ce spawn matche par BIOME (pas juste preset générique), capturer sa rareté et ses conditions
            if (spawnMatches && biomeMatch) {
              // Tracker si au moins un match vient d'un biome parent (important pour l'UI)
              if (isParentBiome) {
                hasParentBiomeMatch = true;
              }
              
              if (spawn.rarity) {
                matchedRarities.add(spawn.rarity);
              }
              const spawnTimes = spawn.times || ['any'];
              for (const t of spawnTimes) {
                matchedTimes.add(t);
              }
              
              // Capturer les conditions de spawn détaillées
              // Sky condition
              if (spawn.sky?.canSeeSky !== undefined) {
                matchedConditions.canSeeSky.add(spawn.sky.canSeeSky);
              } else {
                matchedConditions.canSeeSky.add('any');
              }
              
              // Weather conditions
              if (spawn.weather?.isThundering === true) {
                matchedConditions.weather.add('thunder');
              } else if (spawn.weather?.isRaining === true) {
                matchedConditions.weather.add('rain');
              } else if (spawn.weather?.isRaining === false || spawn.weather?.isThundering === false) {
                matchedConditions.weather.add('clear');
              } else {
                matchedConditions.weather.add('any');
              }
              
              // Moon phase
              if (spawn.moonPhase !== undefined && spawn.moonPhase !== null) {
                matchedConditions.moonPhase.add(spawn.moonPhase);
              } else {
                matchedConditions.moonPhase.add('any');
              }
              
              // Light levels
              if (spawn.light?.minLight !== undefined) {
                if (matchedConditions.minLight === null || spawn.light.minLight < matchedConditions.minLight) {
                  matchedConditions.minLight = spawn.light.minLight;
                }
              }
              if (spawn.light?.maxLight !== undefined) {
                if (matchedConditions.maxLight === null || spawn.light.maxLight > matchedConditions.maxLight) {
                  matchedConditions.maxLight = spawn.light.maxLight;
                }
              }
              
              // Y levels
              if (spawn.yLevel?.minY !== undefined) {
                if (matchedConditions.minY === null || spawn.yLevel.minY < matchedConditions.minY) {
                  matchedConditions.minY = spawn.yLevel.minY;
                }
              }
              if (spawn.yLevel?.maxY !== undefined) {
                if (matchedConditions.maxY === null || spawn.yLevel.maxY > matchedConditions.maxY) {
                  matchedConditions.maxY = spawn.yLevel.maxY;
                }
              }
            }
          }

          // Ne garder que les vrais concurrents (ceux qui matchent par biome)
          if (matchScore > 0 && matchedBiomes.length > 0) {
            competing.push({
              ...loaded,
              matchScore,
              matchedBiomes,
              matchedPresets,
              matchedRarities: [...matchedRarities],
              matchedTimes: [...matchedTimes],
              hasParentBiomeMatch, // NEW: true si match via is_overworld ou autre parent
              matchedConditions: {
                canSeeSky: [...matchedConditions.canSeeSky],
                weather: [...matchedConditions.weather],
                moonPhase: [...matchedConditions.moonPhase],
                minLight: matchedConditions.minLight,
                maxLight: matchedConditions.maxLight,
                minY: matchedConditions.minY,
                maxY: matchedConditions.maxY
              },
              types: [loaded.primaryType, loaded.secondaryType].filter(Boolean),
              evYield: loaded.fullData?.evYield || {},
              // Hitbox: null = 1x1 par défaut
              hitbox: loaded.fullData?.hitbox || { width: 1, height: 1, fixed: false, isDefault: true },
            });
          }
        }

        // Trier par score
        competing.sort((a, b) => b.matchScore - a.matchScore);
        competingPokemonData.value = competing;
        
      } catch (e) {
        console.error('[SnackPage] Error loading spawn analysis:', e);
        competingPokemonData.value = [];
      } finally {
        loadingAnalysis.value = false;
      }
    };

    // Déclencher l'analyse quand fullPokemonData change
    watch(fullPokemonData, (newVal) => {
      if (newVal) {
        loadSpawnAnalysis();
      } else {
        competingPokemonData.value = [];
      }
    });

    // Analyse des Pokémon dans la même zone pour comparatif
    const spawnAnalysis = computed(() => {
      const mon = selectedPokemon.value;
      const fullMon = fullPokemonData.value;
      if (!mon || !fullMon) return null;

      // Récupérer les spawns du Pokémon sélectionné
      const monSpawns = flatSpawns(fullMon);
      if (!monSpawns.length) return null;

      // Extraire TOUTES les conditions de spawn du Pokémon cible
      const targetConditions = {
        biomes: new Set(),
        presets: new Set(),
        contexts: new Set(),
        rarities: new Set(),
      };
      
      for (const spawn of monSpawns) {
        for (const b of (spawn.biomeTags?.include || [])) {
          targetConditions.biomes.add(b);
        }
        for (const p of (spawn.presets || [])) {
          targetConditions.presets.add(p);
        }
        for (const c of (spawn.contexts || [])) {
          targetConditions.contexts.add(c);
        }
        if (spawn.rarity) {
          targetConditions.rarities.add(spawn.rarity);
        }
      }

      if (targetConditions.biomes.size === 0 && targetConditions.presets.size === 0) return null;

      // Utiliser les données chargées
      const allCompetingPokemon = competingPokemonData.value;

      // ========== ANALYSE PAR ZONE DE SPAWN ==========
      // Analyser chaque zone séparément pour trouver la meilleure
      const zoneAnalysis = [];
      
      for (const spawn of monSpawns) {
        const zoneBiomes = spawn.biomeTags?.include || [];
        const zonePresets = spawn.presets || [];
        const zoneRarity = spawn.rarity || 'common';
        const zoneContexts = spawn.contexts || [];
        const zoneTimes = spawn.times || []; // Horaires de spawn (vide = tout le temps)
        
        if (zoneBiomes.length === 0 && zonePresets.length === 0) continue;
        
        // Compter les concurrents dans cette zone spécifique avec la même rareté ET les mêmes horaires
        const zoneCompetitors = allCompetingPokemon.filter(comp => {
          // Vérifier si le concurrent a la même rareté
          const hasSameRarity = comp.matchedRarities && comp.matchedRarities.includes(zoneRarity);
          if (!hasSameRarity) return false;
          
          // Vérifier si le concurrent spawn dans cette zone spécifique
          // Un concurrent matche si:
          // 1. Son biome exact est dans la zone OU
          // 2. Un de ses biomes COUVRE un biome de la zone (ex: is_cave couvre is_lush)
          let matchesBiome = false;
          if (comp.matchedBiomes) {
            for (const compBiome of comp.matchedBiomes) {
              // Match direct
              if (zoneBiomes.includes(compBiome)) {
                matchesBiome = true;
                break;
              }
              // Match via biome parent: le concurrent a un biome plus générique qui couvre la zone
              for (const zoneBiome of zoneBiomes) {
                if (biomeCovers(compBiome, zoneBiome)) {
                  matchesBiome = true;
                  break;
                }
              }
              if (matchesBiome) break;
            }
          }
          
          const matchesPreset = zonePresets.some(p => comp.matchedPresets && comp.matchedPresets.includes(p));
          
          if (!matchesBiome && !matchesPreset) return false;
          
          // Vérifier les horaires - si la cible a des times spécifiques, le concurrent doit aussi spawner à ces horaires
          if (zoneTimes.length > 0 && comp.matchedTimes) {
            // Le concurrent doit avoir 'any' ou au moins un des mêmes times
            const hasAnyTime = comp.matchedTimes.includes('any');
            const hasSameTime = zoneTimes.some(t => comp.matchedTimes.includes(t));
            if (!hasAnyTime && !hasSameTime) return false;
          }
          
          return true;
        });
        
        const totalInZone = zoneCompetitors.length + 1; // +1 pour la cible
        const baseChance = (1 / totalInZone) * 100;
        
        // Créer un nom lisible pour la zone
        let zoneName = '';
        if (zoneBiomes.length > 0) {
          zoneName = zoneBiomes.map(b => b.replace('#cobblemon:', '').replace('is_', '')).join(', ');
        } else if (zonePresets.length > 0) {
          zoneName = zonePresets.join(', ');
        }
        
        zoneAnalysis.push({
          name: zoneName,
          biomes: zoneBiomes,
          presets: zonePresets,
          contexts: zoneContexts,
          rarity: zoneRarity,
          levels: spawn.levels || '?',
          weight: spawn.weight || 1,
          competitorCount: zoneCompetitors.length,
          totalInZone,
          baseChance: Math.round(baseChance * 10) / 10,
          competitors: zoneCompetitors.slice(0, 10), // Top 10 concurrents
          // Conditions détaillées
          spawnType: spawn.spawnType,
          sky: spawn.sky,
          light: spawn.light,
          moonPhase: spawn.moonPhase,
          weather: spawn.weather,
          yLevel: spawn.yLevel,
          xLevel: spawn.xLevel,
          fluid: spawn.fluid,
          isSubmerged: spawn.isSubmerged,
          dimensions: spawn.dimensions,
          excludeDimensions: spawn.excludeDimensions,
          times: spawn.times,
          excludeTimes: spawn.excludeTimes,
          // 🧱 Nouvelles conditions de blocs
          baseBlocks: spawn.baseBlocks,
          nearbyBlocks: spawn.nearbyBlocks,
          excludeNearbyBlocks: spawn.excludeNearbyBlocks,
          // 🏛️ Structures
          structures: spawn.structures,
          excludeStructures: spawn.excludeStructures,
          // 🎣 Pêche
          lure: spawn.lure,
          excludeLure: spawn.excludeLure,
          rodType: spawn.rodType,
          bait: spawn.bait,
          // 🔶 Spécial
          isSlimeChunk: spawn.isSlimeChunk,
          excludeSlimeChunk: spawn.excludeSlimeChunk,
          keyItem: spawn.keyItem,
          weightMultiplier: spawn.weightMultiplier,
          // Type et ID
          type: spawn.type,
          spawnId: spawn.spawnId,
        });
      }
      
      // Trier par base chance (meilleur en premier = moins de compétition)
      zoneAnalysis.sort((a, b) => b.baseChance - a.baseChance);
      
      const bestZone = zoneAnalysis.length > 0 ? zoneAnalysis[0] : null;

      // ========== ANALYSE DES CONDITIONS OPTIMALES ==========
      // Analyser chaque condition pour trouver la configuration qui minimise la concurrence
      const conditionAnalysis = {
        times: [],      // Horaires
        sky: [],        // Ciel ouvert ou non
        light: [],      // Niveaux de lumière
        moonPhase: [],  // Phase lunaire
        weather: [],    // Météo
        yLevel: [],     // Altitude Y
        hitbox: [],     // Analyse par hauteur de hitbox
      };
      
      // Collecter toutes les conditions possibles de la cible
      const targetConditionValues = {
        times: new Set(),
        canSeeSky: new Set(),
        lightRanges: [],
        moonPhases: new Set(),
        weather: new Set(),
        yLevelRanges: [],
      };
      
      for (const spawn of monSpawns) {
        // Times
        for (const t of (spawn.times || [])) {
          targetConditionValues.times.add(t);
        }
        // Sky
        if (spawn.sky?.canSeeSky !== undefined) {
          targetConditionValues.canSeeSky.add(spawn.sky.canSeeSky);
        }
        // Light
        if (spawn.light) {
          targetConditionValues.lightRanges.push({
            min: spawn.light.minLight ?? 0,
            max: spawn.light.maxLight ?? 15
          });
        }
        // Moon phase
        if (spawn.moonPhase !== undefined) {
          targetConditionValues.moonPhases.add(spawn.moonPhase);
        }
        // Weather
        if (spawn.weather?.isRaining) targetConditionValues.weather.add('rain');
        if (spawn.weather?.isThundering) targetConditionValues.weather.add('thunder');
        // Y level
        if (spawn.yLevel) {
          targetConditionValues.yLevelRanges.push({
            min: spawn.yLevel.minY ?? -64,
            max: spawn.yLevel.maxY ?? 320
          });
        }
      }
      
      // Pour chaque condition, calculer le nombre de concurrents selon la valeur
      // TIMES - Analyser jour vs nuit vs autres
      const allTimes = ['day', 'night', 'dawn', 'dusk', 'noon', 'midnight'];
      for (const time of allTimes) {
        // La cible spawn-elle à cet horaire?
        const targetSpawnsAtTime = targetConditionValues.times.size === 0 || targetConditionValues.times.has(time);
        if (!targetSpawnsAtTime) continue;
        
        // Compter les concurrents qui spawnent aussi à cet horaire
        const competitorsAtTime = allCompetingPokemon.filter(comp => {
          if (!comp.matchedTimes) return true; // Pas de restriction = spawn tout le temps
          return comp.matchedTimes.includes('any') || comp.matchedTimes.includes(time);
        }).length;
        
        conditionAnalysis.times.push({
          value: time,
          label: time === 'day' ? '☀️ Jour' : time === 'night' ? '🌙 Nuit' : time === 'dawn' ? '🌅 Aube' : time === 'dusk' ? '🌇 Crépuscule' : time === 'noon' ? '🌞 Midi' : '🌑 Minuit',
          competitors: competitorsAtTime,
          targetCanSpawn: true,
        });
      }
      conditionAnalysis.times.sort((a, b) => a.competitors - b.competitors);
      
      // SKY - Ciel ouvert vs couvert
      const skyOptions = [
        { value: true, label: '🌤️ Ciel ouvert' },
        { value: false, label: '🏚️ Couvert/Souterrain' },
      ];
      
      for (const opt of skyOptions) {
        // La cible peut-elle spawn avec cette condition?
        const targetCanSpawn = targetConditionValues.canSeeSky.size === 0 || targetConditionValues.canSeeSky.has(opt.value);
        if (!targetCanSpawn) continue;
        
        // Compter concurrents qui spawnent aussi avec cette condition de ciel
        const competitorsWithSky = allCompetingPokemon.filter(comp => {
          if (!comp.matchedConditions?.canSeeSky) return true; // Pas de restriction
          return comp.matchedConditions.canSeeSky.includes('any') || comp.matchedConditions.canSeeSky.includes(opt.value);
        }).length;
        
        conditionAnalysis.sky.push({
          value: opt.value,
          label: opt.label,
          competitors: competitorsWithSky,
          targetCanSpawn: true,
        });
      }
      conditionAnalysis.sky.sort((a, b) => a.competitors - b.competitors);
      
      // WEATHER - Météo
      const weatherOptions = [
        { value: 'clear', label: '☀️ Temps clair' },
        { value: 'rain', label: '🌧️ Pluie' },
        { value: 'thunder', label: '⛈️ Orage' },
      ];
      
      for (const opt of weatherOptions) {
        const targetCanSpawn = targetConditionValues.weather.size === 0 || 
          (opt.value === 'clear' && targetConditionValues.weather.size === 0) ||
          targetConditionValues.weather.has(opt.value);
        
        if (!targetCanSpawn && targetConditionValues.weather.size > 0) continue;
        
        // Compter concurrents qui spawnent aussi avec cette météo
        const competitorsWithWeather = allCompetingPokemon.filter(comp => {
          if (!comp.matchedConditions?.weather) return true; // Pas de restriction
          return comp.matchedConditions.weather.includes('any') || comp.matchedConditions.weather.includes(opt.value);
        }).length;
        
        conditionAnalysis.weather.push({
          value: opt.value,
          label: opt.label,
          competitors: competitorsWithWeather,
          targetCanSpawn: true,
        });
      }
      conditionAnalysis.weather.sort((a, b) => a.competitors - b.competitors);
      
      // ========== LIGHT LEVEL ANALYSIS ==========
      // Analyser les niveaux de lumière pour optimiser la plateforme
      // Light level va de 0 (noir complet) à 15 (plein soleil/torches)
      
      // Déterminer la plage de lumière acceptable pour la cible
      let targetMinLight = 0, targetMaxLight = 15;
      if (targetConditionValues.lightRanges.length > 0) {
        targetMinLight = Math.min(...targetConditionValues.lightRanges.map(r => r.min));
        targetMaxLight = Math.max(...targetConditionValues.lightRanges.map(r => r.max));
      }
      
      // Créer des catégories de lumière pratiques
      const lightCategories = [
        { min: 0, max: 0, label: '🌑 Noir complet (0)', description: 'Aucune source de lumière' },
        { min: 1, max: 7, label: '🌘 Sombre (1-7)', description: 'Faible lumière (ex: torches loin)' },
        { min: 8, max: 11, label: '🌗 Modéré (8-11)', description: 'Lumière moyenne' },
        { min: 12, max: 14, label: '🌖 Lumineux (12-14)', description: 'Bien éclairé' },
        { min: 15, max: 15, label: '☀️ Plein jour (15)', description: 'Lumière maximale (soleil/glowstone)' },
      ];
      
      for (const cat of lightCategories) {
        // Vérifier si la cible peut spawn dans cette catégorie de lumière
        const targetCanSpawnInLight = (cat.min <= targetMaxLight && cat.max >= targetMinLight);
        if (!targetCanSpawnInLight) continue;
        
        // Compter les concurrents qui peuvent spawner dans cette plage de lumière
        const competitorsInLight = allCompetingPokemon.filter(comp => {
          // Si le concurrent n'a pas de restriction de lumière, il spawn partout
          if (comp.matchedConditions?.minLight === null && comp.matchedConditions?.maxLight === null) {
            return true;
          }
          
          const compMinLight = comp.matchedConditions?.minLight ?? 0;
          const compMaxLight = comp.matchedConditions?.maxLight ?? 15;
          
          // Vérifier si les plages se chevauchent
          return compMinLight <= cat.max && compMaxLight >= cat.min;
        }).length;
        
        // Calculer combien de concurrents seraient bloqués par cette lumière
        const competitorsBlocked = allCompetingPokemon.length - competitorsInLight;
        
        conditionAnalysis.light.push({
          min: cat.min,
          max: cat.max,
          label: cat.label,
          description: cat.description,
          competitors: competitorsInLight,
          blocked: competitorsBlocked,
          targetCanSpawn: true,
          // Conseil pratique
          tip: cat.min === 0 ? 'Pas de torches, zone très sombre' :
               cat.max <= 7 ? 'Quelques torches espacées' :
               cat.min >= 12 ? 'Beaucoup de torches ou glowstone' :
               'Éclairage modéré',
        });
      }
      // Trier par nombre de concurrents (moins = mieux)
      conditionAnalysis.light.sort((a, b) => a.competitors - b.competitors);
      
      // MOON PHASE
      if (targetConditionValues.moonPhases.size > 0) {
        const moonLabels = {
          0: '🌕 Pleine lune',
          1: '🌖 Gibbeuse décr.',
          2: '🌗 Dernier quartier',
          3: '🌘 Croissant décr.',
          4: '🌑 Nouvelle lune',
          5: '🌒 Croissant crois.',
          6: '🌓 Premier quartier',
          7: '🌔 Gibbeuse crois.',
        };
        
        for (const phase of targetConditionValues.moonPhases) {
          // Compter concurrents qui spawnent aussi à cette phase lunaire
          const competitorsAtPhase = allCompetingPokemon.filter(comp => {
            if (!comp.matchedConditions?.moonPhase) return true; // Pas de restriction
            return comp.matchedConditions.moonPhase.includes('any') || comp.matchedConditions.moonPhase.includes(phase);
          }).length;
          
          conditionAnalysis.moonPhase.push({
            value: phase,
            label: moonLabels[phase] || `Phase ${phase}`,
            competitors: competitorsAtPhase,
            targetCanSpawn: true,
          });
        }
        conditionAnalysis.moonPhase.sort((a, b) => a.competitors - b.competitors);
      }
      
      // ========== Y LEVEL ANALYSIS ==========
      // Analyser les niveaux Y pour trouver la hauteur optimale
      // On divise en tranches de 32 blocs pour avoir une granularité utile
      // On fait l'analyse même si la cible n'a pas de restriction Y explicite
      // car les concurrents peuvent avoir des restrictions qui varient selon l'altitude
      
      // Calculer la plage Y valide pour la cible
      let targetMinY = -64, targetMaxY = 320;
      
      // Utiliser les restrictions Y-level de la cible si disponibles
      if (targetConditionValues.yLevelRanges.length > 0) {
        for (const range of targetConditionValues.yLevelRanges) {
          if (range.min !== undefined && range.min > targetMinY) targetMinY = range.min;
          if (range.max !== undefined && range.max < targetMaxY) targetMaxY = range.max;
        }
      } else {
        // Si la cible n'a pas de restriction Y, utiliser une plage basée sur le biome
        // Les biomes de cave sont typiquement dans les Y négatifs à bas
        const isCaveBiome = zoneAnalysis.some(z => 
          z.biomes?.some(b => b.includes('cave') || b.includes('dripstone') || b.includes('deep_dark') || b.includes('lush'))
        );
        const isUndergroundBiome = zoneAnalysis.some(z =>
          z.biomes?.some(b => b.includes('underground'))
        );
        
        if (isCaveBiome || isUndergroundBiome) {
          // Biomes souterrains: plage typique Y -64 à 50
          targetMinY = -64;
          targetMaxY = 50;
        }
        // Sinon on garde la plage complète -64 à 320
      }
      
      // Collecter les restrictions Y de TOUS les concurrents pour créer des tranches intelligentes
      const competitorYRanges = allCompetingPokemon
        .filter(comp => comp.matchedConditions?.minY !== undefined || comp.matchedConditions?.maxY !== undefined)
        .map(comp => ({
          minY: comp.matchedConditions.minY ?? -64,
          maxY: comp.matchedConditions.maxY ?? 320
        }));
      
      // Toujours faire l'analyse si on a des concurrents avec des restrictions Y
      // OU si on a une plage spécifique pour la cible
      if (targetConditionValues.yLevelRanges.length > 0 || competitorYRanges.length > 0) {
        // Créer des tranches de 32 blocs dans la plage valide
        const ySlices = [];
        const sliceSize = 32;
        for (let y = Math.floor(targetMinY / sliceSize) * sliceSize; y <= targetMaxY; y += sliceSize) {
          const sliceMin = Math.max(y, targetMinY);
          const sliceMax = Math.min(y + sliceSize - 1, targetMaxY);
          if (sliceMin <= sliceMax) {
            ySlices.push({ min: sliceMin, max: sliceMax });
          }
        }
        
        // Pour chaque tranche, compter les concurrents qui peuvent spawner
        for (const slice of ySlices) {
          const competitorsInSlice = allCompetingPokemon.filter(comp => {
            // Si le concurrent n'a pas de restriction Y, il spawne partout
            if (!comp.matchedConditions?.minY && !comp.matchedConditions?.maxY) return true;
            
            const compMinY = comp.matchedConditions.minY ?? -64;
            const compMaxY = comp.matchedConditions.maxY ?? 320;
            
            // Vérifier si les plages se chevauchent
            return compMinY <= slice.max && compMaxY >= slice.min;
          }).length;
          
          conditionAnalysis.yLevel.push({
            value: `${slice.min}-${slice.max}`,
            min: slice.min,
            max: slice.max,
            label: `Y: ${slice.min} → ${slice.max}`,
            competitors: competitorsInSlice,
            targetCanSpawn: true,
          });
        }
        conditionAnalysis.yLevel.sort((a, b) => a.competitors - b.competitors);
      }
      
      // ========== HITBOX ANALYSIS ==========
      // Analyser combien de concurrents ont besoin de différentes hauteurs
      // Hitbox null = 1x1 par défaut
      // Règle: si hauteur est un entier > 1, il faut ajouter 1 bloc d'espace
      const targetHitbox = fullMon.hitbox || { width: 1, height: 1, fixed: false, isDefault: true };
      const targetHeight = targetHitbox.height <= 1 ? 1 : (Number.isInteger(targetHitbox.height) ? targetHitbox.height + 1 : Math.ceil(targetHitbox.height));
      
      // Analyser les différentes hauteurs de plafond possibles
      const heightOptions = [1, 2, 3, 4, 5];
      for (const height of heightOptions) {
        // La cible peut-elle spawn avec cette hauteur?
        const targetCanSpawn = targetHeight <= height;
        if (!targetCanSpawn) continue;
        
        // Compter les concurrents qui peuvent spawner avec cette hauteur
        const competitorsAtHeight = allCompetingPokemon.filter(comp => {
          const h = comp.hitbox?.height || 1;
          const compHeight = h <= 1 ? 1 : (Number.isInteger(h) ? h + 1 : Math.ceil(h));
          return compHeight <= height;
        }).length;
        
        // Compter ceux qui seraient BLOQUÉS par ce plafond
        const competitorsBlocked = allCompetingPokemon.length - competitorsAtHeight;
        
        conditionAnalysis.hitbox.push({
          value: height,
          label: `Plafond ${height} bloc${height > 1 ? 's' : ''}`,
          competitors: competitorsAtHeight,
          blocked: competitorsBlocked,
          targetCanSpawn: true,
        });
      }
      // Trier par nombre de concurrents (moins = mieux)
      conditionAnalysis.hitbox.sort((a, b) => a.competitors - b.competitors);
      
      // Trouver les meilleures conditions
      const optimalConditions = {
        time: conditionAnalysis.times.length > 0 ? conditionAnalysis.times[0] : null,
        sky: conditionAnalysis.sky.length > 0 ? conditionAnalysis.sky[0] : null,
        weather: conditionAnalysis.weather.length > 0 ? conditionAnalysis.weather[0] : null,
        light: conditionAnalysis.light.length > 0 ? conditionAnalysis.light[0] : null,
        moonPhase: conditionAnalysis.moonPhase.length > 0 ? conditionAnalysis.moonPhase[0] : null,
        yLevel: conditionAnalysis.yLevel.length > 0 ? conditionAnalysis.yLevel[0] : null,
        hitbox: conditionAnalysis.hitbox.length > 0 ? conditionAnalysis.hitbox[0] : null,
        // Résumé
        summary: [],
      };
      
      // Générer un résumé des conditions optimales
      if (optimalConditions.time && conditionAnalysis.times.length > 1) {
        const worst = conditionAnalysis.times[conditionAnalysis.times.length - 1];
        const improvement = worst.competitors - optimalConditions.time.competitors;
        if (improvement > 0) {
          optimalConditions.summary.push({
            condition: 'Horaire',
            best: optimalConditions.time.label,
            worst: worst.label,
            improvement: improvement,
            tip: `Chassez ${optimalConditions.time.label} au lieu de ${worst.label} pour éviter ${improvement} concurrent${improvement > 1 ? 's' : ''}.`
          });
        }
      }
      
      // Résumé SKY
      if (optimalConditions.sky && conditionAnalysis.sky.length > 1) {
        const worst = conditionAnalysis.sky[conditionAnalysis.sky.length - 1];
        const improvement = worst.competitors - optimalConditions.sky.competitors;
        if (improvement > 0) {
          optimalConditions.summary.push({
            condition: 'Ciel',
            best: optimalConditions.sky.label,
            worst: worst.label,
            improvement: improvement,
            tip: `Cherchez en ${optimalConditions.sky.label.split(' ').slice(1).join(' ')} au lieu de ${worst.label.split(' ').slice(1).join(' ')} pour éviter ${improvement} concurrent${improvement > 1 ? 's' : ''}.`
          });
        }
      }
      
      // Résumé WEATHER
      if (optimalConditions.weather && conditionAnalysis.weather.length > 1) {
        const worst = conditionAnalysis.weather[conditionAnalysis.weather.length - 1];
        const improvement = worst.competitors - optimalConditions.weather.competitors;
        if (improvement > 0) {
          optimalConditions.summary.push({
            condition: 'Météo',
            best: optimalConditions.weather.label,
            worst: worst.label,
            improvement: improvement,
            tip: `Chassez par ${optimalConditions.weather.label.split(' ').slice(1).join(' ')} pour éviter ${improvement} concurrent${improvement > 1 ? 's' : ''}.`
          });
        }
      }
      
      // Résumé LIGHT - Niveau de lumière optimal
      if (optimalConditions.light && conditionAnalysis.light.length > 1) {
        const worst = conditionAnalysis.light[conditionAnalysis.light.length - 1];
        const improvement = worst.competitors - optimalConditions.light.competitors;
        if (improvement > 0) {
          optimalConditions.summary.push({
            condition: 'Lumière',
            best: optimalConditions.light.label,
            worst: worst.label,
            improvement: improvement,
            tip: optimalConditions.light.min === 0 
              ? `Ne mettez PAS de torches ! La zone très sombre évite ${improvement} concurrent${improvement > 1 ? 's' : ''}.`
              : optimalConditions.light.min >= 12
              ? `Mettez beaucoup de lumière (torches/glowstone) pour éviter ${improvement} concurrent${improvement > 1 ? 's' : ''}.`
              : `Gardez un éclairage ${optimalConditions.light.label.split(' ').slice(1).join(' ')} pour éviter ${improvement} concurrent${improvement > 1 ? 's' : ''}.`
          });
        }
      }
      
      // Résumé MOON PHASE
      if (optimalConditions.moonPhase && conditionAnalysis.moonPhase.length > 1) {
        const worst = conditionAnalysis.moonPhase[conditionAnalysis.moonPhase.length - 1];
        const improvement = worst.competitors - optimalConditions.moonPhase.competitors;
        if (improvement > 0) {
          optimalConditions.summary.push({
            condition: 'Phase lunaire',
            best: optimalConditions.moonPhase.label,
            worst: worst.label,
            improvement: improvement,
            tip: `Attendez la ${optimalConditions.moonPhase.label.split(' ').slice(1).join(' ')} au lieu de ${worst.label.split(' ').slice(1).join(' ')} pour éviter ${improvement} concurrent${improvement > 1 ? 's' : ''}.`
          });
        }
      }
      
      // Résumé Y LEVEL - Hauteur optimale de la plateforme
      if (optimalConditions.yLevel && conditionAnalysis.yLevel.length > 1) {
        const worst = conditionAnalysis.yLevel[conditionAnalysis.yLevel.length - 1];
        const improvement = worst.competitors - optimalConditions.yLevel.competitors;
        if (improvement > 0) {
          optimalConditions.summary.push({
            condition: 'Altitude Y',
            best: `Y ${optimalConditions.yLevel.min} → ${optimalConditions.yLevel.max}`,
            worst: `Y ${worst.min} → ${worst.max}`,
            improvement: improvement,
            tip: `Construisez votre plateforme entre Y=${optimalConditions.yLevel.min} et Y=${optimalConditions.yLevel.max} pour éviter ${improvement} concurrent${improvement > 1 ? 's' : ''}. Évitez Y=${worst.min}-${worst.max}.`
          });
        }
      }

      // ========== GROUPER PAR RARETÉ ==========
      // Le PokéSnack fonctionne ainsi:
      // 1. Le jeu décide d'abord la RARETÉ (ultra-rare, rare, etc.)
      // 2. ENSUITE les baies filtrent/boostent DANS cette catégorie de rareté
      
      const targetRarities = [...targetConditions.rarities];
      const primaryRarity = targetRarities[0] || 'common'; // Prendre la première rareté
      
      // Récupérer les horaires de spawn de la cible
      const targetTimes = new Set();
      for (const spawn of monSpawns) {
        for (const t of (spawn.times || ['any'])) {
          targetTimes.add(t);
        }
      }
      const targetTimesArray = [...targetTimes];
      
      // Filtrer les concurrents qui ont la MÊME RARETÉ et les MÊMES HORAIRES que la cible
      const competingInSameRarity = allCompetingPokemon.filter(comp => {
        // Vérifier la rareté
        const hasSameRarity = comp.matchedRarities && comp.matchedRarities.some(r => targetConditions.rarities.has(r));
        if (!hasSameRarity) return false;
        
        // Vérifier les horaires - le concurrent doit pouvoir spawner aux mêmes moments
        if (comp.matchedTimes) {
          // Si la cible spawn tout le temps (any ou pas de times), inclure tout le monde
          if (targetTimes.has('any') || targetTimes.size === 0) return true;
          // Si le concurrent spawn tout le temps, l'inclure
          if (comp.matchedTimes.includes('any')) return true;
          // Sinon, vérifier qu'il y a au moins un horaire en commun
          const hasSameTime = targetTimesArray.some(t => comp.matchedTimes.includes(t));
          if (!hasSameTime) return false;
        }
        
        return true;
      });
      
      const totalInRarity = competingInSameRarity.length + 1; // +1 pour la cible

      // ========== ANALYSE DES TYPES DANS LA MÊME RARETÉ ==========
      const typeAnalysis = {};
      
      // Types du Pokémon cible
      if (mon.primaryType) {
        const t = mon.primaryType.toLowerCase();
        typeAnalysis[t] = { target: true, targetCount: 1, sameType: 0, competitors: [] };
      }
      if (mon.secondaryType) {
        const t = mon.secondaryType.toLowerCase();
        if (!typeAnalysis[t]) typeAnalysis[t] = { target: true, targetCount: 1, sameType: 0, competitors: [] };
      }

      // Compter les concurrents DE LA MÊME RARETÉ par type
      for (const comp of competingInSameRarity) {
        if (comp.primaryType) {
          const t = comp.primaryType.toLowerCase();
          if (!typeAnalysis[t]) typeAnalysis[t] = { target: false, targetCount: 0, sameType: 0, competitors: [] };
          typeAnalysis[t].sameType++;
          if (typeAnalysis[t].target) {
            typeAnalysis[t].competitors.push({ id: comp.id, name: comp.name || comp.id, nameFr: comp.nameFr });
          }
        }
        if (comp.secondaryType) {
          const t = comp.secondaryType.toLowerCase();
          if (!typeAnalysis[t]) typeAnalysis[t] = { target: false, targetCount: 0, sameType: 0, competitors: [] };
          typeAnalysis[t].sameType++;
          if (typeAnalysis[t].target && !typeAnalysis[t].competitors.find(c => c.id === comp.id)) {
            typeAnalysis[t].competitors.push({ id: comp.id, name: comp.name || comp.id, nameFr: comp.nameFr });
          }
        }
      }

      // Calculer l'efficacité pour les types du Pokémon cible
      const typeEfficiency = [];
      for (const [type, data] of Object.entries(typeAnalysis)) {
        if (data.target && typeToBerry[type]) {
          const sameTypeTotal = data.targetCount + data.sameType;
          const otherTypeCount = totalInRarity - sameTypeTotal;
          
          // Avec multiplicateur x10
          const boostedChance = 10 * data.targetCount;
          const totalWeight = (10 * sameTypeTotal) + otherTypeCount;
          const efficiency = Math.round((boostedChance / totalWeight) * 100);
          
          typeEfficiency.push({
            category: 'type',
            type,
            berry: typeToBerry[type].berry,
            icon: typeToBerry[type].icon,
            targetCount: data.targetCount,
            sameType: data.sameType,
            otherTypes: otherTypeCount,
            efficiency,
            mechanic: 'multiplicateur',
            recommendation: efficiency >= 50 ? 'excellent' : efficiency >= 25 ? 'bon' : 'faible',
            competitors: data.competitors.slice(0, 15), // Max 15 concurrents
          });
        }
      }
      typeEfficiency.sort((a, b) => b.efficiency - a.efficiency);

      // ========== ANALYSE DES EVs DANS LA MÊME RARETÉ (Boost x1.5) ==========
      const evAnalysis = {};
      const targetEvs = fullMon?.evYield || {};
      
      // Trouver les EVs que le Pokémon cible donne
      for (const [stat, value] of Object.entries(targetEvs)) {
        if (value > 0 && evToBerry[stat]) {
          evAnalysis[stat] = { 
            target: true, 
            targetCount: 1, 
            targetValue: value, 
            pokemonWithThisEv: 1, 
            competitors: [], 
            eliminated: [],
            // NOUVEAU: Compteur toutes raretés (pour économiser les PokéSnacks)
            allRaritiesCount: 1,
            allRaritiesList: [],
          };
        }
      }

      // Compter SEULEMENT les concurrents DE LA MÊME RARETÉ qui donnent le même EV
      // ET identifier ceux qui sont ÉLIMINÉS (ne donnent pas cet EV)
      for (const comp of competingInSameRarity) {
        const compEvs = comp.evYield || {};
        
        for (const [stat, data] of Object.entries(evAnalysis)) {
          const compValue = compEvs[stat] || 0;
          if (compValue > 0) {
            // Ce concurrent PARTAGE l'EV - il reste dans le pool
            data.pokemonWithThisEv++;
            data.competitors.push({ id: comp.id, name: comp.name || comp.id, nameFr: comp.nameFr, evValue: compValue, rarity: comp.matchedRarities?.[0] });
          } else {
            // Ce concurrent NE DONNE PAS cet EV - il est ÉLIMINÉ
            data.eliminated.push({ id: comp.id, name: comp.name || comp.id, nameFr: comp.nameFr });
          }
        }
      }
      
      // NOUVEAU: Compter TOUS les Pokémon (toutes raretés) qui donnent chaque EV
      // Cela permet de savoir combien de PokéSnacks seront consommés au total
      // IMPORTANT: On cherche dans TOUT le dex, pas seulement les concurrents de même biome
      // Car la baie EV attire tous les Pokémon de la zone qui donnent cet EV
      
      // D'abord, chercher dans les concurrents de même biome (ceux qu'on connaît)
      // Hauteur de hitbox cible pour filtrage plafond (null = 1 par défaut)
      // Règle: si hauteur est un entier > 1, il faut ajouter 1 bloc d'espace
      const targetH = fullMon.hitbox?.height || 1;
      const targetHitboxHeight = targetH <= 1 ? 1 : (Number.isInteger(targetH) ? targetH + 1 : Math.ceil(targetH));
      
      for (const comp of allCompetingPokemon) {
        const compEvs = comp.evYield || {};
        const compH = comp.hitbox?.height || 1;
        const compHitboxHeight = compH <= 1 ? 1 : (Number.isInteger(compH) ? compH + 1 : Math.ceil(compH));
        const isBlockedByHitbox = compHitboxHeight > targetHitboxHeight;
        
        // NOUVEAU: Vérifier si le concurrent est bloqué par les conditions optimales
        // 1. SKY: Si optimalConditions.sky est défini et différent de 'any'
        let isBlockedBySky = false;
        if (optimalConditions.sky && comp.matchedConditions?.canSeeSky) {
          const optSky = optimalConditions.sky.value;
          const compCanSeeSky = comp.matchedConditions.canSeeSky;
          // Le concurrent est bloqué s'il ne peut PAS spawn avec cette condition de ciel
          if (!compCanSeeSky.includes('any') && !compCanSeeSky.includes(optSky)) {
            isBlockedBySky = true;
          }
        }
        
        // 2. Y LEVEL: Si optimalConditions.yLevel est défini
        let isBlockedByY = false;
        if (optimalConditions.yLevel) {
          const optMinY = optimalConditions.yLevel.min;
          const optMaxY = optimalConditions.yLevel.max;
          const compMinY = comp.matchedConditions?.minY ?? -64;
          const compMaxY = comp.matchedConditions?.maxY ?? 320;
          // Le concurrent est bloqué si sa plage Y ne chevauche PAS la plage optimale
          if (compMaxY < optMinY || compMinY > optMaxY) {
            isBlockedByY = true;
          }
        }
        
        const isBlockedByConditions = isBlockedBySky || isBlockedByY;
        
        for (const [stat, data] of Object.entries(evAnalysis)) {
          const compValue = compEvs[stat] || 0;
          if (compValue > 0) {
            data.allRaritiesCount++;
            data.allRaritiesList.push({ 
              id: comp.id, 
              name: comp.name || comp.id, 
              nameFr: comp.nameFr, 
              evValue: compValue,
              rarity: comp.matchedRarities?.[0] || 'unknown',
              sameZone: !comp.hasParentBiomeMatch, // true si match direct, false si via parent
              viaParentBiome: comp.hasParentBiomeMatch || false, // true si match via is_overworld etc.
              // Info hitbox pour filtrage plafond
              hitboxHeight: compHitboxHeight,
              blockedByHitbox: isBlockedByHitbox,
              // NOUVEAU: Info conditions optimales
              blockedBySky: isBlockedBySky,
              blockedByY: isBlockedByY,
              blockedByConditions: isBlockedByConditions,
            });
          }
        }
      }
      
      // Ensuite, chercher TOUS les autres Pokémon du dex qui donnent cet EV
      // Ils peuvent potentiellement spawner dans la zone si leurs biomes se chevauchent
      const dexPokemon = props.dex || [];
      const alreadyAdded = new Set([mon.id, ...allCompetingPokemon.map(c => c.id)]);
      
      for (const p of dexPokemon) {
        if (alreadyAdded.has(p.id)) continue;
        if (!p.spawnCount || p.spawnCount === 0) continue;
        
        // Vérifier si ce Pokémon donne un EV qu'on analyse
        for (const [stat, data] of Object.entries(evAnalysis)) {
          // On utilise les EVs du dex summary si disponibles, sinon on skip
          // Note: On ne peut pas charger tous les fullData, donc on utilise une heuristique
          // basée sur les types (les Pokémon de même type ont souvent des EVs similaires)
        }
      }
      
      // Ajouter une note d'avertissement si la zone est générique (natural, etc.)
      const hasGenericPreset = [...targetConditions.presets].some(p => 
        ['natural', 'urban', 'underground'].includes(p)
      );
      
      // Vérifier aussi si le biome est générique (is_overworld couvre tout l'overworld)
      const genericBiomes = ['#cobblemon:is_overworld', '#cobblemon:is_cave', '#cobblemon:is_aquatic'];
      const hasGenericBiome = [...targetConditions.biomes].some(b => genericBiomes.includes(b));
      
      for (const [stat, data] of Object.entries(evAnalysis)) {
        if (hasGenericPreset || hasGenericBiome) {
          data.warningGenericZone = true;
          data.warningMessage = hasGenericBiome 
            ? lang.value === 'fr' 
              ? "Biome global (is_overworld) - beaucoup de Pokémon peuvent être attirés !"
              : "Global biome (is_overworld) - many Pokémon can be attracted!"
            : lang.value === 'fr'
              ? "Zone générique détectée - d'autres Pokémon peuvent être attirés !"
              : "Generic zone detected - other Pokémon may be attracted!";
        }
      }

      // Calculer l'efficacité pour les EVs - Boost x1.5 (50% de chances en plus)
      const evEfficiency = [];
      
      // Hauteur de hitbox cible (null = 1 par défaut) - déjà calculé plus haut
      // const targetHitboxHeight = Math.ceil(fullMon.hitbox?.height || 1);
      
      for (const [stat, data] of Object.entries(evAnalysis)) {
        if (data.target && evToBerry[stat]) {
          // Boost x1.5: calcul de l'efficacité
          const efficiency = Math.round((1 / data.pokemonWithThisEv) * 100);
          
          // Séparer les Pokémon bloqués (hitbox OU conditions optimales) de ceux qui passent
          const blockedByHitboxList = data.allRaritiesList.filter(p => p.blockedByHitbox);
          const blockedByConditionsList = data.allRaritiesList.filter(p => p.blockedByConditions && !p.blockedByHitbox);
          const blockedList = data.allRaritiesList.filter(p => p.blockedByHitbox || p.blockedByConditions);
          const passingList = data.allRaritiesList.filter(p => !p.blockedByHitbox && !p.blockedByConditions);
          
          // Grouper les Pokémon QUI PASSENT par rareté pour l'affichage
          const byRarity = {};
          for (const p of passingList) {
            const r = p.rarity || 'unknown';
            if (!byRarity[r]) byRarity[r] = [];
            byRarity[r].push(p);
          }
          
          // Grouper les Pokémon BLOQUÉS PAR HITBOX par rareté
          const blockedByHitboxByRarity = {};
          for (const p of blockedByHitboxList) {
            const r = p.rarity || 'unknown';
            if (!blockedByHitboxByRarity[r]) blockedByHitboxByRarity[r] = [];
            blockedByHitboxByRarity[r].push(p);
          }
          
          // Grouper les Pokémon BLOQUÉS PAR CONDITIONS par rareté
          const blockedByConditionsByRarity = {};
          for (const p of blockedByConditionsList) {
            const r = p.rarity || 'unknown';
            if (!blockedByConditionsByRarity[r]) blockedByConditionsByRarity[r] = [];
            blockedByConditionsByRarity[r].push(p);
          }
          
          // NOUVEAU: Compter les Pokémon NON ultra-rare (communs/uncommons/rare) qui passent
          // C'est eux qui "gaspillent" le PokéSnack!
          const nonUltraRareCount = passingList.filter(p => 
            p.rarity !== 'ultra-rare'
          ).length;
          const ultraRareCount = passingList.filter(p => 
            p.rarity === 'ultra-rare'
          ).length;
          
          // Compter les concurrents de même rareté qui seraient bloqués (hitbox OU conditions)
          const sameRarityBlocked = data.competitors.filter(comp => {
            const compInList = data.allRaritiesList.find(p => p.id === comp.id);
            return compInList?.blockedByHitbox || compInList?.blockedByConditions;
          });
          
          // Compteur effectif avec plafond et conditions = concurrents même rareté moins ceux bloqués
          const effectiveCompetitors = data.pokemonWithThisEv - sameRarityBlocked.length;
          const efficiencyWithHitbox = Math.round((1 / Math.max(1, effectiveCompetitors)) * 100);
          
          // Compter effectif toutes raretés avec plafond ET conditions
          const effectiveAllRarities = data.allRaritiesCount - blockedList.length;
          
          evEfficiency.push({
            category: 'ev',
            stat,
            statName: evToBerry[stat].stat,
            berry: evToBerry[stat].berry,
            icon: evToBerry[stat].icon,
            targetCount: data.targetCount,
            targetValue: data.targetValue,
            pokemonWithThisEv: data.pokemonWithThisEv,
            competing: data.pokemonWithThisEv - 1,
            eliminatedCount: data.eliminated.length,
            eliminated: data.eliminated.slice(0, 15), // Concurrents éliminés (max 15)
            // Infos toutes raretés - AVEC filtrage hitbox ET conditions
            allRaritiesCount: data.allRaritiesCount,
            allRaritiesCountEffective: effectiveAllRarities, // Après filtrage plafond + conditions
            allRaritiesByRarity: byRarity, // Seulement ceux qui PASSENT
            allRaritiesList: passingList.slice(0, 20),
            // NOUVEAU: Comptage par catégorie de rareté (pour optimiser consommation PokéSnack)
            nonUltraRareCount: nonUltraRareCount, // Communs/uncommons/rare = GASPILLAGE
            ultraRareCount: ultraRareCount, // Ultra-rare = CE QU'ON VEUT
            // Pokémon BLOQUÉS par le plafond
            blockedByHitboxCount: blockedByHitboxList.length,
            blockedByHitboxList: blockedByHitboxList.slice(0, 20),
            // NOUVEAU: Pokémon BLOQUÉS par les conditions optimales (Y level, Sky)
            blockedByConditionsCount: blockedByConditionsList.length,
            blockedByConditionsList: blockedByConditionsList.slice(0, 20),
            // Total bloqués (hitbox + conditions)
            totalBlockedCount: blockedList.length,
            blockedByHitboxByRarity: blockedByHitboxByRarity,
            blockedByConditionsByRarity: blockedByConditionsByRarity,
            sameRarityBlockedCount: sameRarityBlocked.length,
            // Efficacité avec hitbox et conditions
            effectiveCompetitors: effectiveCompetitors,
            efficiencyWithHitbox: efficiencyWithHitbox,
            hitboxAdvantage: blockedByHitboxList.length > 0,
            conditionsAdvantage: blockedByConditionsList.length > 0,
            targetHitboxHeight: targetHitboxHeight,
            // Avertissement zone générique
            warningGenericZone: data.warningGenericZone || false,
            warningMessage: data.warningMessage || null,
            efficiency,
            mechanic: 'boost50',
            recommendation: efficiency >= 50 ? 'excellent' : efficiency >= 25 ? 'bon' : 'faible',
            recommendationWithHitbox: efficiencyWithHitbox >= 50 ? 'excellent' : efficiencyWithHitbox >= 25 ? 'bon' : 'faible',
            competitors: data.competitors.slice(0, 15), // Concurrents qui restent (max 15)
          });
        }
      }
      // Trier par: 1) MOINS de non-ultra-rare = moins de gaspillage, 2) efficacité
      // Le meilleur combo est celui qui attire le MOINS de communs/uncommons/rare
      // car ils consomment le PokéSnack sans donner ce qu'on veut (ultra-rare)
      evEfficiency.sort((a, b) => {
        // PRIORITÉ 1: Minimiser les Pokémon NON ultra-rare (communs/uncommons/rare)
        // Ce sont eux qui "gaspillent" le PokéSnack!
        if (a.nonUltraRareCount !== b.nonUltraRareCount) {
          return a.nonUltraRareCount - b.nonUltraRareCount;
        }
        // PRIORITÉ 2: À égalité de gaspillage, préférer meilleure efficacité avec hitbox
        if (a.efficiencyWithHitbox !== b.efficiencyWithHitbox) {
          return b.efficiencyWithHitbox - a.efficiencyWithHitbox;
        }
        // PRIORITÉ 3: À efficacité égale, préférer celui avec plus d'ultra-rare attirés
        if (a.ultraRareCount !== b.ultraRareCount) {
          return b.ultraRareCount - a.ultraRareCount;
        }
        // Puis par efficacité brute
        return b.efficiency - a.efficiency;
      });

      // ========== CALCUL DES COMBOS OPTIMAUX (3 slots) ==========
      const combos = [];
      
      // Baies spéciales et leur effet sur le tier de rareté
      const specialBerries = {
        golden_apple: { id: 'golden_apple', name: 'Golden Apple', icon: '🍎', tierBonus: 1, effect: 'Rareté +1' },
        enchanted_apple: { id: 'enchanted_apple', name: 'Enchanted Golden Apple', icon: '✨', tierBonus: 3, effect: 'Rareté +3' },
        starf: { id: 'starf', name: 'Starf Berry', icon: '⭐', tierBonus: 0, effect: 'Shiny x3' },
        apple: { id: 'apple', name: 'Apple/Sitrus', icon: '🍏', tierBonus: 0, effect: '-100% morsure' },
      };

      // Fonction pour calculer le tier de rareté d'un combo
      const calculateTier = (combo) => {
        let tier = 0;
        for (const slot of combo.slots) {
          if (slot.type === 'special' && slot.data?.tierBonus) {
            tier += slot.data.tierBonus;
          }
        }
        // Clamp aux tiers disponibles (max tier 5 avec Enchanted + 3 Golden)
        return Math.min(5, Math.max(0, tier));
      };

      // Fonction pour calculer l'efficacité d'un combo
      // Efficacité = Chance rareté × Chance cible dans rareté
      const calculateComboEfficiency = (combo) => {
        const tier = calculateTier(combo);
        const rarityChance = getRarityOdds(tier, primaryRarity) / 100;
        
        const hasEv = combo.ev !== null;
        const typeSlots = combo.typeSlots || [];
        
        let targetChanceInRarity;
        
        if (hasEv && typeSlots.length > 0) {
          // ========== EV + TYPE COMBO ==========
          // EV donne x1.5 (boost 50%), Type donne x10
          // Les deux multiplicateurs s'appliquent au même Pokémon
          const evPokemonCount = combo.ev.pokemonWithThisEv;
          
          const typeMultipliers = {};
          for (const t of typeSlots) {
            typeMultipliers[t.type] = (typeMultipliers[t.type] || 0) + 10;
          }
          
          const typesUsed = Object.keys(typeMultipliers);
          const typeBoost = typeMultipliers[typesUsed[0]] || 10;
          const evBoost = 1.5;
          
          // La cible a: typeBoost * evBoost = 15 de poids
          // Concurrents avec EV mais pas type: evBoost (1.5) chacun
          // Concurrents avec type mais pas EV: typeBoost (10) chacun
          // Concurrents sans ni l'un ni l'autre: 1 chacun
          
          const typeData = typeSlots[0];
          const typeRatioInZone = (typeData.sameType + 1) / totalInRarity;
          const estimatedSameTypeInEv = Math.max(0, Math.round((evPokemonCount - 1) * typeRatioInZone));
          const onlyEvCount = evPokemonCount - 1 - estimatedSameTypeInEv;
          const onlyTypeCount = Math.max(0, typeData.sameType - estimatedSameTypeInEv);
          const neitherCount = Math.max(0, totalInRarity - evPokemonCount - onlyTypeCount);
          
          // Poids total
          const targetWeight = typeBoost * evBoost; // 15
          const bothEvAndTypeWeight = estimatedSameTypeInEv * typeBoost * evBoost;
          const onlyEvWeight = onlyEvCount * evBoost;
          const onlyTypeWeight = onlyTypeCount * typeBoost;
          const neitherWeight = neitherCount * 1;
          
          const totalWeight = targetWeight + bothEvAndTypeWeight + onlyEvWeight + onlyTypeWeight + neitherWeight;
          targetChanceInRarity = targetWeight / totalWeight;
          
        } else if (hasEv) {
          // ========== EV SEUL ou 2× EV ==========
          // Compter combien de slots EV dans le combo
          const evSlotsCount = combo.slots.filter(s => s.type === 'ev').length;
          
          if (evSlotsCount >= 2) {
            // 2× même baie EV = 100% isolation sur les Pokémon avec cet EV
            // Seuls les concurrents ayant cet EV restent (isolation garantie)
            const evCompetitors = combo.ev.pokemonWithThisEv;
            targetChanceInRarity = 1 / evCompetitors;
          } else {
            // 1× baie EV = 50% de chances (boost x1.5)
            // Formule: 1.5 / (1.5 + (pokemonWithThisEv - 1))
            const evCompetitors = combo.ev.pokemonWithThisEv;
            targetChanceInRarity = 1.5 / (1.5 + (evCompetitors - 1));
          }
          
        } else if (typeSlots.length > 0) {
          // ========== TYPES SEULS (multiplicateurs) ==========
          const typeMultipliers = {};
          for (const t of typeSlots) {
            typeMultipliers[t.type] = (typeMultipliers[t.type] || 0) + 10;
          }
          
          const typesUsed = Object.keys(typeMultipliers);
          
          if (typesUsed.length === 1) {
            const theType = typesUsed[0];
            const multiplier = typeMultipliers[theType];
            const typeData = typeSlots.find(t => t.type === theType);
            const sameTypeCompetitors = typeData.sameType;
            const otherCompetitors = totalInRarity - 1 - sameTypeCompetitors;
            const totalWeight = multiplier + (sameTypeCompetitors * multiplier) + otherCompetitors;
            targetChanceInRarity = multiplier / totalWeight;
          } else {
            // Deux types différents
            const targetMaxMult = Math.max(...typesUsed.map(t => {
              const td = typeSlots.find(ts => ts.type === t);
              return td && td.targetCount > 0 ? typeMultipliers[t] : 0;
            }));
            const targetWeight = targetMaxMult > 0 ? targetMaxMult : 1;
            let boostedCompetitors = 0;
            for (const t of typeSlots) {
              boostedCompetitors += t.sameType;
            }
            boostedCompetitors = Math.min(boostedCompetitors, totalInRarity - 1);
            const unboosted = totalInRarity - 1 - boostedCompetitors;
            const avgMult = (typeMultipliers[typesUsed[0]] + typeMultipliers[typesUsed[1]]) / 2;
            const totalWeight = targetWeight + (boostedCompetitors * avgMult) + unboosted;
            targetChanceInRarity = targetWeight / totalWeight;
          }
        } else {
          // ========== AUCUN CIBLAGE ==========
          targetChanceInRarity = 1 / totalInRarity;
        }
        
        // Efficacité finale = chance rareté × chance cible
        const finalEfficiency = rarityChance * targetChanceInRarity * 100;
        
        return {
          efficiency: Math.round(finalEfficiency * 100) / 100,
          tier,
          rarityChance: Math.round(rarityChance * 1000) / 10,
          targetChance: Math.round(targetChanceInRarity * 1000) / 10,
        };
      };

      // Choisir la pomme selon la préférence
      // Mode Golden: seulement Golden Apple (tier 1)
      // Mode Enchanted: Golden + Enchanted (tier 4)
      const useEnchanted = appleType.value === 'enchanted';
      const goldenApple = specialBerries.golden_apple;
      const enchantedApple = specialBerries.enchanted_apple;
      
      // En mode Enchanted: tier total = 1 + 3 = 4
      // En mode Golden: tier total = 1
      const maxAppleTier = useEnchanted ? 4 : 1;

      // Générer les combos possibles
      // 1. EV + Pommes (boost x1.5 sur la cible)
      for (const ev of evEfficiency) {
        const evIsVeryEfficient = ev.efficiency >= 50; // 50%+ = 2 concurrents ou moins
        
        if (useEnchanted) {
          // Mode Enchanted: EV + Golden + Enchanted (tier 4)
          combos.push({
            name: `${ev.berry} + 🍎 Golden + ✨ Enchanted`,
            slots: [
              { type: 'ev', data: ev, icon: ev.icon, name: ev.berry },
              { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
              { type: 'special', data: enchantedApple, icon: '✨', name: 'Enchanted Apple' },
            ],
            ev: ev,
            typeSlots: [],
            mechanic: `boost x1.5 + tier 4`,
          });
        } else {
          // Mode Golden: EV + Golden seule (tier 1)
          combos.push({
            name: `${ev.berry} + 🍎 Golden Apple`,
            slots: [
              { type: 'ev', data: ev, icon: ev.icon, name: ev.berry },
              { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
            ],
            ev: ev,
            typeSlots: [],
            mechanic: `boost x1.5 + tier 1`,
          });
        }
        
        // EV + Pomme + Starf (pour shiny si EV est très efficace)
        if (evIsVeryEfficient) {
          combos.push({
            name: `${ev.berry} + 🍎 Golden + ⭐ Starf`,
            slots: [
              { type: 'ev', data: ev, icon: ev.icon, name: ev.berry },
              { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
              { type: 'special', data: specialBerries.starf, icon: '⭐', name: 'Starf' },
            ],
            ev: ev,
            typeSlots: [],
            mechanic: `boost x1.5 + tier 1 + shiny x5`,
            shinyBoost: true,
          });
        }

        // EV + Pomme + Type - Toujours utile car EV ne filtre plus à 100%
        for (const typeEff of typeEfficiency) {
          combos.push({
            name: `${ev.berry} + 🍎 Golden + ${typeEff.berry}`,
            slots: [
              { type: 'ev', data: ev, icon: ev.icon, name: ev.berry },
              { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
              { type: 'type', data: typeEff, icon: typeEff.icon, name: typeEff.berry },
            ],
            ev: ev,
            typeSlots: [typeEff],
            mechanic: `boost x1.5 + tier 1 + x10`,
          });
          
          // EV + Type + Type (double le type, pas de pomme) - seulement si EV pas suffisant
          if (!evIsVeryEfficient) {
            combos.push({
              name: `${ev.berry} + 2× ${typeEff.berry}`,
              slots: [
                { type: 'ev', data: ev, icon: ev.icon, name: ev.berry },
                { type: 'type', data: typeEff, icon: typeEff.icon, name: typeEff.berry },
                { type: 'type', data: typeEff, icon: typeEff.icon, name: typeEff.berry },
              ],
              ev: ev,
              typeSlots: [typeEff, typeEff],
              mechanic: 'boost x1.5 + x20 (tier 0)',
            });
          }
        }
        
        // 2× même baie EV + Pomme = 100% isolation sur cet EV
        combos.push({
          name: `2× ${ev.berry} + 🍎 Golden`,
          slots: [
            { type: 'ev', data: ev, icon: ev.icon, name: ev.berry },
            { type: 'ev', data: ev, icon: ev.icon, name: ev.berry },
            { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
          ],
          ev: ev,
          typeSlots: [],
          mechanic: lang.value === 'fr' ? '100% isolation EV + tier 1' : '100% EV isolation + tier 1',
          fullEvIsolation: true, // Marquer comme isolation complète
        });
      }

      // 2. Types + Pommes
      for (const typeEff of typeEfficiency) {
        // 2× même type + Pomme (x20 + tier) - Seules les baies type peuvent être doublées!
        combos.push({
          name: `2× ${typeEff.berry} + 🍎 Golden`,
          slots: [
            { type: 'type', data: typeEff, icon: typeEff.icon, name: typeEff.berry },
            { type: 'type', data: typeEff, icon: typeEff.icon, name: typeEff.berry },
            { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
          ],
          ev: null,
          typeSlots: [typeEff, typeEff],
          mechanic: `x20 ${typeEff.type} + tier 1`,
        });

        if (useEnchanted) {
          // Mode Enchanted: 1× type + Golden + Enchanted (x10 + tier 4)
          combos.push({
            name: `${typeEff.berry} + 🍎 Golden + ✨ Enchanted`,
            slots: [
              { type: 'type', data: typeEff, icon: typeEff.icon, name: typeEff.berry },
              { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
              { type: 'special', data: enchantedApple, icon: '✨', name: 'Enchanted Apple' },
            ],
            ev: null,
            typeSlots: [typeEff],
            mechanic: `x10 ${typeEff.type} + tier 4`,
          });
        }
      }

      // 3. Deux types différents + Pomme
      if (typeEfficiency.length >= 2) {
        combos.push({
          name: `${typeEfficiency[0].berry} + ${typeEfficiency[1].berry} + 🍎 Golden`,
          slots: [
            { type: 'type', data: typeEfficiency[0], icon: typeEfficiency[0].icon, name: typeEfficiency[0].berry },
            { type: 'type', data: typeEfficiency[1], icon: typeEfficiency[1].icon, name: typeEfficiency[1].berry },
            { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
          ],
          ev: null,
          typeSlots: [typeEfficiency[0], typeEfficiency[1]],
          mechanic: `x10+x10 diff + tier 1`,
        });
      }

      // 4. Pure rareté
      if (useEnchanted) {
        // Mode Enchanted: Golden + Enchanted (tier 4)
        combos.push({
          name: `🍎 Golden + ✨ Enchanted`,
          slots: [
            { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
            { type: 'special', data: enchantedApple, icon: '✨', name: 'Enchanted Apple' },
          ],
          ev: null,
          typeSlots: [],
          mechanic: `tier 4 pur`,
        });
      } else {
        // Mode Golden: juste Golden Apple (tier 1)
        combos.push({
          name: `🍎 Golden Apple seule`,
          slots: [
            { type: 'special', data: goldenApple, icon: '🍎', name: 'Golden Apple' },
          ],
          ev: null,
          typeSlots: [],
          mechanic: `tier 1 pur`,
        });
      }

      // Calculer l'efficacité de chaque combo
      for (const combo of combos) {
        const result = calculateComboEfficiency(combo);
        combo.efficiency = result.efficiency;
        combo.tier = result.tier;
        combo.rarityChance = result.rarityChance;
        combo.targetChance = result.targetChance;
        
        // NOUVEAU: Calculer l'efficacité avec hitbox pour les combos EV
        if (combo.ev) {
          combo.efficiencyWithHitbox = combo.ev.efficiencyWithHitbox || combo.efficiency;
          combo.blockedByHitbox = combo.ev.blockedByHitbox || 0;
          combo.hitboxAdvantage = combo.ev.hitboxAdvantage || false;
          combo.nonUltraRareCount = combo.ev.nonUltraRareCount || 0;
          combo.ultraRareCount = combo.ev.ultraRareCount || 0;
        }
      }

      // Trier par: MOINS de non-ultra-rare = moins de gaspillage de PokéSnack
      // Le meilleur combo minimise les communs/uncommons/rare qui "volent" les spawns
      combos.sort((a, b) => {
        // PRIORITÉ 0: Préférer les combos avec 100% isolation EV (2× baie EV)
        // Car l'isolation garantit que SEULS les Pokémon avec cet EV peuvent mordre
        if (a.fullEvIsolation && !b.fullEvIsolation) {
          // Si le combo a peu de concurrents EV (≤3), c'est clairement meilleur
          const aEvCount = a.ev?.pokemonWithThisEv ?? 999;
          if (aEvCount <= 3) return -1;
        }
        if (!a.fullEvIsolation && b.fullEvIsolation) {
          const bEvCount = b.ev?.pokemonWithThisEv ?? 999;
          if (bEvCount <= 3) return 1;
        }
        
        // PRIORITÉ 1: Combos EV avec le MOINS de non-ultra-rare (gaspillage)
        if (a.ev && b.ev) {
          const aNonUR = a.ev.nonUltraRareCount ?? 999;
          const bNonUR = b.ev.nonUltraRareCount ?? 999;
          if (aNonUR !== bNonUR) return aNonUR - bNonUR;
          
          // À égalité, préférer l'isolation complète
          if (a.fullEvIsolation && !b.fullEvIsolation) return -1;
          if (!a.fullEvIsolation && b.fullEvIsolation) return 1;
          
          // À égalité, préférer celui avec meilleure efficacité hitbox
          const aEffHitbox = a.ev.efficiencyWithHitbox || a.efficiency;
          const bEffHitbox = b.ev.efficiencyWithHitbox || b.efficiency;
          if (aEffHitbox !== bEffHitbox) return bEffHitbox - aEffHitbox;
          
          // Puis celui avec plus d'ultra-rare attirés
          const aUR = a.ev.ultraRareCount ?? 0;
          const bUR = b.ev.ultraRareCount ?? 0;
          if (aUR !== bUR) return bUR - aUR;
        }
        
        // PRIORITÉ 2: Préférer les combos avec EV vs sans EV
        if (a.ev && !b.ev) return -1;
        if (!a.ev && b.ev) return 1;
        
        // PRIORITÉ 3: Efficacité brute
        return b.efficiency - a.efficiency;
      });

      // Prendre les 6 meilleurs combos
      const bestCombos = combos.slice(0, 6);
      const bestCombo = bestCombos.length > 0 ? bestCombos[0] : null;

      // ========== 🛠️ GUIDE DE CONSTRUCTION DE PLATEFORME ==========
      // Compiler toutes les recommandations pour construire la plateforme optimale
      const platformGuide = {
        // 📍 Localisation
        location: {
          biome: bestZone?.biomes?.[0] || [...targetConditions.biomes][0] || 'Non spécifié',
          biomeName: bestZone?.name || 'Zone par défaut',
          structures: [],
          dimensions: [],
          yLevel: null,
        },
        // 🧱 Blocs
        blocks: {
          base: [], // Blocs sur lesquels poser le PokéSnack
          nearby: [], // Blocs à placer à proximité
          avoid: [], // Blocs à éviter
        },
        // ☀️ Conditions environnementales
        environment: {
          canSeeSky: null,
          skyLight: null,
          blockLight: null,
          weather: null,
          moonPhase: null,
          time: null,
          fluid: null,
        },
        // 🎣 Conditions spéciales
        special: {
          lure: null,
          rodType: null,
          bait: null,
          keyItem: null,
          isSlimeChunk: null,
        },
        // 💡 Conseils de construction
        tips: [],
      };

      // Analyser toutes les zones pour compiler les requirements
      for (const zone of zoneAnalysis) {
        // Structures
        if (zone.structures?.length) {
          for (const s of zone.structures) {
            if (!platformGuide.location.structures.includes(s)) {
              platformGuide.location.structures.push(s);
            }
          }
        }
        // Dimensions
        if (zone.dimensions?.length) {
          for (const d of zone.dimensions) {
            if (!platformGuide.location.dimensions.includes(d)) {
              platformGuide.location.dimensions.push(d);
            }
          }
        }
        // Y Level
        if (zone.yLevel) {
          if (!platformGuide.location.yLevel) {
            platformGuide.location.yLevel = { minY: zone.yLevel.minY, maxY: zone.yLevel.maxY };
          } else {
            if (zone.yLevel.minY !== undefined && (platformGuide.location.yLevel.minY === undefined || zone.yLevel.minY > platformGuide.location.yLevel.minY)) {
              platformGuide.location.yLevel.minY = zone.yLevel.minY;
            }
            if (zone.yLevel.maxY !== undefined && (platformGuide.location.yLevel.maxY === undefined || zone.yLevel.maxY < platformGuide.location.yLevel.maxY)) {
              platformGuide.location.yLevel.maxY = zone.yLevel.maxY;
            }
          }
        }
        // Base blocks
        if (zone.baseBlocks?.selectors?.length) {
          for (const b of zone.baseBlocks.selectors) {
            if (!platformGuide.blocks.base.some(x => x.tag === b)) {
              platformGuide.blocks.base.push({ 
                tag: b, 
                resolved: zone.baseBlocks.resolved || [],
                zone: zone.name 
              });
            }
          }
        }
        // Nearby blocks
        if (zone.nearbyBlocks?.selectors?.length) {
          for (const b of zone.nearbyBlocks.selectors) {
            if (!platformGuide.blocks.nearby.some(x => x.tag === b)) {
              platformGuide.blocks.nearby.push({ 
                tag: b, 
                resolved: zone.nearbyBlocks.resolved || [],
                zone: zone.name 
              });
            }
          }
        }
        // Exclude nearby blocks
        if (zone.excludeNearbyBlocks?.selectors?.length || zone.excludeNearbyBlocks?.length) {
          const excludeList = zone.excludeNearbyBlocks.selectors || zone.excludeNearbyBlocks;
          for (const b of excludeList) {
            if (!platformGuide.blocks.avoid.includes(b)) {
              platformGuide.blocks.avoid.push(b);
            }
          }
        }
        // Sky conditions
        if (zone.sky?.canSeeSky !== undefined && platformGuide.environment.canSeeSky === null) {
          platformGuide.environment.canSeeSky = zone.sky.canSeeSky;
        }
        if (zone.sky?.minSkyLight !== undefined || zone.sky?.maxSkyLight !== undefined) {
          platformGuide.environment.skyLight = {
            min: zone.sky.minSkyLight ?? 0,
            max: zone.sky.maxSkyLight ?? 15,
          };
        }
        // Block light
        if (zone.light) {
          platformGuide.environment.blockLight = {
            min: zone.light.minLight ?? 0,
            max: zone.light.maxLight ?? 15,
          };
        }
        // Weather
        if (zone.weather) {
          if (zone.weather.isThundering) platformGuide.environment.weather = 'thunder';
          else if (zone.weather.isRaining) platformGuide.environment.weather = 'rain';
        }
        // Moon phase
        if (zone.moonPhase !== undefined) {
          platformGuide.environment.moonPhase = zone.moonPhase;
        }
        // Time
        if (zone.times?.length) {
          platformGuide.environment.time = zone.times;
        }
        // Fluid
        if (zone.fluid) {
          platformGuide.environment.fluid = zone.fluid;
        }
        // Lure
        if (zone.lure) {
          platformGuide.special.lure = zone.lure;
        }
        // Rod type
        if (zone.rodType) {
          platformGuide.special.rodType = zone.rodType;
        }
        // Bait
        if (zone.bait) {
          platformGuide.special.bait = zone.bait;
        }
        // Key item
        if (zone.keyItem) {
          platformGuide.special.keyItem = zone.keyItem;
        }
        // Slime chunk
        if (zone.isSlimeChunk) {
          platformGuide.special.isSlimeChunk = true;
        }
      }

      // Générer les conseils de construction
      if (platformGuide.blocks.base.length > 0) {
        platformGuide.tips.push({
          icon: '🧱',
          title: 'Blocs de base requis',
          text: `Construisez votre plateforme avec : ${platformGuide.blocks.base.map(b => b.tag).join(', ')}`,
          priority: 'required',
        });
      }
      if (platformGuide.blocks.nearby.length > 0) {
        platformGuide.tips.push({
          icon: '📍',
          title: 'Blocs à proximité requis',
          text: `Placez ces blocs près du PokéSnack : ${platformGuide.blocks.nearby.map(b => b.tag).join(', ')}`,
          priority: 'required',
        });
      }
      if (platformGuide.blocks.avoid.length > 0) {
        platformGuide.tips.push({
          icon: '🚫',
          title: 'Blocs à éviter',
          text: `Ne placez PAS ces blocs à proximité : ${platformGuide.blocks.avoid.join(', ')}`,
          priority: 'warning',
        });
      }
      if (platformGuide.environment.canSeeSky !== null) {
        platformGuide.tips.push({
          icon: platformGuide.environment.canSeeSky ? '☀️' : '🏚️',
          title: platformGuide.environment.canSeeSky ? 'Ciel visible requis' : 'Zone couverte requise',
          text: platformGuide.environment.canSeeSky 
            ? 'La plateforme doit être en extérieur avec vue directe sur le ciel'
            : 'La plateforme doit être sous terre ou sous un toit (pas de vue sur le ciel)',
          priority: 'required',
        });
      }
      if (platformGuide.environment.skyLight) {
        const { min, max } = platformGuide.environment.skyLight;
        if (min > 0 || max < 15) {
          platformGuide.tips.push({
            icon: '☀️',
            title: 'Luminosité du ciel',
            text: `Lumière du ciel requise : ${min}-${max}`,
            priority: 'important',
          });
        }
      }
      if (platformGuide.environment.blockLight) {
        const { min, max } = platformGuide.environment.blockLight;
        platformGuide.tips.push({
          icon: '💡',
          title: 'Luminosité des blocs',
          text: max <= 7 
            ? `Zone sombre requise (lumière ${min}-${max}) - N'ajoutez pas de torches !`
            : `Lumière des blocs requise : ${min}-${max}`,
          priority: max <= 7 ? 'warning' : 'info',
        });
      }
      if (platformGuide.location.yLevel) {
        const { minY, maxY } = platformGuide.location.yLevel;
        if (minY !== undefined || maxY !== undefined) {
          platformGuide.tips.push({
            icon: '📏',
            title: 'Altitude (Y)',
            text: `Construisez entre Y=${minY ?? '-∞'} et Y=${maxY ?? '+∞'}`,
            priority: 'required',
          });
        }
      }
      if (platformGuide.location.structures.length > 0) {
        platformGuide.tips.push({
          icon: '🏛️',
          title: 'Structure requise',
          text: `Doit être dans : ${platformGuide.location.structures.join(', ')}`,
          priority: 'required',
        });
      }
      if (platformGuide.environment.weather) {
        platformGuide.tips.push({
          icon: platformGuide.environment.weather === 'thunder' ? '⛈️' : '🌧️',
          title: platformGuide.environment.weather === 'thunder' ? 'Orage requis' : 'Pluie requise',
          text: platformGuide.environment.weather === 'thunder'
            ? 'Attendez un orage pour utiliser le PokéSnack'
            : 'Attendez la pluie pour utiliser le PokéSnack',
          priority: 'important',
        });
      }
      if (platformGuide.environment.moonPhase !== null) {
        const moonNames = ['🌕 Pleine', '🌖 Gibbeuse décr.', '🌗 Dernier quartier', '🌘 Croissant décr.', '🌑 Nouvelle', '🌒 Croissant crois.', '🌓 Premier quartier', '🌔 Gibbeuse crois.'];
        platformGuide.tips.push({
          icon: '🌙',
          title: 'Phase lunaire requise',
          text: `Attendez la ${moonNames[platformGuide.environment.moonPhase] || 'phase ' + platformGuide.environment.moonPhase}`,
          priority: 'important',
        });
      }
      if (platformGuide.environment.time?.length) {
        const timeLabels = { day: '☀️ Jour', night: '🌙 Nuit', dawn: '🌅 Aube', dusk: '🌇 Crépuscule' };
        platformGuide.tips.push({
          icon: '⏰',
          title: 'Horaire optimal',
          text: `Utilisez le PokéSnack pendant : ${platformGuide.environment.time.map(t => timeLabels[t] || t).join(', ')}`,
          priority: 'important',
        });
      }
      if (platformGuide.special.keyItem) {
        platformGuide.tips.push({
          icon: '🔑',
          title: 'Item clé requis',
          text: `Vous devez posséder : ${platformGuide.special.keyItem}`,
          priority: 'required',
        });
      }
      if (platformGuide.special.isSlimeChunk) {
        platformGuide.tips.push({
          icon: '🟢',
          title: 'Chunk Slime requis',
          text: 'La plateforme doit être dans un chunk à slime (utilisez /seed ou un mod pour le trouver)',
          priority: 'required',
        });
      }
      
      // ========== ANALYSE HITBOX - Hauteur de spawn ==========
      // Hitbox null = 1x1 par défaut
      // Règle: si hauteur est un entier > 1, il faut ajouter 1 bloc d'espace
      const monHitbox = fullMon.hitbox || { width: 1, height: 1, fixed: false, isDefault: true };
      const monH = monHitbox.height;
      const monTargetHeight = monH <= 1 ? 1 : (Number.isInteger(monH) ? monH + 1 : Math.ceil(monH));
      
      // Compter combien de concurrents ont besoin de PLUS d'espace
      const competitorsNeedingMoreSpace = allCompetingPokemon.filter(comp => {
        const cH = comp.hitbox?.height || 1;
        const compHeight = cH <= 1 ? 1 : (Number.isInteger(cH) ? cH + 1 : Math.ceil(cH));
        return compHeight > monTargetHeight;
      }).length;
      
      // Trouver la hauteur optimale de plafond
      const optimalCeilingHeight = monTargetHeight;
      const competitorsBlockedByCeiling = competitorsNeedingMoreSpace;
      
      // Toujours afficher le conseil de hauteur
      if (monTargetHeight <= 1) {
        // Peut spawn dans 1 bloc de haut - AVANTAGE!
        platformGuide.tips.push({
          icon: '📦',
          title: 'Plafond optimal: 1 bloc',
          text: competitorsBlockedByCeiling > 0 
            ? `${mon.name} peut spawner sous 1 bloc! Construisez avec un plafond à 1 bloc pour BLOQUER ${competitorsBlockedByCeiling} concurrent${competitorsBlockedByCeiling > 1 ? 's' : ''} plus grands.`
            : `${mon.name} peut spawner sous 1 bloc. Tous les concurrents ont aussi une petite hitbox.`,
          priority: competitorsBlockedByCeiling > 0 ? 'important' : 'info',
        });
      } else if (monTargetHeight === 2) {
        platformGuide.tips.push({
          icon: '📦',
          title: 'Plafond optimal: 2 blocs',
          text: competitorsBlockedByCeiling > 0 
            ? `${mon.name} a besoin de 2 blocs. Un plafond à 2 blocs bloquerait ${competitorsBlockedByCeiling} concurrent${competitorsBlockedByCeiling > 1 ? 's' : ''} plus grands.`
            : `${mon.name} a besoin de 2 blocs. Peu de concurrents seront bloqués par cette hauteur.`,
          priority: competitorsBlockedByCeiling > 3 ? 'important' : 'info',
        });
      } else {
        platformGuide.tips.push({
          icon: '📦',
          title: `Plafond optimal: ${monTargetHeight} blocs`,
          text: `${mon.name} a besoin de ${monTargetHeight} blocs minimum. ${competitorsBlockedByCeiling > 0 ? `Un plafond bloquerait ${competitorsBlockedByCeiling} concurrent${competitorsBlockedByCeiling > 1 ? 's' : ''}.` : 'Un plafond ne filtrera pas de concurrents.'}`,
          priority: competitorsBlockedByCeiling > 5 ? 'important' : 'info',
        });
      }
      
      // Ajouter la recommandation de hauteur aux optimalConditions
      if (conditionAnalysis.hitbox.length > 0) {
        optimalConditions.hitbox = conditionAnalysis.hitbox[0];
      }

      return {
        biomes: [...targetConditions.biomes],
        presets: [...targetConditions.presets],
        contexts: [...targetConditions.contexts],
        rarities: [...targetConditions.rarities],
        primaryRarity,
        competingCount: competingInSameRarity.length,
        totalInZone: allCompetingPokemon.length,
        competingPokemon: competingInSameRarity.slice(0, 30),
        typeEfficiency,
        evEfficiency,
        bestCombos,
        bestCombo,
        zoneAnalysis,
        bestZone,
        conditionAnalysis,
        optimalConditions,
        platformGuide,
        loading: loadingAnalysis.value,
      };
    });

    const filteredData = computed(() => {
      const query = searchQuery.value.toLowerCase().trim();
      const cat = selectedCategory.value;

      let result = {};

      if (cat === "all") {
        result = { ...baitData.value };
      } else {
        result = { [cat]: baitData.value[cat] };
      }

      if (query) {
        const filtered = {};
        for (const [key, category] of Object.entries(result)) {
          const matchingItems = category.items.filter(
            item =>
              item.berry.toLowerCase().includes(query) ||
              item.effect.toLowerCase().includes(query)
          );
          if (matchingItems.length > 0) {
            filtered[key] = { ...category, items: matchingItems };
          }
        }
        return filtered;
      }

      return result;
    });

    const totalItems = computed(() => {
      return Object.values(filteredData.value).reduce(
        (sum, cat) => sum + cat.items.length,
        0
      );
    });

    return {
      searchQuery,
      selectedCategory,
      categories,
      filteredData,
      totalItems,
      searchMode,
      appleType,
      pokemonSearchQuery,
      pokemonResults,
      selectedPokemon,
      fullPokemonData,
      loadingPokemon,
      loadingAnalysis,
      selectPokemon,
      clearPokemon,
      pokemonRecommendations,
      spawnAnalysis,
      tName,
      tType,
      tEggGroup,
      tStat,
      sprite,
      getTypeClass,
      formatTime,
      t,
      lang,
      tBerry,
      tSnackUI,
    };
  },
  template: `
    <section class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-[var(--text)] mb-2">🍬 {{ lang === 'fr' ? 'Guide PokéSnack' : 'PokéSnack Guide' }}</h2>
        <p class="text-[var(--text-muted)] max-w-2xl mx-auto">
          {{ lang === 'fr' ? 'Trouvez quelle baie utiliser pour attirer le Pokémon que vous recherchez.' : 'Find which berry to use to attract the Pokémon you are looking for.' }}
        </p>
        <p class="text-amber-500 text-sm mt-3 max-w-2xl mx-auto bg-amber-500/10 rounded-lg px-4 py-2">
          {{ tSnackUI('snack.disclaimer') }}
        </p>
      </div>

      <!-- Mode Toggle -->
      <div class="flex justify-center mb-6">
        <div class="inline-flex rounded-xl bg-[var(--surface)] p-1 border border-[var(--border)]">
          <button 
            @click="searchMode = 'pokemon'" 
            class="px-4 py-2 rounded-lg font-medium transition-all"
            :class="searchMode === 'pokemon' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)]'"
          >
            🔍 {{ lang === 'fr' ? 'Chercher un Pokémon' : 'Search a Pokémon' }}
          </button>
          <button 
            @click="searchMode = 'baits'" 
            class="px-4 py-2 rounded-lg font-medium transition-all"
            :class="searchMode === 'baits' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)]'"
          >
            📋 {{ lang === 'fr' ? 'Parcourir les Baies' : 'Browse Berries' }}
          </button>
        </div>
      </div>

      <!-- ===== MODE POKEMON ===== -->
      <template v-if="searchMode === 'pokemon'">
        <!-- Recherche Pokémon -->
        <div class="glass-card rounded-2xl p-4 md:p-6">
          <div class="relative max-w-lg mx-auto">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              v-model="pokemonSearchQuery"
              type="search"
              :placeholder="t('search.pokemon.type')"
              class="search-input pl-10"
            />
            
            <!-- Résultats de recherche -->
            <div v-if="pokemonResults.length > 0" class="absolute z-20 w-full mt-2 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xl max-h-64 overflow-y-auto">
              <button
                v-for="p in pokemonResults"
                :key="p.id"
                @click="selectPokemon(p)"
                class="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--surface-hover)] transition-colors text-left"
              >
                <div class="pokemon-sprite w-10 h-10 flex items-center justify-center shrink-0">
                  <img v-if="sprite(p.id)" :src="sprite(p.id)" class="w-8 h-8 object-contain" alt="" />
                  <span v-else>❓</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-[var(--text)]">{{ tName(p.id) }}</div>
                  <div class="flex gap-1 mt-0.5">
                    <span v-if="p.primaryType" class="px-2 py-0.5 rounded-full text-xs font-medium" :class="getTypeClass(p.primaryType)">
                      {{ tType(p.primaryType) }}
                    </span>
                    <span v-if="p.secondaryType" class="px-2 py-0.5 rounded-full text-xs font-medium" :class="getTypeClass(p.secondaryType)">
                      {{ tType(p.secondaryType) }}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Pokémon sélectionné et recommandations -->
        <div v-if="selectedPokemon" class="space-y-6">
          <!-- Card Pokémon -->
          <div class="glass-card rounded-2xl p-6">
            <div class="flex items-start gap-4">
              <div class="pokemon-sprite w-24 h-24 flex items-center justify-center shrink-0">
                <img v-if="sprite(selectedPokemon.id)" :src="sprite(selectedPokemon.id)" class="w-20 h-20 object-contain" alt="" />
                <span v-else class="text-4xl">❓</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-2xl font-bold text-[var(--text)]">{{ tName(selectedPokemon.id) }}</h3>
                  <button @click="clearPokemon" class="text-[var(--text-muted)] hover:text-[var(--text)] p-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span v-if="selectedPokemon.primaryType" class="px-3 py-1 rounded-full text-sm font-medium" :class="getTypeClass(selectedPokemon.primaryType)">
                    {{ tType(selectedPokemon.primaryType) }}
                  </span>
                  <span v-if="selectedPokemon.secondaryType" class="px-3 py-1 rounded-full text-sm font-medium" :class="getTypeClass(selectedPokemon.secondaryType)">
                    {{ tType(selectedPokemon.secondaryType) }}
                  </span>
                </div>
                <!-- Egg Groups - utiliser fullPokemonData si disponible -->
                <div v-if="(fullPokemonData?.eggGroups || selectedPokemon.eggGroups)?.length" class="text-sm text-[var(--text-muted)] mb-2">
                  <span class="font-medium">{{ lang === 'fr' ? 'Groupes Œufs' : 'Egg Groups' }}:</span> 
                  {{ (fullPokemonData?.eggGroups || selectedPokemon.eggGroups || []).map(g => tEggGroup(g)).join(', ') }}
                </div>
                <!-- EVs donnés -->
                <div v-if="fullPokemonData?.evYield && Object.values(fullPokemonData.evYield).some(v => v > 0)" class="text-sm text-[var(--text-muted)]">
                  <span class="font-medium">{{ lang === 'fr' ? 'EVs donnés' : 'EV Yield' }}:</span> 
                  <span v-for="(value, stat) in fullPokemonData.evYield" :key="stat">
                    <span v-if="value > 0" class="ml-1 px-2 py-0.5 rounded bg-[var(--primary)] bg-opacity-20 text-[var(--primary)]">
                      +{{ value }} {{ tStat(stat) }}
                    </span>
                  </span>
                </div>
                <!-- Hitbox -->
                <div v-if="fullPokemonData?.hitbox" class="text-sm text-[var(--text-muted)] mt-2">
                  <span class="font-medium">📦 Hitbox:</span>
                  <span class="ml-1 px-2 py-0.5 rounded" :class="fullPokemonData.hitbox.height <= 1 ? 'bg-green-500/20 text-green-400' : fullPokemonData.hitbox.height <= 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'">
                    {{ fullPokemonData.hitbox.width }}×{{ fullPokemonData.hitbox.height }} {{ lang === 'fr' ? 'blocs' : 'blocks' }}
                  </span>
                  <span v-if="fullPokemonData.hitbox.height <= 1" class="ml-1 text-green-400 text-xs">✓ Spawn 1 {{ lang === 'fr' ? 'bloc' : 'block' }}</span>
                  <span v-else-if="fullPokemonData.hitbox.height <= 2" class="ml-1 text-yellow-400 text-xs">⚠ Spawn {{ Number.isInteger(fullPokemonData.hitbox.height) ? fullPokemonData.hitbox.height + 1 : Math.ceil(fullPokemonData.hitbox.height) }} {{ lang === 'fr' ? 'blocs' : 'blocks' }}</span>
                  <span v-else class="ml-1 text-red-400 text-xs">⛔ Spawn {{ Number.isInteger(fullPokemonData.hitbox.height) ? fullPokemonData.hitbox.height + 1 : Math.ceil(fullPokemonData.hitbox.height) }} {{ lang === 'fr' ? 'blocs' : 'blocks' }}</span>
                  <span v-if="fullPokemonData.hitbox.fixed" class="ml-1 text-[var(--text-muted)] text-xs">({{ lang === 'fr' ? 'taille fixe' : 'fixed size' }})</span>
                </div>
                <!-- Loading indicator -->
                <div v-if="loadingPokemon" class="text-sm text-[var(--text-muted)] mt-2 flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                  {{ lang === 'fr' ? 'Chargement des données...' : 'Loading data...' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Recommandations -->
          <div v-if="pokemonRecommendations && !loadingPokemon" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Par Type -->
            <div v-if="pokemonRecommendations.types.length" class="info-box">
              <div class="info-box-header">
                <span class="text-xl">🎯</span> {{ lang === 'fr' ? 'Attirer par Type' : 'Attract by Type' }}
              </div>
              <p class="text-sm text-[var(--text-muted)] mb-4">{{ lang === 'fr' ? 'Multiplie par x10 les chances pour attirer ce Pokémon' : 'x10 chance to attract this Pokémon' }}</p>
              <div class="space-y-3">
                <div v-for="rec in pokemonRecommendations.types" :key="rec.berry" class="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)]">
                  <span class="text-2xl">{{ rec.icon }}</span>
                  <div class="flex-1">
                    <div class="font-semibold text-[var(--text)]">{{ rec.berry }}</div>
                    <div class="text-sm text-[var(--text-muted)]">Type {{ tType(rec.type) }} → {{ rec.multiplier }}</div>
                  </div>
                  <span class="px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">{{ rec.multiplier }}</span>
                </div>
              </div>
            </div>

            <!-- Par Groupe d'Œuf -->
            <div v-if="pokemonRecommendations.eggGroups.length" class="info-box">
              <div class="info-box-header">
                <span class="text-xl">🥚</span> {{ lang === 'fr' ? 'Attirer par Groupe Œuf' : 'Attract by Egg Group' }}
              </div>
              <p class="text-sm text-[var(--text-muted)] mb-4">{{ lang === 'fr' ? 'Multiplie par x10 les chances pour attirer ce Pokémon' : 'x10 chance to attract this Pokémon' }}</p>
              <div class="space-y-3">
                <div v-for="rec in pokemonRecommendations.eggGroups" :key="rec.berry + rec.group" class="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)]">
                  <span class="text-2xl">{{ rec.icon }}</span>
                  <div class="flex-1">
                    <div class="font-semibold text-[var(--text)]">{{ rec.berry }}</div>
                    <div class="text-sm text-[var(--text-muted)]">
                      Groupe {{ tEggGroup(rec.group) }}
                      <span v-if="rec.shared"> (aussi {{ rec.shared }})</span>
                    </div>
                  </div>
                  <span class="px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">x10</span>
                </div>
              </div>
            </div>

            <!-- Par EV -->
            <div v-if="pokemonRecommendations.evs.length" class="info-box md:col-span-2">
              <div class="info-box-header">
                <span class="text-xl">📊</span> {{ lang === 'fr' ? 'Si vous chassez pour les EVs' : 'If you are hunting for EVs' }}
              </div>
              <p class="text-sm text-[var(--text-muted)] mb-4">{{ lang === 'fr' ? 'Ce Pokémon donne ces EVs - utilisez ces baies pour les attirer' : 'This Pokémon gives these EVs - use these berries to attract it' }}</p>
              <div class="flex flex-wrap gap-3">
                <div v-for="rec in pokemonRecommendations.evs" :key="rec.berry" class="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-hover)]">
                  <span class="text-xl">{{ rec.icon }}</span>
                  <div>
                    <div class="font-semibold text-[var(--text)]">{{ rec.berry }}</div>
                    <div class="text-xs text-[var(--text-muted)]">+{{ rec.value }} EV {{ rec.stat }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Conseils supplémentaires -->
          <div class="glass-card rounded-2xl p-4 md:p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <h4 class="font-bold text-[var(--text)] mb-2 flex items-center gap-2">
              <span>💡</span> {{ lang === 'fr' ? 'Conseils pour attraper' : 'Tips to catch' }} {{ tName(selectedPokemon.id) }}
            </h4>
            <ul class="text-sm text-[var(--text-muted)] space-y-1">
              <li>• {{ lang === 'fr' ? 'Combinez une baie de type avec une Pomme Dorée pour augmenter la rareté' : 'Combine a type berry with a Golden Apple to increase rarity' }}</li>
              <li>• {{ lang === 'fr' ? 'Ajoutez une Baie Étoile pour x3 chances de shiny' : 'Add a Starf Berry for x3 shiny chance' }}</li>
              <li>• {{ lang === 'fr' ? 'Utilisez une Pomme ou Baie Sitrus pour réduire le délai de 100%' : 'Use an Apple or Sitrus Berry to reduce wait time by 100%' }}</li>
              <li v-if="pokemonRecommendations.types.length >= 2">• {{ lang === 'fr' ? 'Ce Pokémon a 2 types - les deux baies fonctionnent !' : 'This Pokémon has 2 types - both berries work!' }}</li>
            </ul>
          </div>

          <!-- Analyse Zone de Spawn -->
          <div v-if="spawnAnalysis && (spawnAnalysis.competingCount > 0 || spawnAnalysis.presets.length > 0)" class="glass-card rounded-2xl p-4 md:p-6">
            <div class="info-box-header mb-4">
              <span class="text-xl">🗺️</span> {{ lang === 'fr' ? 'Analyse de Zone de Spawn' : 'Spawn Zone Analysis' }}
            </div>
            
            <!-- Conditions de spawn -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <!-- Presets -->
              <div v-if="spawnAnalysis.presets.length" class="p-3 rounded-xl bg-[var(--surface-hover)]">
                <div class="text-sm font-medium text-[var(--text)] mb-2 flex items-center gap-2">
                  <span>📋</span> Presets
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="preset in spawnAnalysis.presets" :key="preset" class="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium">
                    {{ preset }}
                  </span>
                </div>
              </div>
              
              <!-- Contexts -->
              <div v-if="spawnAnalysis.contexts && spawnAnalysis.contexts.length" class="p-3 rounded-xl bg-[var(--surface-hover)]">
                <div class="text-sm font-medium text-[var(--text)] mb-2 flex items-center gap-2">
                  <span>🎯</span> {{ lang === 'fr' ? 'Contextes' : 'Contexts' }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="ctx in spawnAnalysis.contexts" :key="ctx" class="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium">
                    {{ ctx }}
                  </span>
                </div>
              </div>
              
              <!-- Rarities -->
              <div v-if="spawnAnalysis.rarities && spawnAnalysis.rarities.length" class="p-3 rounded-xl bg-[var(--surface-hover)]">
                <div class="text-sm font-medium text-[var(--text)] mb-2 flex items-center gap-2">
                  <span>⭐</span> {{ lang === 'fr' ? 'Rareté' : 'Rarity' }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="rarity in spawnAnalysis.rarities" :key="rarity" class="px-2 py-1 rounded-lg text-xs font-medium"
                    :class="{
                      'bg-yellow-500/20 text-yellow-400': rarity === 'ultra-rare',
                      'bg-orange-500/20 text-orange-400': rarity === 'rare',
                      'bg-green-500/20 text-green-400': rarity === 'uncommon',
                      'bg-gray-500/20 text-gray-400': rarity === 'common'
                    }">
                    {{ rarity }}
                  </span>
                </div>
              </div>
              
              <!-- Biomes -->
              <div v-if="spawnAnalysis.biomes.length" class="p-3 rounded-xl bg-[var(--surface-hover)]">
                <div class="text-sm font-medium text-[var(--text)] mb-2 flex items-center gap-2">
                  <span>🌍</span> Biomes
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="biome in spawnAnalysis.biomes" :key="biome" class="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    {{ biome }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 🏆 MEILLEURE ZONE DE SPAWN -->
            <div v-if="spawnAnalysis.zoneAnalysis && spawnAnalysis.zoneAnalysis.length > 1" class="mb-4">
              <h5 class="font-semibold text-[var(--text)] flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
                <span>📍</span> {{ lang === 'fr' ? 'Analyse par Zone de Spawn' : 'Spawn Zone Analysis' }}
                <span class="text-xs font-normal text-[var(--text-muted)] ml-auto">{{ spawnAnalysis.zoneAnalysis.length }} {{ lang === 'fr' ? 'zones trouvées' : 'zones found' }}</span>
              </h5>
              
              <!-- Meilleure zone en vedette -->
              <div v-if="spawnAnalysis.bestZone" class="mb-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 border-2 border-emerald-500/50">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span class="text-xl">🏆</span>
                  <span class="font-bold text-[var(--text)]">Zone Optimale</span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    {{ spawnAnalysis.bestZone.baseChance }}% chance de base
                  </span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span class="px-2 py-1 rounded-lg bg-emerald-500/30 text-emerald-300 text-sm font-medium">
                    🌍 {{ spawnAnalysis.bestZone.name }}
                  </span>
                  <span class="px-2 py-1 rounded-lg bg-yellow-500/30 text-yellow-300 text-xs">
                    ⭐ {{ spawnAnalysis.bestZone.rarity }}
                  </span>
                  <span class="px-2 py-1 rounded-lg bg-blue-500/30 text-blue-300 text-xs">
                    📊 Lvl {{ spawnAnalysis.bestZone.levels }}
                  </span>
                  <span v-if="spawnAnalysis.bestZone.spawnType" class="px-2 py-1 rounded-lg bg-purple-500/30 text-purple-300 text-xs">
                    🎯 {{ spawnAnalysis.bestZone.spawnType }}
                  </span>
                </div>
                <!-- Conditions détaillées de la meilleure zone -->
                <div class="flex flex-wrap gap-1.5 mb-2">
                  <span v-for="t in (spawnAnalysis.bestZone.times || [])" :key="t" class="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-xs">
                    {{ formatTime(t) }}
                  </span>
                  <span v-if="spawnAnalysis.bestZone.sky && spawnAnalysis.bestZone.sky.canSeeSky !== undefined" class="px-2 py-0.5 rounded text-xs" :class="spawnAnalysis.bestZone.sky.canSeeSky ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-500/20 text-gray-300'">
                    {{ spawnAnalysis.bestZone.sky.canSeeSky ? '🌤️ Voir le ciel' : '🏚️ Sans ciel' }}
                  </span>
                  <span v-if="spawnAnalysis.bestZone.moonPhase !== undefined" class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs">
                    🌙 {{ spawnAnalysis.bestZone.moonPhase === 0 ? 'Pleine lune' : 'Phase ' + spawnAnalysis.bestZone.moonPhase }}
                  </span>
                  <span v-if="spawnAnalysis.bestZone.weather && spawnAnalysis.bestZone.weather.isRaining" class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs">
                    🌧️ Pluie
                  </span>
                  <span v-if="spawnAnalysis.bestZone.weather && spawnAnalysis.bestZone.weather.isThundering" class="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-xs">
                    ⛈️ Orage
                  </span>
                  <span v-if="spawnAnalysis.bestZone.yLevel && (spawnAnalysis.bestZone.yLevel.minY !== undefined || spawnAnalysis.bestZone.yLevel.maxY !== undefined)" class="px-2 py-0.5 rounded bg-stone-500/20 text-stone-300 text-xs">
                    📏 Y: {{ spawnAnalysis.bestZone.yLevel.minY ?? '-∞' }} → {{ spawnAnalysis.bestZone.yLevel.maxY ?? '+∞' }}
                  </span>
                  <span v-if="spawnAnalysis.bestZone.isSubmerged" class="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 text-xs">
                    🤿 Sous l'eau
                  </span>
                </div>
                <p class="text-xs text-[var(--text-muted)]">
                  Seulement <strong class="text-emerald-400">{{ spawnAnalysis.bestZone.competitorCount }}</strong> autres {{ spawnAnalysis.bestZone.rarity }} dans cette zone
                </p>
              </div>

              <!-- Autres zones -->
              <div class="space-y-2">
                <details 
                  v-for="(zone, idx) in spawnAnalysis.zoneAnalysis.slice(1)" 
                  :key="idx"
                  class="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] group"
                >
                  <summary class="flex items-center justify-between flex-wrap gap-2 cursor-pointer list-none">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-lg">🌍</span>
                      <span class="font-medium text-[var(--text)] text-sm">{{ zone.name }}</span>
                      <span class="px-2 py-0.5 rounded text-xs"
                        :class="{
                          'bg-yellow-500/20 text-yellow-400': zone.rarity === 'ultra-rare',
                          'bg-orange-500/20 text-orange-400': zone.rarity === 'rare',
                          'bg-green-500/20 text-green-400': zone.rarity === 'uncommon',
                          'bg-gray-500/20 text-gray-400': zone.rarity === 'common'
                        }">
                        {{ zone.rarity }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-xs">
                      <span class="text-[var(--text-muted)]">
                        <strong class="text-[var(--text)]">{{ zone.competitorCount }}</strong> concurrents
                      </span>
                      <span class="px-2 py-0.5 rounded bg-[var(--primary)]/20 text-[var(--primary)] font-medium">
                        {{ zone.baseChance }}%
                      </span>
                    </div>
                  </summary>
                  <!-- Détails de la zone (collapsible) -->
                  <div class="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-1.5">
                    <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs">📊 Lvl {{ zone.levels }}</span>
                    <span v-if="zone.spawnType" class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs">🎯 {{ zone.spawnType }}</span>
                    <span v-for="t in (zone.times || [])" :key="t" class="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-xs">{{ formatTime(t) }}</span>
                    <span v-if="zone.sky && zone.sky.canSeeSky !== undefined" class="px-2 py-0.5 rounded text-xs" :class="zone.sky.canSeeSky ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-500/20 text-gray-300'">
                      {{ zone.sky.canSeeSky ? '🌤️ Ciel' : '🏚️ Sans ciel' }}
                    </span>
                    <span v-if="zone.moonPhase !== undefined" class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs">🌙 Phase {{ zone.moonPhase }}</span>
                    <span v-if="zone.weather && zone.weather.isRaining" class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs">🌧️ Pluie</span>
                    <span v-if="zone.weather && zone.weather.isThundering" class="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-xs">⛈️ Orage</span>
                    <span v-if="zone.yLevel && (zone.yLevel.minY !== undefined || zone.yLevel.maxY !== undefined)" class="px-2 py-0.5 rounded bg-stone-500/20 text-stone-300 text-xs">
                      📏 Y: {{ zone.yLevel.minY ?? '-∞' }} → {{ zone.yLevel.maxY ?? '+∞' }}
                    </span>
                    <span v-if="zone.isSubmerged" class="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 text-xs">🤿 Sous l'eau</span>
                    <!-- Nouvelles conditions -->
                    <span v-for="s in (zone.structures || [])" :key="'struct-' + s" class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs">🏛️ {{ s }}</span>
                    <span v-if="zone.baseBlocks?.selectors?.length" class="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-xs">🧱 Base: {{ zone.baseBlocks.selectors.join(', ') }}</span>
                    <span v-if="zone.nearbyBlocks?.selectors?.length" class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs">📍 Proximité: {{ zone.nearbyBlocks.selectors.join(', ') }}</span>
                    <span v-if="zone.lure" class="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-xs">🎣 Leurre {{ zone.lure.minLureLevel ?? 0 }}+</span>
                    <span v-if="zone.keyItem" class="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-xs">🔑 {{ zone.keyItem }}</span>
                    <span v-if="zone.isSlimeChunk" class="px-2 py-0.5 rounded bg-lime-500/20 text-lime-300 text-xs">🟢 Chunk Slime</span>
                  </div>
                </details>
              </div>
            </div>

            <!-- Zone unique (pas de comparaison) -->
            <div v-else-if="spawnAnalysis.bestZone" class="mb-4 p-3 rounded-xl bg-[var(--surface-hover)]">
              <div class="flex items-center gap-2 mb-2">
                <span>📍</span>
                <span class="font-medium text-[var(--text)]">Zone de Spawn</span>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                <span class="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">
                  🌍 {{ spawnAnalysis.bestZone.name }}
                </span>
                <span class="px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs">
                  ⭐ {{ spawnAnalysis.bestZone.rarity }}
                </span>
                <span class="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">
                  📊 Lvl {{ spawnAnalysis.bestZone.levels }}
                </span>
                <span v-if="spawnAnalysis.bestZone.spawnType" class="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">
                  🎯 {{ spawnAnalysis.bestZone.spawnType }}
                </span>
              </div>
              <!-- Conditions détaillées -->
              <div class="flex flex-wrap gap-1.5 mb-2">
                <span v-for="t in (spawnAnalysis.bestZone.times || [])" :key="t" class="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs">
                  {{ formatTime(t) }}
                </span>
                <span v-if="spawnAnalysis.bestZone.sky && spawnAnalysis.bestZone.sky.canSeeSky !== undefined" class="px-2 py-0.5 rounded text-xs" :class="spawnAnalysis.bestZone.sky.canSeeSky ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-400'">
                  {{ spawnAnalysis.bestZone.sky.canSeeSky ? '🌤️ Voir le ciel' : '🏚️ Sans ciel' }}
                </span>
                <span v-if="spawnAnalysis.bestZone.light && (spawnAnalysis.bestZone.light.minLight !== undefined || spawnAnalysis.bestZone.light.maxLight !== undefined)" class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">
                  💡 Lumière: {{ spawnAnalysis.bestZone.light.minLight ?? 0 }}-{{ spawnAnalysis.bestZone.light.maxLight ?? 15 }}
                </span>
                <span v-if="spawnAnalysis.bestZone.moonPhase !== undefined" class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-xs">
                  🌙 {{ spawnAnalysis.bestZone.moonPhase === 0 ? 'Pleine lune' : 'Phase ' + spawnAnalysis.bestZone.moonPhase }}
                </span>
                <span v-if="spawnAnalysis.bestZone.weather && spawnAnalysis.bestZone.weather.isRaining" class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">
                  🌧️ Pluie
                </span>
                <span v-if="spawnAnalysis.bestZone.weather && spawnAnalysis.bestZone.weather.isThundering" class="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-xs">
                  ⛈️ Orage
                </span>
                <span v-if="spawnAnalysis.bestZone.yLevel && (spawnAnalysis.bestZone.yLevel.minY !== undefined || spawnAnalysis.bestZone.yLevel.maxY !== undefined)" class="px-2 py-0.5 rounded bg-stone-500/20 text-stone-400 text-xs">
                  📏 Y: {{ spawnAnalysis.bestZone.yLevel.minY ?? '-∞' }} → {{ spawnAnalysis.bestZone.yLevel.maxY ?? '+∞' }}
                </span>
                <span v-if="spawnAnalysis.bestZone.isSubmerged" class="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">
                  🤿 Sous l'eau
                </span>
                <!-- Nouvelles conditions -->
                <span v-for="s in (spawnAnalysis.bestZone.structures || [])" :key="'struct-' + s" class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs">
                  🏛️ {{ s }}
                </span>
                <span v-if="spawnAnalysis.bestZone.baseBlocks?.selectors?.length" class="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs">
                  🧱 {{ spawnAnalysis.bestZone.baseBlocks.selectors.join(', ') }}
                </span>
                <span v-if="spawnAnalysis.bestZone.nearbyBlocks?.selectors?.length" class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">
                  📍 {{ spawnAnalysis.bestZone.nearbyBlocks.selectors.join(', ') }}
                </span>
                <span v-if="spawnAnalysis.bestZone.lure" class="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-xs">
                  🎣 Leurre {{ spawnAnalysis.bestZone.lure.minLureLevel ?? 0 }}+
                </span>
                <span v-if="spawnAnalysis.bestZone.keyItem" class="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                  🔑 {{ spawnAnalysis.bestZone.keyItem }}
                </span>
                <span v-if="spawnAnalysis.bestZone.isSlimeChunk" class="px-2 py-0.5 rounded bg-lime-500/20 text-lime-400 text-xs">
                  🟢 Chunk Slime
                </span>
              </div>
              <p class="text-xs text-[var(--text-muted)]">
                <strong class="text-[var(--text)]">{{ spawnAnalysis.bestZone.competitorCount }}</strong> autres {{ spawnAnalysis.bestZone.rarity }} dans cette zone
                ({{ spawnAnalysis.bestZone.baseChance }}% chance de base)
              </p>
            </div>

            <!-- 🎯 CONDITIONS OPTIMALES DE CHASSE -->
            <div v-if="spawnAnalysis.optimalConditions && spawnAnalysis.optimalConditions.summary && spawnAnalysis.optimalConditions.summary.length > 0" class="mb-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30">
              <h5 class="font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                <span>🎯</span> Conditions Optimales de Chasse
                <span class="text-xs font-normal text-[var(--text-muted)] ml-auto">Minimisez la compétition naturellement</span>
              </h5>
              
              <div class="space-y-2">
                <div v-for="(tip, idx) in spawnAnalysis.optimalConditions.summary" :key="idx" 
                  class="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-cyan-500/50 transition-colors">
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                      {{ tip.condition }}
                    </span>
                    <span class="text-sm text-[var(--text)]">
                      <span class="text-emerald-400 font-medium">{{ tip.best }}</span>
                      <span class="text-[var(--text-muted)]"> au lieu de </span>
                      <span class="text-red-400 font-medium">{{ tip.worst }}</span>
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold ml-auto"
                      :class="tip.improvement >= 3 ? 'bg-emerald-500/30 text-emerald-400' : tip.improvement >= 1 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-gray-500/30 text-gray-400'">
                      -{{ tip.improvement }} concurrent{{ tip.improvement > 1 ? 's' : '' }}
                    </span>
                  </div>
                  <p class="text-xs text-[var(--text-muted)] mt-2">💡 {{ tip.tip }}</p>
                </div>
              </div>
              
              <!-- Détails par condition si disponibles -->
              <details v-if="spawnAnalysis.conditionAnalysis" class="mt-3">
                <summary class="text-xs text-[var(--text-muted)] cursor-pointer hover:text-cyan-400">
                  📊 Voir l'analyse détaillée par condition...
                </summary>
                <div class="mt-3 grid gap-2 md:grid-cols-2">
                  <!-- Horaires -->
                  <div v-if="spawnAnalysis.conditionAnalysis.times.length > 1" class="p-2 rounded-lg bg-[var(--surface)]">
                    <div class="text-xs font-medium text-orange-400 mb-1">⏰ Horaires</div>
                    <div class="space-y-0.5">
                      <div v-for="t in spawnAnalysis.conditionAnalysis.times" :key="t.value" 
                        class="flex justify-between text-xs px-1 py-0.5 rounded"
                        :class="t === spawnAnalysis.conditionAnalysis.times[0] ? 'bg-emerald-500/10 text-emerald-400' : ''">
                        <span>{{ t.label }}</span>
                        <span>{{ t.competitors }} concurrents</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Ciel -->
                  <div v-if="spawnAnalysis.conditionAnalysis.sky.length > 1" class="p-2 rounded-lg bg-[var(--surface)]">
                    <div class="text-xs font-medium text-cyan-400 mb-1">🌤️ Ciel</div>
                    <div class="space-y-0.5">
                      <div v-for="s in spawnAnalysis.conditionAnalysis.sky" :key="s.value" 
                        class="flex justify-between text-xs px-1 py-0.5 rounded"
                        :class="s === spawnAnalysis.conditionAnalysis.sky[0] ? 'bg-emerald-500/10 text-emerald-400' : ''">
                        <span>{{ s.label }}</span>
                        <span>{{ s.competitors }} concurrents</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Météo -->
                  <div v-if="spawnAnalysis.conditionAnalysis.weather.length > 1" class="p-2 rounded-lg bg-[var(--surface)]">
                    <div class="text-xs font-medium text-blue-400 mb-1">🌦️ Météo</div>
                    <div class="space-y-0.5">
                      <div v-for="w in spawnAnalysis.conditionAnalysis.weather" :key="w.value" 
                        class="flex justify-between text-xs px-1 py-0.5 rounded"
                        :class="w === spawnAnalysis.conditionAnalysis.weather[0] ? 'bg-emerald-500/10 text-emerald-400' : ''">
                        <span>{{ w.label }}</span>
                        <span>{{ w.competitors }} concurrents</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 💡 Lumière - Niveau d'éclairage optimal -->
                  <div v-if="spawnAnalysis.conditionAnalysis.light.length > 1 && spawnAnalysis.conditionAnalysis.light[0].competitors !== spawnAnalysis.conditionAnalysis.light[spawnAnalysis.conditionAnalysis.light.length - 1].competitors" class="p-2 rounded-lg bg-[var(--surface)]">
                    <div class="text-xs font-medium text-amber-400 mb-1">💡 Lumière (torches)</div>
                    <div class="space-y-0.5">
                      <div v-for="l in spawnAnalysis.conditionAnalysis.light" :key="l.min + '-' + l.max" 
                        class="flex justify-between text-xs px-1 py-0.5 rounded"
                        :class="l === spawnAnalysis.conditionAnalysis.light[0] ? 'bg-emerald-500/10 text-emerald-400' : ''">
                        <span>{{ l.label }}</span>
                        <span>{{ l.competitors }} concurrents</span>
                      </div>
                    </div>
                    <!-- Conseil pratique adapté au contexte -->
                    <div v-if="spawnAnalysis.optimalConditions.light" class="mt-2 text-xs p-1.5 rounded border"
                      :class="spawnAnalysis.optimalConditions.sky?.value === true && spawnAnalysis.optimalConditions.light.max <= 7 
                        ? 'text-orange-300/80 bg-orange-500/10 border-orange-500/20' 
                        : 'text-amber-300/80 bg-amber-500/10 border-amber-500/20'">
                      <!-- Avertissement si ciel ouvert + faible lumière -->
                      <template v-if="spawnAnalysis.optimalConditions.sky?.value === true && spawnAnalysis.optimalConditions.light.max <= 7">
                        ⚠️ <strong>Ciel ouvert + faible lumière</strong> = chassez <strong>la nuit</strong> sans torches ! 
                        (Lumière naturelle nocturne: 4-8 selon la lune)
                      </template>
                      <!-- Avertissement si ciel ouvert + lumière élevée requise -->
                      <template v-else-if="spawnAnalysis.optimalConditions.sky?.value === true && spawnAnalysis.optimalConditions.light.min >= 12">
                        ☀️ <strong>Ciel ouvert + lumière forte</strong> = chassez <strong>en journée</strong> ! Pas besoin de torches.
                      </template>
                      <!-- Souterrain/couvert -->
                      <template v-else-if="spawnAnalysis.optimalConditions.sky?.value === false">
                        <template v-if="spawnAnalysis.optimalConditions.light.min === 0">
                          🌑 <strong>Zone souterraine sans torches</strong> - gardez la zone dans le noir complet !
                        </template>
                        <template v-else-if="spawnAnalysis.optimalConditions.light.max <= 7">
                          🕯️ <strong>Zone souterraine peu éclairée</strong> - quelques torches espacées suffisent.
                        </template>
                        <template v-else>
                          🔦 <strong>Zone souterraine bien éclairée</strong> - mettez des torches/glowstone partout !
                        </template>
                      </template>
                      <!-- Conseil par défaut -->
                      <template v-else>
                        💡 {{ spawnAnalysis.optimalConditions.light.tip }}
                      </template>
                    </div>
                  </div>
                  
                  <!-- Phase lunaire -->
                  <div v-if="spawnAnalysis.conditionAnalysis.moonPhase.length > 1" class="p-2 rounded-lg bg-[var(--surface)]">
                    <div class="text-xs font-medium text-indigo-400 mb-1">🌙 Phase lunaire</div>
                    <div class="space-y-0.5">
                      <div v-for="m in spawnAnalysis.conditionAnalysis.moonPhase" :key="m.value" 
                        class="flex justify-between text-xs px-1 py-0.5 rounded"
                        :class="m === spawnAnalysis.conditionAnalysis.moonPhase[0] ? 'bg-emerald-500/10 text-emerald-400' : ''">
                        <span>{{ m.label }}</span>
                        <span>{{ m.competitors }} concurrents</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 📏 Altitude Y - Hauteur optimale (seulement si différence entre tranches) -->
                  <div v-if="spawnAnalysis.conditionAnalysis.yLevel.length > 1 && spawnAnalysis.conditionAnalysis.yLevel[0].competitors !== spawnAnalysis.conditionAnalysis.yLevel[spawnAnalysis.conditionAnalysis.yLevel.length - 1].competitors" class="p-2 rounded-lg bg-[var(--surface)]">
                    <div class="text-xs font-medium text-stone-400 mb-1">📏 Altitude Y (hauteur plateforme)</div>
                    <div class="space-y-0.5">
                      <div v-for="y in spawnAnalysis.conditionAnalysis.yLevel" :key="y.value" 
                        class="flex justify-between text-xs px-1 py-0.5 rounded"
                        :class="y === spawnAnalysis.conditionAnalysis.yLevel[0] ? 'bg-emerald-500/10 text-emerald-400' : ''">
                        <span>Y: {{ y.min }} → {{ y.max }}</span>
                        <span>{{ y.competitors }} concurrents</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 📦 Hitbox - Hauteur de plafond (toujours afficher si différence) -->
                  <div v-if="spawnAnalysis.conditionAnalysis.hitbox.length > 0 && spawnAnalysis.conditionAnalysis.hitbox[0].blocked > 0" class="p-2 rounded-lg bg-[var(--surface)] border border-amber-500/30">
                    <div class="text-xs font-medium text-amber-400 mb-1">📦 Hauteur de plafond (filtre concurrents)</div>
                    <div class="space-y-0.5">
                      <div v-for="h in spawnAnalysis.conditionAnalysis.hitbox" :key="h.value" 
                        class="flex justify-between text-xs px-1 py-0.5 rounded"
                        :class="h === spawnAnalysis.conditionAnalysis.hitbox[0] ? 'bg-emerald-500/10 text-emerald-400' : ''">
                        <span>{{ h.label }}</span>
                        <span>
                          <span class="text-[var(--text-muted)]">{{ h.competitors }} concurrents</span>
                          <span v-if="h.blocked > 0" class="ml-1 text-green-400">({{ h.blocked }} bloqués)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
            
            <!-- 🛠️ GUIDE DE CONSTRUCTION DE PLATEFORME -->
            <div v-if="spawnAnalysis.platformGuide && spawnAnalysis.platformGuide.tips.length > 0" class="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30">
              <h5 class="font-semibold text-amber-400 flex items-center gap-2 mb-3">
                <span>🛠️</span> Guide de Construction de Plateforme
                <span class="text-xs font-normal text-[var(--text-muted)] ml-auto">Configuration optimale</span>
              </h5>
              
              <!-- Tips organisés par priorité -->
              <div class="space-y-2">
                <!-- Tips requis -->
                <template v-for="(tip, idx) in spawnAnalysis.platformGuide.tips.filter(t => t.priority === 'required')" :key="'req-' + idx">
                  <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-lg">{{ tip.icon }}</span>
                      <span class="font-medium text-red-400 text-sm">{{ tip.title }}</span>
                      <span class="ml-auto px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold">REQUIS</span>
                    </div>
                    <p class="text-xs text-[var(--text-muted)]">{{ tip.text }}</p>
                  </div>
                </template>
                
                <!-- Tips warning -->
                <template v-for="(tip, idx) in spawnAnalysis.platformGuide.tips.filter(t => t.priority === 'warning')" :key="'warn-' + idx">
                  <div class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-lg">{{ tip.icon }}</span>
                      <span class="font-medium text-amber-400 text-sm">{{ tip.title }}</span>
                      <span class="ml-auto px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">ATTENTION</span>
                    </div>
                    <p class="text-xs text-[var(--text-muted)]">{{ tip.text }}</p>
                  </div>
                </template>
                
                <!-- Tips importants -->
                <template v-for="(tip, idx) in spawnAnalysis.platformGuide.tips.filter(t => t.priority === 'important')" :key="'imp-' + idx">
                  <div class="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-lg">{{ tip.icon }}</span>
                      <span class="font-medium text-blue-400 text-sm">{{ tip.title }}</span>
                      <span class="ml-auto px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 font-bold">IMPORTANT</span>
                    </div>
                    <p class="text-xs text-[var(--text-muted)]">{{ tip.text }}</p>
                  </div>
                </template>
                
                <!-- Tips info -->
                <template v-for="(tip, idx) in spawnAnalysis.platformGuide.tips.filter(t => t.priority === 'info')" :key="'info-' + idx">
                  <div class="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-lg">{{ tip.icon }}</span>
                      <span class="font-medium text-[var(--text)] text-sm">{{ tip.title }}</span>
                    </div>
                    <p class="text-xs text-[var(--text-muted)]">{{ tip.text }}</p>
                  </div>
                </template>
              </div>
              
              <!-- Détails des blocs si présents -->
              <details v-if="spawnAnalysis.platformGuide.blocks.base.length > 0 || spawnAnalysis.platformGuide.blocks.nearby.length > 0" class="mt-3">
                <summary class="text-xs text-[var(--text-muted)] cursor-pointer hover:text-amber-400">
                  🧱 Voir les blocs acceptés en détail...
                </summary>
                <div class="mt-3 grid gap-3 md:grid-cols-2">
                  <!-- Base blocks -->
                  <div v-for="(block, idx) in spawnAnalysis.platformGuide.blocks.base" :key="'base-' + idx" class="p-2 rounded-lg bg-[var(--surface)]">
                    <div class="text-xs font-medium text-orange-400 mb-1">{{ block.tag }}</div>
                    <div class="flex flex-wrap gap-1">
                      <span v-for="resolved in block.resolved?.slice(0, 10)" :key="resolved" class="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-300 text-[10px]">
                        {{ resolved.replace('minecraft:', '').replace('biomeswevegone:', 'bwg:') }}
                      </span>
                      <span v-if="block.resolved?.length > 10" class="text-[10px] text-[var(--text-muted)]">+{{ block.resolved.length - 10 }} autres</span>
                    </div>
                  </div>
                  <!-- Nearby blocks -->
                  <div v-for="(block, idx) in spawnAnalysis.platformGuide.blocks.nearby" :key="'near-' + idx" class="p-2 rounded-lg bg-[var(--surface)]">
                    <div class="text-xs font-medium text-amber-400 mb-1">{{ block.tag }} (proximité)</div>
                    <div class="flex flex-wrap gap-1">
                      <span v-for="resolved in block.resolved?.slice(0, 10)" :key="resolved" class="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px]">
                        {{ resolved.replace('minecraft:', '').replace('biomeswevegone:', 'bwg:') }}
                      </span>
                      <span v-if="block.resolved?.length > 10" class="text-[10px] text-[var(--text-muted)]">+{{ block.resolved.length - 10 }} autres</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
            
            <p v-if="spawnAnalysis.competingCount > 0" class="text-sm text-[var(--text-muted)] mb-4">
              Rareté: <strong class="text-[var(--primary)]">{{ spawnAnalysis.primaryRarity }}</strong> — 
              <strong>{{ spawnAnalysis.competingCount }}</strong> autres Pokémon de même rareté dans cette zone.
              <span class="text-xs">({{ spawnAnalysis.totalInZone }} total toutes raretés)</span>
            </p>
            <p v-else-if="loadingAnalysis" class="text-sm text-[var(--text-muted)] mb-4 flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></span>
              Analyse des zones de spawn en cours...
            </p>
            <p v-else class="text-sm text-[var(--text-muted)] mb-4">
              Aucun autre Pokémon ne partage exactement ces conditions de spawn. Toutes les baies seront efficaces !
            </p>

            <!-- 🍎 Sélecteur de type de pomme -->
            <div class="mb-4 flex items-center justify-center gap-2 flex-wrap">
              <span class="text-sm text-[var(--text-muted)]">Calculer avec :</span>
              <div class="inline-flex rounded-xl bg-[var(--surface)] p-1 border border-[var(--border)]">
                <button 
                  @click="appleType = 'golden'" 
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                  :class="appleType === 'golden' ? 'bg-amber-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)]'"
                >
                  🍎 Golden Apple
                </button>
                <button 
                  @click="appleType = 'enchanted'" 
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                  :class="appleType === 'enchanted' ? 'bg-purple-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)]'"
                >
                  ✨ Enchanted
                </button>
              </div>
              <span class="text-xs text-[var(--text-muted)]">({{ appleType === 'golden' ? '+1 tier' : '+4 tiers' }})</span>
            </div>

            <!-- 🎰 MEILLEURS COMBOS 3 BAIES -->
            <div v-if="spawnAnalysis.bestCombos && spawnAnalysis.bestCombos.length > 0" class="mb-6">
              <h5 class="font-semibold text-[var(--text)] flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
                <span>🎰</span> Meilleurs Combos PokéSnack (3 slots)
                <span class="text-xs font-normal text-[var(--text-muted)] ml-auto">Efficacité = Chance rareté × Chance cible</span>
              </h5>
              
              <!-- Note explicative EV vs Type -->
              <div class="text-xs text-[var(--text-muted)] mb-3 p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                💡 <strong class="text-purple-400">1× Baie EV = 50%</strong> isolation, <strong class="text-purple-400">2× Baie EV = 100%</strong> isolation. 
                <strong class="text-blue-400">Baie Type = x10</strong>. 
                {{ lang === 'fr' ? 'Doubler une baie EV garantit que seuls les Pokémon donnant cet EV seront attirés.' : 'Doubling an EV berry guarantees only Pokémon giving that EV will be attracted.' }}
              </div>

              <!-- Meilleur combo en vedette -->
              <div v-if="spawnAnalysis.bestCombo" class="mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-2 border-yellow-500/50">
                <div class="flex items-center gap-2 mb-3 flex-wrap">
                  <span class="text-2xl">🏆</span>
                  <span class="font-bold text-lg text-[var(--text)]">Combo Optimal</span>
                  <span class="px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white">
                    {{ spawnAnalysis.bestCombo.efficiency }}%
                  </span>
                  <span v-if="spawnAnalysis.bestCombo.shinyBoost" class="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white">
                    ✨ SHINY x5
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded bg-[var(--primary)]/30 text-[var(--primary)]">
                    {{ spawnAnalysis.bestCombo.mechanic }}
                  </span>
                </div>
                
                <!-- Message si avantage hitbox avec plafond -->
                <div v-if="spawnAnalysis.bestCombo.ev && spawnAnalysis.bestCombo.ev.blockedByHitbox > 0" class="text-sm text-amber-400 mb-3 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                  📦 <strong>Avantage hitbox!</strong> Avec un plafond optimal, vous bloquez <strong>{{ spawnAnalysis.bestCombo.ev.blockedByHitbox }}</strong> concurrent(s) supplémentaire(s).
                  <div class="mt-1 text-xs text-amber-300">
                    Efficacité avec plafond: <strong>{{ spawnAnalysis.bestCombo.ev.efficiencyWithHitbox }}%</strong> 
                    (vs {{ spawnAnalysis.bestCombo.ev.efficiency }}% sans plafond)
                  </div>
                </div>
                
                <!-- Détail des chances -->
                <div class="text-xs text-[var(--text-muted)] mb-3 flex gap-4 flex-wrap">
                  <span>📊 Tier <strong class="text-[var(--text)]">{{ spawnAnalysis.bestCombo.tier }}</strong></span>
                  <span>🎲 Chance {{ spawnAnalysis.primaryRarity }}: <strong class="text-[var(--text)]">{{ spawnAnalysis.bestCombo.rarityChance }}%</strong></span>
                  <span>🎯 Chance cible: <strong class="text-[var(--text)]">{{ spawnAnalysis.bestCombo.targetChance }}%</strong></span>
                </div>
                
                <!-- 3 slots du combo -->
                <div class="flex gap-3 justify-center mb-3">
                  <div 
                    v-for="(slot, idx) in spawnAnalysis.bestCombo.slots" 
                    :key="idx"
                    class="flex flex-col items-center p-3 rounded-xl border-2 min-w-[100px]"
                    :class="{
                      'bg-purple-500/20 border-purple-500': slot.type === 'ev',
                      'bg-blue-500/20 border-blue-500': slot.type === 'type',
                      'bg-amber-500/20 border-amber-500': slot.type === 'special',
                      'bg-[var(--surface)] border-[var(--border)] border-dashed': slot.type === 'empty'
                    }"
                  >
                    <span class="text-2xl mb-1">{{ slot.icon }}</span>
                    <span class="text-xs text-center font-medium text-[var(--text)]">{{ slot.name }}</span>
                    <span class="text-xs text-[var(--text-muted)]">
                      <template v-if="slot.type === 'ev'">🔒 Filtre</template>
                      <template v-else-if="slot.type === 'type'">×10 Boost</template>
                      <template v-else-if="slot.type === 'special'">{{ slot.data?.effect || 'Spécial' }}</template>
                      <template v-else>Libre</template>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Autres combos alternatifs -->
              <div class="space-y-2">
                <div 
                  v-for="(combo, idx) in spawnAnalysis.bestCombos.slice(1)" 
                  :key="idx"
                  class="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-all"
                >
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="text-lg font-bold text-[var(--text-muted)]">{{ idx + 2 }}.</span>
                    
                    <!-- Slots en miniature -->
                    <div class="flex gap-1">
                      <span 
                        v-for="(slot, slotIdx) in combo.slots" 
                        :key="slotIdx"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
                        :class="{
                          'bg-purple-500/30': slot.type === 'ev',
                          'bg-blue-500/30': slot.type === 'type',
                          'bg-amber-500/30': slot.type === 'special',
                          'bg-[var(--surface-alt)]': slot.type === 'empty'
                        }"
                        :title="slot.name"
                      >{{ slot.icon }}</span>
                    </div>
                    
                    <div class="flex flex-col">
                      <span class="text-sm text-[var(--text)]">{{ combo.name }}</span>
                      <span class="text-xs text-[var(--text-muted)]">
                        Tier {{ combo.tier }} • {{ combo.rarityChance }}% rareté • {{ combo.targetChance }}% cible
                      </span>
                    </div>
                    
                    <span class="text-xs px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--text-muted)] ml-auto">
                      {{ combo.mechanic }}
                    </span>
                    <span class="font-bold text-lg" :class="{
                      'text-green-500': combo.efficiency >= 5,
                      'text-yellow-500': combo.efficiency >= 1 && combo.efficiency < 5,
                      'text-red-500': combo.efficiency < 1
                    }">{{ combo.efficiency }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tableau comparatif Type vs EV -->
            <div v-if="spawnAnalysis.competingCount > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              
              <!-- Colonne TYPES (Multiplicateur x10) -->
              <div class="space-y-3">
                <h5 class="font-semibold text-[var(--text)] flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                  <span>🎯</span> Baies de Type
                  <span class="text-xs font-normal text-[var(--text-muted)] ml-auto">Multiplicateur x10</span>
                </h5>
                <div v-if="spawnAnalysis.typeEfficiency.length" class="space-y-2">
                  <div 
                    v-for="eff in spawnAnalysis.typeEfficiency" 
                    :key="eff.type"
                    class="p-3 rounded-xl border transition-all"
                    :class="{
                      'border-green-500 bg-green-500/10': eff.recommendation === 'excellent',
                      'border-yellow-500 bg-yellow-500/10': eff.recommendation === 'bon',
                      'border-red-500 bg-red-500/10': eff.recommendation === 'faible'
                    }"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">{{ eff.icon }}</span>
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="getTypeClass(eff.type)">
                          {{ tType(eff.type) }}
                        </span>
                      </div>
                      <span class="font-bold" :class="{
                        'text-green-500': eff.recommendation === 'excellent',
                        'text-yellow-500': eff.recommendation === 'bon',
                        'text-red-500': eff.recommendation === 'faible'
                      }">{{ eff.efficiency }}%</span>
                    </div>
                    <div class="relative h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                      <div 
                        class="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                        :class="{
                          'bg-green-500': eff.recommendation === 'excellent',
                          'bg-yellow-500': eff.recommendation === 'bon',
                          'bg-red-500': eff.recommendation === 'faible'
                        }"
                        :style="{ width: eff.efficiency + '%' }"
                      ></div>
                    </div>
                    <div class="text-xs text-[var(--text-muted)] mt-1">
                      {{ eff.sameType }} concurrent{{ eff.sameType > 1 ? 's' : '' }} même type • {{ eff.otherTypes }} autres types
                    </div>
                    <!-- Liste des concurrents de même type -->
                    <details v-if="eff.competitors && eff.competitors.length > 0" class="mt-2">
                      <summary class="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                        👥 {{ eff.competitors.length }} concurrent{{ eff.competitors.length > 1 ? 's' : '' }} même type
                      </summary>
                      <div class="mt-2 flex flex-wrap gap-1">
                        <span 
                          v-for="(comp, idx) in eff.competitors" 
                          :key="comp?.id || idx"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface)] text-xs"
                        >
                          <img v-if="comp && sprite(comp.id)" :src="sprite(comp.id)" class="w-4 h-4 object-contain" />
                          {{ comp?.nameFr || comp?.name || 'Unknown' }}
                        </span>
                      </div>
                    </details>
                  </div>
                </div>
                <div v-else class="text-sm text-[var(--text-muted)] italic">
                  Aucune baie de type disponible
                </div>
              </div>

              <!-- Colonne EVs (Boost x1.5) -->
              <div class="space-y-3">
                <h5 class="font-semibold text-[var(--text)] flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                  <span>📊</span> Baies d'EV
                  <span class="text-xs font-normal px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 ml-auto">📈 Boost x1.5</span>
                </h5>
                
                <div v-if="spawnAnalysis.evEfficiency && spawnAnalysis.evEfficiency.length" class="space-y-2">
                  <div 
                    v-for="eff in spawnAnalysis.evEfficiency" 
                    :key="eff.stat"
                    class="p-3 rounded-xl border transition-all"
                    :class="{
                      'border-green-500 bg-green-500/10': eff.recommendation === 'excellent',
                      'border-yellow-500 bg-yellow-500/10': eff.recommendation === 'bon',
                      'border-red-500 bg-red-500/10': eff.recommendation === 'faible'
                    }"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">{{ eff.icon }}</span>
                        <span class="text-sm font-medium text-[var(--text)]">
                          {{ eff.statName }} (+{{ eff.targetValue }})
                        </span>
                      </div>
                      <span class="font-bold" :class="{
                        'text-green-500': eff.recommendation === 'excellent',
                        'text-yellow-500': eff.recommendation === 'bon',
                        'text-red-500': eff.recommendation === 'faible'
                      }">{{ eff.efficiency }}%</span>
                    </div>
                    
                    <!-- ⚠️ WARNING: Zone générique - liste incomplète -->
                    <div v-if="eff.warningGenericZone" class="text-xs mb-2 p-2 rounded border bg-amber-500/15 border-amber-500/40">
                      <div class="flex items-start gap-2">
                        <span class="text-lg">⚠️</span>
                        <div>
                          <strong class="text-amber-400">Zone générique détectée</strong>
                          <p class="text-amber-300/80 mt-0.5">
                            {{ eff.warningMessage || "La liste ci-dessous ne montre que les Pokémon des mêmes biomes. D'autres Pokémon de la zone peuvent aussi être attirés par cette baie EV !" }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 📦 AVANTAGE HITBOX: Pokémon bloqués par le plafond -->
                    <div v-if="eff.blockedByHitboxCount > 0" class="text-xs mb-2 p-2 rounded border bg-purple-500/15 border-purple-500/40">
                      <div class="flex items-start gap-2">
                        <span class="text-lg">📦</span>
                        <div class="flex-1">
                          <div class="flex items-center gap-2 flex-wrap">
                            <strong class="text-purple-400">{{ eff.blockedByHitboxCount }} Pokémon bloqués par plafond</strong>
                            <span class="text-purple-300/70">• Plafond optimal: {{ eff.targetHitboxHeight }} bloc{{ eff.targetHitboxHeight > 1 ? 's' : '' }}</span>
                          </div>
                          <p class="text-purple-300/80 mt-0.5">
                            Ces Pokémon ont une hitbox trop grande et ne peuvent pas spawner avec un plafond bas !
                          </p>
                          <!-- Détail des bloqués par rareté -->
                          <details class="mt-1">
                            <summary class="cursor-pointer hover:text-purple-300 text-purple-400/80">
                              Voir les {{ eff.blockedByHitboxCount }} bloqués...
                            </summary>
                            <div class="mt-2 space-y-1">
                              <div v-for="(pokemons, rarity) in eff.blockedByHitboxByRarity" :key="rarity" class="flex items-center gap-2">
                                <span class="px-1.5 py-0.5 rounded text-xs"
                                  :class="{
                                    'bg-yellow-500/20 text-yellow-400': rarity === 'ultra-rare',
                                    'bg-orange-500/20 text-orange-400': rarity === 'rare',
                                    'bg-green-500/20 text-green-400': rarity === 'uncommon',
                                    'bg-gray-500/20 text-gray-400': rarity === 'common' || rarity === 'unknown'
                                  }">
                                  {{ rarity }}
                                </span>
                                <span class="text-purple-300/60">{{ pokemons.length }} bloqués</span>
                                <div class="flex gap-0.5 flex-wrap">
                                  <template v-for="p in pokemons.slice(0, 8)" :key="p?.id || Math.random()">
                                    <span class="relative opacity-50 grayscale">
                                      <img v-if="p && sprite(p.id)" 
                                        :src="sprite(p.id)" 
                                        :title="'🚫 ' + (p.nameFr || p.name) + ' (hitbox: ' + p.hitboxHeight + ' blocs)'"
                                        class="w-4 h-4 object-contain" />
                                      <span class="absolute -bottom-0.5 -right-0.5 text-[8px]">🚫</span>
                                    </span>
                                  </template>
                                  <span v-if="pokemons.length > 8" class="text-xs text-purple-300/50">+{{ pokemons.length - 8 }}</span>
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 🎯 AVANTAGE CONDITIONS: Pokémon bloqués par ciel/altitude -->
                    <div v-if="eff.blockedByConditionsCount > 0" class="text-xs mb-2 p-2 rounded border bg-cyan-500/15 border-cyan-500/40">
                      <div class="flex items-start gap-2">
                        <span class="text-lg">🎯</span>
                        <div class="flex-1">
                          <div class="flex items-center gap-2 flex-wrap">
                            <strong class="text-cyan-400">{{ eff.blockedByConditionsCount }} Pokémon bloqués par conditions</strong>
                          </div>
                          <p class="text-cyan-300/80 mt-0.5">
                            Ces Pokémon ne peuvent pas spawner avec les conditions optimales sélectionnées (ciel/altitude) !
                          </p>
                          <!-- Détail des bloqués par conditions -->
                          <details class="mt-1">
                            <summary class="cursor-pointer hover:text-cyan-300 text-cyan-400/80">
                              Voir les {{ eff.blockedByConditionsCount }} bloqués...
                            </summary>
                            <div class="mt-2 space-y-1">
                              <div v-for="(pokemons, rarity) in eff.blockedByConditionsByRarity" :key="rarity" class="flex items-center gap-2">
                                <span class="px-1.5 py-0.5 rounded text-xs"
                                  :class="{
                                    'bg-yellow-500/20 text-yellow-400': rarity === 'ultra-rare',
                                    'bg-orange-500/20 text-orange-400': rarity === 'rare',
                                    'bg-green-500/20 text-green-400': rarity === 'uncommon',
                                    'bg-gray-500/20 text-gray-400': rarity === 'common' || rarity === 'unknown'
                                  }">
                                  {{ rarity }}
                                </span>
                                <span class="text-cyan-300/60">{{ pokemons.length }} bloqués</span>
                                <div class="flex gap-0.5 flex-wrap">
                                  <template v-for="p in pokemons.slice(0, 8)" :key="p?.id || Math.random()">
                                    <span class="relative opacity-50 grayscale">
                                      <img v-if="p && sprite(p.id)" 
                                        :src="sprite(p.id)" 
                                        :title="'🚫 ' + (p.nameFr || p.name) + (p.blockedBySky ? ' (ciel incompatible)' : '') + (p.blockedByY ? ' (altitude incompatible)' : '')"
                                        class="w-4 h-4 object-contain" />
                                      <span class="absolute -bottom-0.5 -right-0.5 text-[8px]">🚫</span>
                                    </span>
                                  </template>
                                  <span v-if="pokemons.length > 8" class="text-xs text-cyan-300/50">+{{ pokemons.length - 8 }}</span>
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                    
                    <!-- ✅ Pokémon qui PASSENT le plafond (consomment le PokéSnack) -->
                    <div v-if="eff.allRaritiesCountEffective > 0" class="text-xs mb-2 p-2 rounded border"
                      :class="eff.allRaritiesCountEffective <= 5 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
                              eff.allRaritiesCountEffective <= 15 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 
                              'bg-orange-500/10 border-orange-500/30 text-orange-400'">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span>{{ eff.allRaritiesCountEffective <= 5 ? '✨' : eff.allRaritiesCountEffective <= 15 ? '⚠️' : '🔥' }}</span>
                        <strong>{{ eff.allRaritiesCountEffective }} {{ lang === 'fr' ? 'Pokémon attirés' : 'Pokémon attracted' }}</strong>
                        <span class="text-[var(--text-muted)]">→ {{ lang === 'fr' ? 'consomment le PokéSnack' : 'consume the PokéSnack' }}</span>
                        <span v-if="eff.blockedByHitboxCount > 0 || eff.blockedByConditionsCount > 0" class="text-purple-400">
                          ({{ eff.blockedByHitboxCount + eff.blockedByConditionsCount }} {{ lang === 'fr' ? 'bloqués' : 'blocked' }}<span v-if="eff.blockedByHitboxCount > 0">: {{ eff.blockedByHitboxCount }} {{ lang === 'fr' ? 'plafond' : 'ceiling' }}</span><span v-if="eff.blockedByConditionsCount > 0">{{ eff.blockedByHitboxCount > 0 ? ', ' : ': ' }}{{ eff.blockedByConditionsCount }} conditions</span>)
                        </span>
                      </div>
                      <!-- Légende -->
                      <div class="mt-1 flex gap-2 text-[10px] text-[var(--text-muted)]">
                        <span>🎯 {{ lang === 'fr' ? 'Même biome' : 'Same biome' }}</span>
                        <span>🌍 {{ lang === 'fr' ? 'Via biome global (ex: is_overworld)' : 'Via global biome (e.g.: is_overworld)' }}</span>
                      </div>
                      <!-- Détail par rareté -->
                      <details class="mt-1">
                        <summary class="cursor-pointer hover:text-[var(--text)]">
                          {{ lang === 'fr' ? 'Voir par rareté...' : 'View by rarity...' }}
                        </summary>
                        <div class="mt-2 space-y-1">
                          <div v-for="(pokemons, rarity) in eff.allRaritiesByRarity" :key="rarity" class="flex items-center gap-2">
                            <span class="px-1.5 py-0.5 rounded text-xs"
                              :class="{
                                'bg-yellow-500/20 text-yellow-400': rarity === 'ultra-rare',
                                'bg-orange-500/20 text-orange-400': rarity === 'rare',
                                'bg-green-500/20 text-green-400': rarity === 'uncommon',
                                'bg-gray-500/20 text-gray-400': rarity === 'common' || rarity === 'unknown'
                              }">
                              {{ rarity }}
                            </span>
                            <span class="text-[var(--text-muted)]">{{ pokemons.length }} Pokémon</span>
                            <div class="flex gap-0.5 flex-wrap">
                              <template v-for="p in pokemons.slice(0, 8)" :key="p?.id || Math.random()">
                                <span class="relative">
                                  <img v-if="p && sprite(p.id)" 
                                    :src="sprite(p.id)" 
                                    :title="(p.viaParentBiome ? '🌍 ' : '🎯 ') + (p.nameFr || p.name)"
                                    class="w-4 h-4 object-contain"
                                    :class="{ 'opacity-60': p.viaParentBiome }" />
                                  <span v-if="p.viaParentBiome" class="absolute -bottom-0.5 -right-0.5 text-[8px]">🌍</span>
                                </span>
                              </template>
                              <span v-if="pokemons.length > 8" class="text-xs text-[var(--text-muted)]">+{{ pokemons.length - 8 }}</span>
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                    
                    <div class="relative h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                      <div 
                        class="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                        :class="{
                          'bg-emerald-500': eff.pokemonWithThisEv === 1,
                          'bg-green-500': eff.pokemonWithThisEv !== 1 && eff.recommendation === 'excellent',
                          'bg-yellow-500': eff.recommendation === 'bon',
                          'bg-red-500': eff.recommendation === 'faible'
                        }"
                        :style="{ width: eff.efficiency + '%' }"
                      ></div>
                    </div>
                    <div class="text-xs text-[var(--text-muted)] mt-1">
                      {{ eff.berry }} • {{ eff.pokemonWithThisEv === 1 ? (lang === 'fr' ? '🎯 Seul a donner cet EV !' : '🎯 Only one gives this EV!') : (lang === 'fr' ? 'Seuls ' + eff.pokemonWithThisEv + ' Pokemon donnent cet EV' : 'Only ' + eff.pokemonWithThisEv + ' Pokemon give this EV') }}
                    </div>
                    
                    <!-- 🚫 Concurrents ÉLIMINÉS (ceux qui ne donnent pas cet EV) -->
                    <details v-if="eff.eliminated && eff.eliminated.length > 0" class="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <summary class="cursor-pointer text-xs text-emerald-400 font-medium hover:text-emerald-300">
                        ✅ {{ eff.eliminatedCount }} {{ lang === 'fr' ? (eff.eliminatedCount > 1 ? 'concurrents elimines' : 'concurrent elimine') : (eff.eliminatedCount > 1 ? 'competitors eliminated' : 'competitor eliminated') }} {{ lang === 'fr' ? 'par cette baie' : 'by this berry' }}
                      </summary>
                      <div class="mt-2 flex flex-wrap gap-1">
                        <span 
                          v-for="(comp, idx) in eff.eliminated" 
                          :key="comp?.id || idx"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-xs text-red-300 line-through opacity-70"
                        >
                          <img v-if="comp && sprite(comp.id)" :src="sprite(comp.id)" class="w-4 h-4 object-contain grayscale" />
                          {{ comp?.nameFr || comp?.name || 'Unknown' }}
                        </span>
                      </div>
                    </details>
                    
                    <!-- Liste des concurrents avec même EV (restants) -->
                    <details v-if="eff.competitors && eff.competitors.length > 0" class="mt-2">
                      <summary class="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                        👥 {{ eff.competitors.length }} {{ lang === 'fr' ? (eff.competitors.length > 1 ? 'autres donnent' : 'autre donne') : (eff.competitors.length > 1 ? 'others also give' : 'other also gives') }} {{ lang === 'fr' ? 'aussi cet EV (restent)' : 'this EV (remain)' }}
                      </summary>
                      <div class="mt-2 flex flex-wrap gap-1">
                        <span 
                          v-for="(comp, idx) in eff.competitors" 
                          :key="comp?.id || idx"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface)] text-xs"
                        >
                          <img v-if="comp && sprite(comp.id)" :src="sprite(comp.id)" class="w-4 h-4 object-contain" />
                          {{ comp?.nameFr || comp?.name || 'Unknown' }}
                          <span class="text-purple-400">(+{{ comp?.evValue || 0 }})</span>
                        </span>
                      </div>
                    </details>
                  </div>
                </div>
                <div v-else class="text-sm text-[var(--text-muted)] italic">
                  Ce Pokémon ne donne pas d'EV ou pas de baie correspondante
                </div>
              </div>
            </div>

            <!-- Liste des concurrents (collapsible) -->
            <details v-if="spawnAnalysis.competingPokemon && spawnAnalysis.competingPokemon.length" class="mt-4">
              <summary class="cursor-pointer text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                👀 Voir les {{ spawnAnalysis.competingCount }} Pokémon concurrents dans cette zone
              </summary>
              <div class="mt-3 flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2">
                <div 
                  v-for="(comp, idx) in spawnAnalysis.competingPokemon" 
                  :key="comp?.id || idx"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-hover)] text-sm"
                >
                  <div class="w-8 h-8 flex items-center justify-center">
                    <img v-if="comp && sprite(comp.id)" :src="sprite(comp.id)" class="w-6 h-6 object-contain" alt="" />
                    <span v-else>❓</span>
                  </div>
                  <span class="text-[var(--text)]">{{ comp ? tName(comp.id) : 'Unknown' }}</span>
                  <div v-if="comp && comp.types" class="flex gap-0.5">
                    <span 
                      v-for="(t, tIdx) in comp.types" 
                      :key="t || tIdx" 
                      class="w-2 h-2 rounded-full"
                      :class="'bg-' + (t || '').toLowerCase()"
                    ></span>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="text-center py-12">
          <div class="w-24 h-24 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4 text-5xl">
            🔍
          </div>
          <h3 class="text-lg font-semibold text-[var(--text)] mb-2">Recherchez un Pokémon</h3>
          <p class="text-[var(--text-muted)]">Tapez le nom d'un Pokémon pour voir quelles baies utiliser</p>
        </div>
      </template>

      <!-- ===== MODE BAITS ===== -->
      <template v-else>

      <!-- Search & Filters -->
      <div class="glass-card rounded-2xl p-4 md:p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Search -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="t('search.berry')"
              class="search-input pl-10"
            />
          </div>
          
          <!-- Stats -->
          <div class="flex items-center justify-end text-sm text-[var(--text-muted)]">
            <span class="px-3 py-1 rounded-full bg-[var(--primary)] text-white font-medium">
              {{ totalItems }} {{ lang === 'fr' ? 'résultats' : 'results' }}
            </span>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="nav-pill text-sm"
            :class="{ active: selectedCategory === cat.id }"
          >
            <span>{{ cat.icon }} {{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- Bait Categories -->
      <div class="space-y-6">
        <div
          v-for="(category, key) in filteredData"
          :key="key"
          class="glass-card rounded-2xl overflow-hidden animate-slideIn"
        >
          <!-- Category Header -->
          <div class="p-4 md:p-6 border-b border-[var(--border)]">
            <h3 class="text-xl font-bold text-[var(--text)] mb-1">{{ category.title }}</h3>
            <p class="text-sm text-[var(--text-muted)]">{{ category.description }}</p>
          </div>

          <!-- Items Grid -->
          <div class="p-4 md:p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div
                v-for="item in category.items"
                :key="item.berry"
                class="bait-item group"
              >
                <!-- Icon -->
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
                  :style="{ backgroundColor: item.color + '20' }"
                >
                  {{ item.icon }}
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate">
                    {{ item.berry }}
                  </div>
                  <div class="text-sm text-[var(--text-muted)] truncate">
                    {{ item.effect }}
                  </div>
                </div>

                <!-- Color indicator -->
                <div
                  class="w-2 h-8 rounded-full opacity-60"
                  :style="{ backgroundColor: item.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="totalItems === 0" class="text-center py-12">
        <div class="w-20 h-20 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4 text-4xl">
          🔍
        </div>
        <h3 class="text-lg font-semibold text-[var(--text)] mb-2">{{ lang === 'fr' ? 'Aucun résultat' : 'No results' }}</h3>
        <p class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Essayez une autre recherche ou catégorie' : 'Try another search or category' }}</p>
      </div>

      <!-- Tips Section -->
      <div class="glass-card rounded-2xl p-4 md:p-6">
        <h3 class="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <span class="text-2xl">💡</span> {{ lang === 'fr' ? 'Conseils' : 'Tips' }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-lg bg-[var(--primary)] bg-opacity-20 flex items-center justify-center shrink-0">
              <span class="text-[var(--primary)]">1</span>
            </div>
            <div>
              <p class="font-medium text-[var(--text)]">{{ lang === 'fr' ? 'Combinez les effets' : 'Combine effects' }}</p>
              <p class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Vous pouvez utiliser plusieurs baies pour cumuler les effets sur votre PokéSnack.' : 'You can use multiple berries to stack effects on your PokéSnack.' }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-lg bg-[var(--primary)] bg-opacity-20 flex items-center justify-center shrink-0">
              <span class="text-[var(--primary)]">2</span>
            </div>
            <div>
              <p class="font-medium text-[var(--text)]">{{ lang === 'fr' ? 'Probabilités' : 'Probabilities' }}</p>
              <p class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Les pourcentages représentent la probabilité que cet effet soit actif.' : 'The percentages shown represent the chance that the effect applies.' }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-lg bg-[var(--primary)] bg-opacity-20 flex items-center justify-center shrink-0">
              <span class="text-[var(--primary)]">3</span>
            </div>
            <div>
              <p class="font-medium text-[var(--text)]">{{ lang === 'fr' ? 'Rareté tiers' : 'Rarity tiers' }}</p>
              <p class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Tier 0 = 86% commun, Tier 3 = 70% commun avec plus de rares.' : 'Tier 0 = 86% common, Tier 3 = 70% common with more rares.' }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-lg bg-[var(--primary)] bg-opacity-20 flex items-center justify-center shrink-0">
              <span class="text-[var(--primary)]">4</span>
            </div>
            <div>
              <p class="font-medium text-[var(--text)]">{{ lang === 'fr' ? 'Pokémon cibles' : 'Target Pokémon' }}</p>
              <p class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Consultez le Pokédex pour voir les types, groupes Œufs et EVs de chaque Pokémon.' : 'Check the Pokédex to see the types, egg groups and EVs of each Pokémon.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Link to Wiki -->
      <div class="text-center">
        <a
          href="https://wiki.cobblemon.com/index.php/Seasoning#Bait_Seasoning"
          target="_blank"
          rel="noopener"
          class="btn btn-secondary inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          {{ lang === 'fr' ? 'Voir le Wiki Cobblemon complet' : 'See the full Cobblemon Wiki' }}
        </a>
      </div>
      </template>
    </section>
  `,
};
