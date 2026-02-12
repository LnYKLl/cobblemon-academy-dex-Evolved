import {
  inject,
  ref,
  computed,
  onMounted,
  watch,
} from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";
import {
  groupMoves,
  flatSpawns,
  spriteFrom,
  normalizeResultId,
  evolRequirementLabel,
} from "../utils/helpers.js";
import {
  translatePokemonName,
  translateType,
  translateAbility,
  translateEggGroup,
  translateStat,
  translateExpGroup,
  translateLabel,
  translateItem,
  capitalizeFirst,
  t,
  getCurrentLang,
} from "../utils/i18n.js";

export default {
  // keep props so DexList/route/sprites still flow in
  props: ["dex", "sprites", "route", "currentLang"],
  setup(props) {
    // NEW: per-mon loader + cache from main.js (provided via provide/inject)
    const getMon = inject("getMon", null); // async (id) -> full mon json
    const monCache = inject("monCache", null); // Map(), optional but useful
    const i18n = inject("i18n", ref({}));
    const injectedLang = inject("currentLang", ref('fr')); // Get from parent

    const mon = ref(null);
    const loadingMon = ref(true);
    const loadErr = ref(null);

    // Translation helpers - safely access i18n.value
    const getI18n = () => (i18n && i18n.value) ? i18n.value : {};
    // Use injected currentLang (reactive ref from parent) or props as fallback
    const lang = computed(() => injectedLang.value || props.currentLang || 'fr');
    const tName = (id) => translatePokemonName(id, getI18n(), lang.value);
    const tType = (type) => translateType(type, getI18n());
    const tEggGroup = (group) => translateEggGroup(group, getI18n(), lang.value);
    const tStat = (stat) => translateStat(stat, lang.value);
    const tExpGroup = (group) => translateExpGroup(group, getI18n());
    const tLabel = (label) => translateLabel(label, getI18n());
    const tItem = (item) => translateItem(item, getI18n());
    
    // Ability display - use name from data (already translated) or translate id
    const displayAbility = (ab) => {
      if (!ab) return '';
      // If ab has a 'name' property, use it (it's already in correct language based on data)
      if (typeof ab === 'object' && ab.name) {
        // For French site, use the name from data; for English, use id
        if (lang.value === 'en') {
          return capitalizeFirst((ab.id || '').replace(/_/g, ' '));
        }
        return ab.name;
      }
      // Legacy string format
      const cleanId = typeof ab === 'string' ? ab.replace('h:', '') : String(ab);
      return capitalizeFirst(cleanId.replace(/_/g, ' '));
    };
    
    // Move display - use id for English, nameFr for French
    const displayMove = (move) => {
      if (!move) return '';
      if (typeof move === 'object') {
        if (lang.value === 'en') {
          // Use id for English, format nicely
          const id = move.id || move.nameFr || '';
          return capitalizeFirst(id.replace(/_/g, ' '));
        }
        // French: use nameFr
        return move.nameFr || move.id || '';
      }
      return capitalizeFirst(String(move).replace(/_/g, ' '));
    };
    
    // Item display - use itemName from data if available and properly translated
    const displayItem = (drop) => {
      if (!drop) return '';
      const item = drop.item || '';
      
      // If itemName looks like an untranslated ID (contains ':'), use translateItem instead
      if (drop.itemName && !drop.itemName.includes(':')) {
        if (lang.value === 'en') {
          // Extract item id and capitalize for English
          const id = item.includes(':') ? item.split(':')[1] : item;
          return capitalizeFirst(id.replace(/_/g, ' '));
        }
        return drop.itemName;
      }
      
      // Fallback to translateItem which has hardcoded translations
      return translateItem(item, getI18n(), lang.value);
    };

    // Traduction des horaires de spawn (bilingual)
    const timeLabels = {
      day: { fr: '☀️ Jour', en: '☀️ Day' },
      night: { fr: '🌙 Nuit', en: '🌙 Night' },
      dawn: { fr: '🌅 Aube', en: '🌅 Dawn' },
      dusk: { fr: '🌇 Crépuscule', en: '🌇 Dusk' },
      noon: { fr: '🌞 Midi', en: '🌞 Noon' },
      midnight: { fr: '🌑 Minuit', en: '🌑 Midnight' }
    };
    const formatTime = (t) => timeLabels[t]?.[lang.value] || timeLabels[t]?.['fr'] || t;

    const currentId = () => {
      const id = (props.route?.params && props.route.params.id) ||
        props.route?.param ||
        null;
      console.log('[MonPage] currentId:', id, 'route:', JSON.stringify(props.route));
      return id;
    };

    const load = async () => {
      const id = currentId();
      if (!id) {
        mon.value = null;
        loadingMon.value = false;
        loadErr.value = null;
        return;
      }
      if (!getMon) {
        console.error('[MonPage] getMon not injected!');
        loadErr.value = 'Erreur: getMon non disponible';
        loadingMon.value = false;
        return;
      }
      loadingMon.value = true;
      loadErr.value = null;
      try {
        mon.value = await getMon(id);
      } catch (e) {
        console.error('[MonPage] Error loading mon:', e);
        mon.value = null;
        loadErr.value = e?.message || String(e);
      } finally {
        loadingMon.value = false;
      }
    };

    const back = () =>
      history.length > 1 ? history.back() : (location.hash = "#/dex");
    const goPreset = (p) =>
      (location.hash = `#/preset/${encodeURIComponent(p)}`);
    const goBiome = (t) => (location.hash = `#/biome/${encodeURIComponent(t)}`);
    const goMon = (id) =>
      id && (location.hash = "#/mon/" + encodeURIComponent(id));

    const sprite = (id) => spriteFrom(props.sprites, id);
    const reqLabel = evolRequirementLabel;

    // Use your index (props.dex) for evolution target lookup (id → name),
    // while sprites come from spriteFrom and full data stays in mon.value
    const evolutions = computed(() => {
      const m = mon.value;
      if (!m) return [];
      return (m.evolutions || []).map((ev) => {
        const tid = normalizeResultId(ev.result, props.dex);
        const target = props.dex.find((x) => x.id === tid) || null; // index has {id,name,...}
        return {
          ...ev,
          _targetId: tid,
          _target: target,
          _sprite: tid ? sprite(tid) : null,
        };
      });
    });

    // Pre-evolution: look up what this mon evolves FROM
    const preEvolution = computed(() => {
      const m = mon.value;
      if (!m || !m.preEvolution) return null;
      const preId = m.preEvolution;
      const target = props.dex.find((x) => x.id === preId) || null;
      return {
        id: preId,
        _target: target,
        _sprite: preId ? sprite(preId) : null,
      };
    });

    // Small helpers for labels
    const titleize = (s) =>
      String(s || "")
        .split("_")
        .join(" ");
    const ratioText = (r) => (r == null || r === "" ? "" : String(r));

    onMounted(load);
    watch(
      () => props.route && (props.route.params?.id ?? props.route.param),
      load
    );

    const isBiomeReq = (req) =>
      req?.variant === "biome" &&
      (req.biome || req.biomeCondition || req.biomeAnticondition);

    const biomeId = (req) =>
      req.biome || req.biomeCondition || req.biomeAnticondition || "";

    const biomeReal = (req) => {
      const biome = biomeId(req);
      const [mod, tag] = biome.split(":");
      const splits = tag.split("/");
      const last_segment = splits[splits.length - 1];
      return mod + ":" + last_segment;
    };

    const biomeHref = (req) => `#/biome/${encodeURIComponent(biomeReal(req))}`;

    const biomeShort = (req) => {
      const id = biomeId(req);
      return id.includes(":") ? id.split(":")[1] : id;
    };

    const biomePrefix = (req) => (req.biomeAnticondition ? "Not in" : "In");

    // For non-interactive labels (everything that's not a biome chip)
    const evolRequirementText = (req) => {
      if (!req || typeof req !== "object") return "";
      const useLang = lang.value;
      switch (req.variant) {
        case "level": {
          const min = req.minLevel ?? req.level ?? "?";
          const time = req.timeRange ? ` @ ${req.timeRange}` : "";
          return useLang === 'fr' ? `Niveau ${min}${time}` : `Level ${min}${time}`;
        }
        case "has_move":
          return useLang === 'fr' ? `Connaître ${req.move || "une attaque"}` : `Know ${req.move || "a move"}`;
        case "has_move_type":
          return useLang === 'fr' ? `Connaître attaque ${req.type || "type"}` : `Know ${req.type || "a type"} move`;
        case "held_item": {
          const item = req.item || req.itemCondition || "item";
          const itemName = item.includes(':') ? item.split(':')[1].replace(/_/g, ' ') : item;
          return useLang === 'fr' ? `Tenir ${itemName}` : `Hold ${itemName}`;
        }
        case "use_item": {
          const item = req.item || "item";
          const itemName = item.includes(':') ? item.split(':')[1].replace(/_/g, ' ') : item;
          return useLang === 'fr' ? `Utiliser ${itemName}` : `Use ${itemName}`;
        }
        case "weather":
          return `${req.weather || "weather"}`;
        case "friendship": {
          const amount = req.min || req.amount || "";
          return useLang === 'fr' ? `Amitié ${amount}` : `Friendship ${amount}`;
        }
        case "time_range":
          return useLang === 'fr' ? `Heure: ${req.range}` : `Time: ${req.range}`;
        case "defeat": {
          // Exemple: vaincre 3 Bisharp avec King's Rock
          const target = req.target || "";
          const amount = req.amount || 1;
          // Parse "bisharp held_item=cobblemon:kings_rock"
          const parts = target.split(' ');
          const pokemon = parts[0] || "";
          let condition = "";
          for (let i = 1; i < parts.length; i++) {
            if (parts[i].startsWith('held_item=')) {
              const heldItem = parts[i].split('=')[1] || "";
              const itemName = heldItem.includes(':') ? heldItem.split(':')[1].replace(/_/g, ' ') : heldItem;
              condition = useLang === 'fr' ? ` tenant ${itemName}` : ` holding ${itemName}`;
            }
          }
          const pokemonName = pokemon.charAt(0).toUpperCase() + pokemon.slice(1);
          return useLang === 'fr' 
            ? `Vaincre ${amount} ${pokemonName}${condition}` 
            : `Defeat ${amount} ${pokemonName}${condition}`;
        }
        case "party_member": {
          const species = req.species || req.pokemon || "";
          const pokemonName = species.charAt(0).toUpperCase() + species.slice(1);
          return useLang === 'fr' ? `Avec ${pokemonName} dans l'équipe` : `With ${pokemonName} in party`;
        }
        case "recoil_damage": {
          const amount = req.amount || "";
          return useLang === 'fr' ? `${amount} dégâts de recul` : `${amount} recoil damage`;
        }
        case "damage_taken": {
          const amount = req.amount || "";
          return useLang === 'fr' ? `Subir ${amount} dégâts` : `Take ${amount} damage`;
        }
        case "walked_steps": {
          const amount = req.amount || "";
          return useLang === 'fr' ? `Marcher ${amount} pas` : `Walk ${amount} steps`;
        }
        case "any": {
          // Multiple possible requirements
          return useLang === 'fr' ? "Une des conditions" : "Any of";
        }
        case "world":
          return useLang === 'fr' ? `Monde: ${req.identifier || ""}` : `World: ${req.identifier || ""}`;
        case "moon_phase": {
          const phase = req.moonPhase ?? req.phase ?? "";
          return useLang === 'fr' ? `Phase lunaire: ${phase}` : `Moon phase: ${phase}`;
        }
        case "attack_defence_ratio": {
          const ratio = req.ratio || "";
          return useLang === 'fr' ? `Ratio Atk/Def: ${ratio}` : `Atk/Def ratio: ${ratio}`;
        }
        case "properties": {
          // Check for gender, nature, etc.
          if (req.gender) {
            return useLang === 'fr' 
              ? `Genre: ${req.gender === 'male' ? 'Mâle' : 'Femelle'}` 
              : `Gender: ${req.gender}`;
          }
          if (req.nature) {
            return `Nature: ${req.nature}`;
          }
          return useLang === 'fr' ? "Propriétés spéciales" : "Special properties";
        }
        default:
          return String(req.variant || "").replace(/_/g, " ");
      }
    };

    // Format evolution variant name
    const formatEvoVariant = (variant) => {
      const useLang = lang.value;
      const variants = {
        level_up: { fr: 'Montée de niveau', en: 'Level Up' },
        trade: { fr: 'Échange', en: 'Trade' },
        item_interact: { fr: 'Utiliser objet', en: 'Use Item' },
        shed: { fr: 'Mue', en: 'Shed' },
        walk: { fr: 'Marcher', en: 'Walk' },
      };
      return variants[variant]?.[useLang] || String(variant || "").replace(/_/g, " ");
    };
    
    const getTypeClass = (typeName) => {
      if (!typeName) return '';
      return 'type-' + typeName.toLowerCase();
    };
    
    const getStatPercent = (value) => {
      const maxStat = 255;
      return Math.min(100, (value / maxStat) * 100);
    };
    
    const getStatClass = (statName) => {
      return 'stat-' + statName.toLowerCase().replace(' ', '_');
    };

    return {
      mon,
      loadingMon,
      loadErr,
      back,
      goPreset,
      goBiome,
      goMon,
      groupMoves,
      flatSpawns,
      sprite,
      evolutions,
      preEvolution,
      reqLabel,
      titleize,
      ratioText,
      isBiomeReq,
      evolRequirementText,
      evolRequirementLabel,
      formatEvoVariant,
      biomeHref,
      biomePrefix,
      biomeShort,
      getTypeClass,
      getStatPercent,
      getStatClass,
      tName,
      tType,
      tEggGroup,
      tStat,
      tExpGroup,
      tLabel,
      tItem,
      formatTime,
      displayAbility,
      displayMove,
      displayItem,
      lang,
      t,
      getCurrentLang,
    };
  },

  template: `
    <section v-if="loadingMon" class="animate-fadeIn">
      <button class="btn btn-secondary mb-6" @click="back">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{ lang === 'fr' ? 'Retour' : 'Back' }}
      </button>
      <div class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin mb-4"></div>
        <p class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Chargement...' : 'Loading...' }}</p>
      </div>
    </section>

    <section v-else-if="loadErr" class="animate-fadeIn">
      <button class="btn btn-secondary mb-6" @click="back">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{ lang === 'fr' ? 'Retour' : 'Back' }}
      </button>
      <div class="glass-card rounded-2xl p-6 text-center">
        <div class="text-5xl mb-4">😢</div>
        <h3 class="text-xl font-bold text-[var(--text)] mb-2">{{ lang === 'fr' ? 'Erreur de chargement' : 'Loading Error' }}</h3>
        <p class="text-[var(--text-muted)]">{{ loadErr }}</p>
      </div>
    </section>

    <section v-else-if="mon" class="space-y-6 animate-fadeIn">
      <!-- Back button -->
      <button class="btn btn-secondary" @click="back">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{ lang === 'fr' ? 'Retour au Pokédex' : 'Back to Pokédex' }}
      </button>

      <!-- Header Card -->
      <div class="glass-card rounded-2xl p-6">
        <div class="flex flex-col md:flex-row items-start gap-6">
          <!-- Sprite -->
          <div class="pokemon-sprite w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mx-auto md:mx-0 shrink-0">
            <img v-if="sprite(mon.id)" :src="sprite(mon.id)" class="w-28 h-28 md:w-36 md:h-36 object-contain" alt="" />
            <span v-else class="text-6xl">❓</span>
          </div>

          <!-- Info -->
          <div class="flex-1 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span class="text-[var(--text-muted)] font-mono text-lg">#{{ mon.dexnum }}</span>
              <h2 class="text-3xl font-bold text-[var(--text)]">{{ tName(mon.id) }}</h2>
            </div>

            <!-- Types -->
            <div class="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
              <span 
                v-if="mon.primaryType" 
                class="px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm"
                :class="getTypeClass(mon.primaryType)"
              >
                {{ tType(mon.primaryType) }}
              </span>
              <span 
                v-if="mon.secondaryType" 
                class="px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm"
                :class="getTypeClass(mon.secondaryType)"
              >
                {{ tType(mon.secondaryType) }}
              </span>
            </div>

            <!-- Quick info chips -->
            <div class="flex flex-wrap gap-2 justify-center md:justify-start">
              <span v-if="mon.maleRatio!=null && mon.maleRatio!==''" class="chip chip-primary">
                ♂/♀ {{ ratioText(mon.maleRatio) }}
              </span>
              <span v-for="lab in (mon.labels||[])" :key="lab" class="chip chip-neutral">
                {{ tLabel(lab) }}
              </span>
              <span v-if="mon.experienceGroup" class="chip chip-neutral">
                XP: {{ tExpGroup(mon.experienceGroup) }}
              </span>
              <span v-if="mon.catchRate!=='' && mon.catchRate!=null" class="chip chip-neutral">
                {{ lang === 'fr' ? 'Capture:' : 'Catch Rate:' }} {{ mon.catchRate }}
              </span>
              <span v-if="mon.hitbox" class="chip chip-neutral" :title="lang === 'fr' ? ('Peut spawner sous ' + (mon.hitbox.height <= 1 ? '1' : (Number.isInteger(mon.hitbox.height) ? mon.hitbox.height + 1 : Math.ceil(mon.hitbox.height))) + ' bloc(s) de haut') : ('Can spawn under ' + (mon.hitbox.height <= 1 ? '1' : (Number.isInteger(mon.hitbox.height) ? mon.hitbox.height + 1 : Math.ceil(mon.hitbox.height))) + ' block(s) high')">
                📦 Hitbox: {{ mon.hitbox.width }}×{{ mon.hitbox.height }}{{ mon.hitbox.fixed ? (lang === 'fr' ? ' (fixe)' : ' (fixed)') : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats & Info Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Base Stats -->
        <div class="info-box">
          <div class="info-box-header">
            <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            {{ lang === 'fr' ? 'Stats de Base' : 'Base Stats' }}
          </div>
          <div class="space-y-3">
            <div v-for="(v,k) in (mon.baseStats||{})" :key="k">
              <div class="flex justify-between text-sm mb-1">
                <span class="capitalize text-[var(--text-muted)]">{{ tStat(k) }}</span>
                <span class="font-mono font-semibold text-[var(--text)]">{{ v }}</span>
              </div>
              <div class="stat-bar">
                <div class="stat-bar-fill" :class="getStatClass(k)" :style="{ width: getStatPercent(v) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Abilities & Egg Groups -->
        <div class="space-y-6">
          <div class="info-box">
            <div class="info-box-header">
              <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              {{ lang === 'fr' ? 'Talents' : 'Abilities' }}
            </div>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(ab, idx) in (mon.abilities||[])" 
                :key="idx" 
                class="chip"
                :class="ab?.hidden ? 'chip-primary' : 'chip-neutral'"
                :title="ab?.hidden ? (lang === 'fr' ? 'Talent Caché' : 'Hidden Ability') : (lang === 'fr' ? 'Talent Normal' : 'Normal Ability')"
              >
                <template v-if="ab?.hidden">🔒 </template>
                {{ displayAbility(ab) }}
                <span v-if="ab?.hidden" class="text-xs ml-1 opacity-75">{{ lang === 'fr' ? '(Caché)' : '(Hidden)' }}</span>
              </span>
            </div>
          </div>

          <div class="info-box">
            <div class="info-box-header">
              <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              {{ lang === 'fr' ? "Groupes d'Œufs" : 'Egg Groups' }}
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="eg in (mon.eggGroups||[])" :key="eg" class="chip chip-success">
                {{ tEggGroup(eg) }}
              </span>
            </div>
          </div>

          <div class="info-box">
            <div class="info-box-header">
              <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              {{ lang === 'fr' ? 'EVs donnés' : 'EV Yield' }}
            </div>
            <div class="flex flex-wrap gap-2">
              <template v-for="(v,k) in (mon.evYield||{})" :key="k">
                <span v-if="v > 0" class="chip chip-primary">
                  {{ tStat(k) }}: +{{ v }}
                </span>
              </template>
            </div>
          </div>
          
          <!-- Hitbox / Taille de spawn -->
          <div class="info-box">
            <div class="info-box-header">
              <span class="text-lg">📦</span>
              {{ lang === 'fr' ? 'Hitbox (Taille de Spawn)' : 'Hitbox (Spawn Size)' }}
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Dimensions:' : 'Dimensions:' }}</span>
                <span class="font-semibold text-[var(--text)]">
                  {{ mon.hitbox ? (mon.hitbox.width + ' × ' + mon.hitbox.height) : '1 × 1' }} {{ lang === 'fr' ? 'blocs' : 'blocks' }}
                </span>
                <span v-if="!mon.hitbox" class="chip chip-success text-xs">{{ lang === 'fr' ? 'Par défaut' : 'Default' }}</span>
                <span v-if="mon.hitbox?.fixed" class="chip chip-warning text-xs">{{ lang === 'fr' ? 'Taille fixe' : 'Fixed size' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Hauteur requise:' : 'Required height:' }}</span>
                <span class="font-semibold" :class="(mon.hitbox?.height || 1) <= 1 ? 'text-green-400' : (mon.hitbox?.height || 1) <= 2 ? 'text-yellow-400' : 'text-red-400'">
                  {{ (mon.hitbox?.height || 1) <= 1 ? (lang === 'fr' ? '1 bloc' : '1 block') : (Number.isInteger(mon.hitbox?.height) ? (mon.hitbox.height + 1) : Math.ceil(mon.hitbox?.height || 1)) + (lang === 'fr' ? ' blocs' : ' blocks') }}
                </span>
                <span v-if="(mon.hitbox?.height || 1) <= 1" class="text-green-400 text-sm">{{ lang === 'fr' ? '✓ Peut spawner dans un espace de 1 bloc!' : '✓ Can spawn in 1 block space!' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Drops -->
      <div v-if="mon.drops && (mon.drops.entries?.length || mon.drops.amount!=null)" class="info-box">
        <div class="info-box-header">
          <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          Drops
        </div>
        <div v-if="mon.drops.amount!=null" class="text-sm text-[var(--text-muted)] mb-2">{{ lang === 'fr' ? 'Quantité moyenne:' : 'Average amount:' }} {{ mon.drops.amount }}</div>
        <div v-if="mon.drops.entries?.length" class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div v-for="d in mon.drops.entries" :key="d.item" class="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-hover)]">
            <span class="text-lg">📦</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-[var(--text)] truncate">{{ displayItem(d) }}</div>
              <div class="text-xs text-[var(--text-muted)]">
                <span v-if="d.quantityRange">{{ d.quantityRange }}</span>
                <span v-if="d.percentage!=null"> • {{ d.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Moves -->
      <details class="info-box group" open>
        <summary class="info-box-header cursor-pointer list-none">
          <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {{ lang === 'fr' ? 'Attaques' : 'Moves' }}
          <svg class="w-4 h-4 ml-auto transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </summary>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <h5 class="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              {{ lang === 'fr' ? 'Par niveau' : 'By Level' }}
            </h5>
            <ul class="space-y-1 text-sm max-h-48 overflow-y-auto">
              <li v-for="(m, idx) in groupMoves(mon.moves).level" :key="'lvl-'+idx" class="text-[var(--text-muted)]">
                <span class="font-mono text-xs text-[var(--primary)] mr-1">{{ m.level }}</span> {{ displayMove(m) }}
              </li>
            </ul>
          </div>
          <div>
            <h5 class="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-pink-500"></span>
              {{ lang === 'fr' ? 'Par œuf' : 'Egg Moves' }}
            </h5>
            <ul class="space-y-1 text-sm max-h-48 overflow-y-auto">
              <li v-for="(m, idx) in groupMoves(mon.moves).egg" :key="'egg-'+idx" class="text-[var(--text-muted)]">{{ displayMove(m) }}</li>
            </ul>
          </div>
          <div>
            <h5 class="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              {{ lang === 'fr' ? 'CT/CS' : 'TM/HM' }}
            </h5>
            <ul class="space-y-1 text-sm max-h-48 overflow-y-auto">
              <li v-for="(m, idx) in groupMoves(mon.moves).tm" :key="'tm-'+idx" class="text-[var(--text-muted)]">{{ displayMove(m) }}</li>
            </ul>
          </div>
          <div>
            <h5 class="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-purple-500"></span>
              {{ lang === 'fr' ? 'Tuteur' : 'Tutor' }}
            </h5>
            <ul class="space-y-1 text-sm max-h-48 overflow-y-auto">
              <li v-for="(m, idx) in groupMoves(mon.moves).tutor" :key="'tutor-'+idx" class="text-[var(--text-muted)]">{{ displayMove(m) }}</li>
            </ul>
          </div>
        </div>
      </details>

      <!-- Pre-Evolution -->
      <div v-if="preEvolution" class="info-box">
        <div class="info-box-header">
          <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M19 19l-7-7 7-7"></path>
          </svg>
          {{ lang === 'fr' ? 'Pré-évolution' : 'Pre-evolution' }}
        </div>
        <div class="mt-4">
          <a
            :href="'#/mon/'+encodeURIComponent(preEvolution.id)"
            @click.prevent="goMon(preEvolution.id)"
            class="pokemon-card p-4 flex items-center gap-4 group inline-flex">
            <div class="pokemon-sprite w-16 h-16 flex items-center justify-center shrink-0">
              <img v-if="preEvolution._sprite" :src="preEvolution._sprite" class="w-12 h-12 object-contain group-hover:scale-110 transition-transform" alt="" />
              <span v-else class="text-2xl">❓</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                {{ preEvolution._target ? tName(preEvolution._target.id) : preEvolution.id }}
              </div>
              <div class="text-xs text-[var(--text-muted)]">
                {{ lang === 'fr' ? 'Évolue en' : 'Evolves into' }} {{ tName(mon.id) }}
              </div>
            </div>
            <svg class="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Evolutions -->
      <div v-if="evolutions.length" class="info-box">
        <div class="info-box-header">
          <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
          </svg>
          {{ lang === 'fr' ? 'Évolutions' : 'Evolutions' }}
        </div>
        <div class="grid grid-cols-1 gap-4 mt-4">
          <a v-for="(e,i) in evolutions"
            :key="i"
            :href="e._targetId ? '#/mon/'+encodeURIComponent(e._targetId) : '#/dex'"
            @click.prevent="goMon(e._targetId)"
            class="pokemon-card p-4 flex items-start gap-4 group">
            <div class="pokemon-sprite w-20 h-20 flex items-center justify-center shrink-0">
              <img v-if="e._sprite" :src="e._sprite" class="w-16 h-16 object-contain group-hover:scale-110 transition-transform" alt="" />
              <span v-else class="text-3xl">❓</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-lg text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  {{ e._target ? tName(e._target.id) : e.result }}
                </span>
                <span class="chip chip-primary text-xs">{{ formatEvoVariant(e.variant) }}</span>
              </div>
              
              <!-- Contexte requis -->
              <div v-if="e.requiredContext" class="text-xs text-[var(--text-muted)] mb-2">
                📍 {{ lang === 'fr' ? 'Contexte' : 'Context' }}: {{ e.requiredContext }}
              </div>
              
              <!-- Requirements -->
              <div v-if="(Array.isArray(e.requirements) ? e.requirements : [e.requirements]).filter(Boolean).length" class="mb-2">
                <div class="text-xs text-[var(--text-muted)] mb-1">{{ lang === 'fr' ? '📋 Conditions:' : '📋 Requirements:' }}</div>
                <div class="flex flex-wrap gap-1">
                  <template
                    v-for="r in (Array.isArray(e.requirements) ? e.requirements : [e.requirements]).filter(Boolean)"
                    :key="JSON.stringify(r)"
                  >
                    <a
                      v-if="isBiomeReq(r)"
                      :href="biomeHref(r)"
                      @click.stop
                      class="chip hover:underline"
                      :class="r.biomeAnticondition ? 'chip-danger' : 'chip-success'"
                    >
                      {{ biomePrefix(r) }} {{ biomeShort(r) }}
                    </a>
                    <span v-else class="chip chip-neutral">
                      {{ evolRequirementText(r) }}
                    </span>
                  </template>
                </div>
              </div>
              
              <!-- Learnable Moves -->
              <div v-if="e.learnableMoves && e.learnableMoves.length" class="mb-2">
                <div class="text-xs text-[var(--text-muted)] mb-1">✨ {{ lang === 'fr' ? 'Apprend:' : 'Learns:' }}</div>
                <div class="flex flex-wrap gap-1">
                  <span v-for="move in e.learnableMoves" :key="move" class="chip chip-success text-xs">
                    {{ displayMove({ id: move, nameFr: move }) }}
                  </span>
                </div>
              </div>
              
              <!-- Consume Held Item -->
              <div v-if="e.consumeHeldItem" class="text-xs text-amber-500">
                ⚠️ {{ lang === 'fr' ? 'Consomme l\\'objet tenu' : 'Consumes held item' }}
              </div>
            </div>
            <svg class="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Spawns -->
      <div class="info-box">
        <div class="info-box-header">
          <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          {{ lang === 'fr' ? 'Spawns' : 'Spawns' }} ({{ flatSpawns(mon).length }})
        </div>

        <div v-if="flatSpawns(mon).length === 0" class="text-center py-8 text-[var(--text-muted)]">
          <span class="text-4xl mb-2 block">🚫</span>
          {{ lang === 'fr' ? 'Aucun spawn configuré pour ce Pokémon' : 'No spawns configured for this Pokémon' }}
        </div>

        <div v-else class="space-y-3 mt-4">
          <div
            v-for="(d, i) in flatSpawns(mon)"
            :key="i"
            class="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)]"
          >
            <!-- Source -->
            <div v-if="d.source" class="text-xs text-[var(--text-muted)] mb-2 font-mono truncate">
              {{ d.source }}
            </div>

            <!-- Chips row -->
            <div class="flex flex-wrap gap-2 items-center mb-3">
              <a
                v-for="p in (d.presets || [])"
                :key="p"
                @click.prevent="goPreset(p)"
                :href="'#/preset/' + encodeURIComponent(p)"
                class="chip chip-primary hover:underline"
              >
                📋 {{ p }}
              </a>
              <span v-for="c in (d.contexts || [])" :key="c" class="chip chip-neutral">
                {{ c }}
              </span>
              <span v-if="d.spawnType" class="chip chip-neutral">
                🎯 {{ d.spawnType }}
              </span>
              <span v-for="t in (d.times || [])" :key="t" class="chip chip-neutral">
                {{ formatTime(t) }}
              </span>
              <span v-if="d.rarity" class="chip chip-success ml-auto">
                {{ d.rarity }}
              </span>
            </div>

            <!-- Biomes -->
            <div class="flex flex-wrap gap-2 mb-2">
              <a
                v-for="b in ((d.biomeTags && d.biomeTags.include) || [])"
                :key="'i' + b"
                @click.prevent="goBiome(b)"
                :href="'#/biome/' + encodeURIComponent(b)"
                class="chip chip-success hover:underline"
              >
                🌍 {{ b }}
              </a>
              <a
                v-for="b in ((d.biomeTags && d.biomeTags.exclude) || [])"
                :key="'e' + b"
                @click.prevent="goBiome(b)"
                :href="'#/biome/' + encodeURIComponent(b)"
                class="chip chip-danger hover:underline"
              >
                🚫 {{ b }}
              </a>
            </div>

            <!-- Niveaux et poids -->
            <div v-if="d.levels || d.weight" class="flex flex-wrap gap-2 mb-2">
              <span v-if="d.levels" class="chip bg-blue-500/20 text-blue-400">
                📊 {{ lang === 'fr' ? 'Lvl' : 'Lvl' }} {{ d.levels }}
              </span>
              <span v-if="d.weight" class="chip bg-purple-500/20 text-purple-400">
                ⚖️ {{ lang === 'fr' ? 'Poids:' : 'Weight:' }} {{ d.weight }}
              </span>
            </div>

            <!-- Conditions détaillées -->
            <div class="flex flex-wrap gap-2 mb-2">
              <!-- Lumière du ciel -->
              <span v-if="d.sky && (d.sky.minSkyLight !== undefined || d.sky.maxSkyLight !== undefined)" class="chip bg-yellow-500/20 text-yellow-400">
                ☀️ {{ lang === 'fr' ? 'Ciel:' : 'Sky:' }} {{ d.sky.minSkyLight ?? 0 }}-{{ d.sky.maxSkyLight ?? 15 }}
              </span>
              <span v-if="d.sky && d.sky.canSeeSky !== undefined" class="chip" :class="d.sky.canSeeSky ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-400'">
                {{ d.sky.canSeeSky ? (lang === 'fr' ? '🌤️ Voir le ciel' : '🌤️ Can see sky') : (lang === 'fr' ? '🏚️ Sans ciel' : '🏚️ No sky') }}
              </span>
              
              <!-- Lumière des blocs -->
              <span v-if="d.light && (d.light.minLight !== undefined || d.light.maxLight !== undefined)" class="chip bg-amber-500/20 text-amber-400">
                💡 {{ lang === 'fr' ? 'Lumière:' : 'Light:' }} {{ d.light.minLight ?? 0 }}-{{ d.light.maxLight ?? 15 }}
              </span>
              
              <!-- Phase de lune -->
              <span v-if="d.moonPhase !== undefined" class="chip bg-indigo-500/20 text-indigo-400">
                🌙 {{ lang === 'fr' ? 'Lune:' : 'Moon:' }} {{ d.moonPhase === 0 ? (lang === 'fr' ? 'Pleine' : 'Full') : d.moonPhase === 4 ? (lang === 'fr' ? 'Nouvelle' : 'New') : (lang === 'fr' ? 'Phase ' : 'Phase ') + d.moonPhase }}
              </span>
              
              <!-- Météo -->
              <span v-if="d.weather && d.weather.isRaining" class="chip bg-blue-500/20 text-blue-400">
                🌧️ {{ lang === 'fr' ? 'Pluie' : 'Rain' }}
              </span>
              <span v-if="d.weather && d.weather.isThundering" class="chip bg-violet-500/20 text-violet-400">
                ⛈️ {{ lang === 'fr' ? 'Orage' : 'Thunder' }}
              </span>
              
              <!-- Niveau Y -->
              <span v-if="d.yLevel && (d.yLevel.minY !== undefined || d.yLevel.maxY !== undefined)" class="chip bg-stone-500/20 text-stone-400">
                📏 Y: {{ d.yLevel.minY ?? '-∞' }} → {{ d.yLevel.maxY ?? '+∞' }}
              </span>
              
              <!-- Niveau X (si défini) -->
              <span v-if="d.xLevel && (d.xLevel.minX !== undefined || d.xLevel.maxX !== undefined)" class="chip bg-stone-500/20 text-stone-400">
                ↔️ X: {{ d.xLevel.minX ?? '-∞' }} → {{ d.xLevel.maxX ?? '+∞' }}
              </span>
              
              <!-- Fluide / Submersion -->
              <span v-if="d.fluid" class="chip bg-cyan-500/20 text-cyan-400">
                💧 {{ d.fluid }}
              </span>
              <span v-if="d.isSubmerged" class="chip bg-blue-600/20 text-blue-300">
                🤿 Sous l'eau
              </span>
              
              <!-- Chunk Slime -->
              <span v-if="d.isSlimeChunk" class="chip bg-lime-500/20 text-lime-400">
                🟢 Chunk Slime
              </span>
              <span v-if="d.excludeSlimeChunk" class="chip bg-lime-500/20 text-lime-400 line-through">
                🚫 Pas Chunk Slime
              </span>
              
              <!-- Weight Multiplier -->
              <span v-if="d.weightMultiplier" class="chip bg-purple-500/20 text-purple-400">
                ⚡ x{{ d.weightMultiplier.multiplier }} {{ d.weightMultiplier.condition?.timeRange ? '(' + d.weightMultiplier.condition.timeRange + ')' : '' }}
              </span>
            </div>

            <!-- 🧱 Blocs requis -->
            <div v-if="d.baseBlocks || d.nearbyBlocks" class="flex flex-wrap gap-2 mb-2">
              <div v-if="d.baseBlocks" class="w-full">
                <span class="text-xs text-[var(--text-muted)]">🧱 Base:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="b in (d.baseBlocks.selectors || [])" :key="'base-' + b" class="chip bg-orange-500/20 text-orange-400 text-xs">
                    {{ b }}
                  </span>
                </div>
              </div>
              <div v-if="d.nearbyBlocks" class="w-full">
                <span class="text-xs text-[var(--text-muted)]">📍 Proximité:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="b in (d.nearbyBlocks.selectors || [])" :key="'near-' + b" class="chip bg-amber-500/20 text-amber-400 text-xs">
                    {{ b }}
                  </span>
                </div>
              </div>
              <div v-if="d.excludeNearbyBlocks" class="w-full">
                <span class="text-xs text-[var(--text-muted)]">🚫 Exclure:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="b in (d.excludeNearbyBlocks.selectors || d.excludeNearbyBlocks || [])" :key="'exnear-' + b" class="chip bg-red-500/20 text-red-400 text-xs line-through">
                    {{ b }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 🏛️ Structures -->
            <div v-if="(d.structures && d.structures.length) || (d.excludeStructures && d.excludeStructures.length)" class="flex flex-wrap gap-2 mb-2">
              <span v-for="s in (d.structures || [])" :key="'struct-' + s" class="chip bg-rose-500/20 text-rose-400">
                🏛️ {{ s }}
              </span>
              <span v-for="s in (d.excludeStructures || [])" :key="'exstruct-' + s" class="chip bg-red-500/20 text-red-400 line-through">
                🚫 {{ s }}
              </span>
            </div>

            <!-- Dimensions -->
            <div v-if="(d.dimensions && d.dimensions.length) || (d.excludeDimensions && d.excludeDimensions.length)" class="flex flex-wrap gap-2 mb-2">
              <span v-for="dim in (d.dimensions || [])" :key="'dim-' + dim" class="chip bg-emerald-500/20 text-emerald-400">
                🌐 {{ dim }}
              </span>
              <span v-for="dim in (d.excludeDimensions || [])" :key="'exdim-' + dim" class="chip bg-red-500/20 text-red-400">
                🚫 {{ dim }}
              </span>
            </div>
            
            <!-- 🎣 Pêche (Lure/Rod/Bait) -->
            <div v-if="d.lure || d.excludeLure || d.rodType || d.bait" class="flex flex-wrap gap-2 mb-2">
              <span v-if="d.lure" class="chip bg-teal-500/20 text-teal-400">
                🎣 Leurre: {{ d.lure.minLureLevel ?? 0 }}-{{ d.lure.maxLureLevel ?? '∞' }}
              </span>
              <span v-if="d.excludeLure" class="chip bg-red-500/20 text-red-400 line-through">
                🚫 Leurre ≥{{ d.excludeLure.minLureLevel ?? 0 }}
              </span>
              <span v-if="d.rodType" class="chip bg-teal-500/20 text-teal-400">
                🎣 Canne: {{ d.rodType }}
              </span>
              <span v-if="d.bait" class="chip bg-teal-500/20 text-teal-400">
                🪱 Appât: {{ d.bait }}
              </span>
            </div>

            <!-- Key Item -->
            <div v-if="d.keyItem" class="mt-2">
              <span class="chip bg-red-600 text-white">🔑 {{ d.keyItem }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sources -->
      <details class="info-box">
        <summary class="info-box-header cursor-pointer list-none">
          <svg class="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Fichiers sources
          <svg class="w-4 h-4 ml-auto transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </summary>
        <ul class="mt-4 space-y-1 text-sm font-mono text-[var(--text-muted)]">
          <li v-for="(source, i) in mon.speciesSources" :key="i" class="truncate">
            {{ source }}
          </li>
        </ul>
      </details>
    </section>

    
    <section v-else class="animate-fadeIn">
      <button class="btn btn-secondary mb-6" @click="back">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{ lang === 'fr' ? 'Retour' : 'Back' }}
      </button>
      <div class="text-center py-20">
        <div class="w-20 h-20 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4 text-4xl">
          😕
        </div>
        <p v-if="loadErr" class="text-red-500 font-medium mb-2">{{ lang === 'fr' ? 'Erreur:' : 'Error:' }} {{ loadErr }}</p>
        <p v-else class="text-[var(--text-muted)]">{{ lang === 'fr' ? 'Pokémon non trouvé' : 'Pokémon not found' }}</p>
        <a class="btn btn-primary mt-4" href="#/dex">{{ lang === 'fr' ? 'Retour au Pokédex' : 'Back to Pokédex' }}</a>
      </div>
    </section>
  `,
};
