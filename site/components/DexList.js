import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  inject,
} from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";
import { spriteFrom } from "../utils/helpers.js";
import { translatePokemonName, translateType, t, getCurrentLang, getPokemonNameFr, getPokemonNameEn } from "../utils/i18n.js";

export default {
  props: ["dex", "sprites", "currentLang"],
  setup(props) {
    const q = ref("");
    const type = ref("");
    const noSpawnsOnly = ref(false); // hidden filter flag
    const viewMode = ref("grid"); // grid or list
    const i18n = inject("i18n", ref({}));

    const types = computed(() => {
      const set = new Set();
      for (const sp of props.dex) {
        if (sp.primaryType) set.add(sp.primaryType);
        if (sp.secondaryType) set.add(sp.secondaryType);
      }
      return [...set].sort((a, b) => a.localeCompare(b));
    });

    // --- Hidden URL param support: #/<path>?nos=1
    const parseNosFromHash = () => {
      const hash = location.hash.startsWith("#")
        ? location.hash.slice(1)
        : location.hash;
      const [, qs = ""] = hash.split("?");
      const sp = new URLSearchParams(qs);
      const v = (sp.get("nos") || "").toLowerCase();
      return v === "1" || v === "true" || v === "yes";
    };
    const setHashParam = (key, value) => {
      const hash = location.hash.startsWith("#")
        ? location.hash.slice(1)
        : location.hash;
      const [path, qs = ""] = hash.split("?");
      const sp = new URLSearchParams(qs);
      if (!value) sp.delete(key);
      else sp.set(key, "1");
      const qstr = sp.toString();
      location.hash = `#${path}${qstr ? "?" + qstr : ""}`;
    };

    // initialize from hash (optional)
    onMounted(() => {
      try {
        noSpawnsOnly.value = parseNosFromHash();
      } catch {}
    });
    // keep URL in sync (optional)
    watch(noSpawnsOnly, (v) => setHashParam("nos", v), { flush: "post" });

    // --- Keyboard toggle: press "N"
    let keyHandler = null;
    onMounted(() => {
      keyHandler = (e) => {
        const tag = (document.activeElement?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || e.isComposing) return;
        if (
          e.key?.toLowerCase() === "n" &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey
        ) {
          noSpawnsOnly.value = !noSpawnsOnly.value;
        }
      };
      window.addEventListener("keydown", keyHandler);
    });
    onBeforeUnmount(() => {
      if (keyHandler) window.removeEventListener("keydown", keyHandler);
    });

    const filtered = computed(() =>
      props.dex
        .filter((sp) => {
          const searchTerm = q.value.toLowerCase();
          // Recherche bilingue: cherche en FR et EN
          const nameEn = getPokemonNameEn(sp.id)?.toLowerCase() || '';
          const nameFr = getPokemonNameFr(sp.id, i18n.value)?.toLowerCase() || '';
          const idLower = sp.id.toLowerCase();
          return nameEn.includes(searchTerm) || nameFr.includes(searchTerm) || idLower.includes(searchTerm);
        })
        .filter(
          (sp) =>
            !type.value ||
            sp.primaryType === type.value ||
            sp.secondaryType === type.value
        )
        .filter((sp) => !noSpawnsOnly.value || (sp.spawnCount ?? 0) === 0)
        .sort((a, b) => (a.dexnum ?? 9999) - (b.dexnum ?? 9999))
    );

    const goto = (sp) => (location.hash = `#/mon/${encodeURIComponent(sp.id)}`);
    const sprite = (id) => spriteFrom(props.sprites, id);
    
    const getTypeClass = (typeName) => {
      if (!typeName) return '';
      return 'type-' + typeName.toLowerCase();
    };
    
    // Translation helpers - use props.currentLang for reactivity
    const tName = (id) => translatePokemonName(id, i18n.value, props.currentLang);
    const tType = (tp) => translateType(tp, i18n.value);

    return { q, type, types, noSpawnsOnly, filtered, goto, sprite, viewMode, getTypeClass, tName, tType, t, getCurrentLang };
  },
  template: `
    <section class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-[var(--text)] mb-2">📖 Pokédex</h2>
        <p class="text-[var(--text-muted)]">{{ getCurrentLang() === 'fr' ? 'Explorez tous les Pokémon disponibles sur Cobblemon Academy' : 'Explore all Pokémon available on Cobblemon Academy' }}</p>
      </div>

      <!-- Search & Filters Card -->
      <div class="glass-card rounded-2xl p-4 md:p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="relative md:col-span-2">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              v-model="q" 
              type="search" 
              :placeholder="t('search.pokemon')" 
              class="search-input pl-10"
            />
          </div>

          <!-- Type Filter -->
          <select v-model="type" class="styled-select">
            <option value="">{{ t('filter.all.types') }}</option>
            <option v-for="tp in types" :key="tp" :value="tp">{{ tType(tp) }}</option>
          </select>

          <!-- View Toggle & Stats -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
              <button 
                @click="viewMode = 'grid'" 
                class="p-2 rounded-md transition-colors"
                :class="viewMode === 'grid' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button 
                @click="viewMode = 'list'" 
                class="p-2 rounded-md transition-colors"
                :class="viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
            <span 
              class="text-sm font-medium px-3 py-1 rounded-full bg-[var(--primary)] text-white cursor-help"
              @click.alt="noSpawnsOnly = !noSpawnsOnly"
              :title="'Alt-click ou N pour filtrer • ' + (noSpawnsOnly ? 'Sans spawns ON' : 'Tous')"
            >
              {{ filtered.length }} / {{ dex.length }}
            </span>
          </div>
        </div>

        <!-- No Spawns indicator -->
        <div v-if="noSpawnsOnly" class="flex items-center gap-2 text-sm">
          <span class="px-3 py-1 rounded-full bg-red-500 bg-opacity-20 text-red-500 font-medium flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
            </svg>
            Filtre: Sans spawns uniquement
          </span>
          <button @click="noSpawnsOnly = false" class="text-[var(--text-muted)] hover:text-[var(--text)]">
            ✕ Retirer
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <div
          v-for="sp in filtered"
          :key="sp.id"
          class="pokemon-card p-4 flex flex-col items-center text-center group"
          @click="goto(sp)"
        >
          <!-- Sprite -->
          <div class="relative mb-3">
            <div class="pokemon-sprite w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
              <img 
                v-if="sprite(sp.id)" 
                :src="sprite(sp.id)" 
                loading="lazy" 
                class="w-12 h-12 md:w-16 md:h-16 object-contain group-hover:scale-110 transition-transform" 
                alt="" 
              />
              <span v-else class="text-2xl">❓</span>
            </div>
            <!-- Spawn badge -->
            <div 
              class="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              :class="(sp.spawnCount ?? 0) === 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'"
              :title="(sp.spawnCount ?? 0) + ' spawns'"
            >
              {{ sp.spawnCount ?? 0 }}
            </div>
          </div>

          <!-- Dex number -->
          <div class="text-xs text-[var(--text-muted)] font-mono mb-1">#{{ sp.dexnum ?? '—' }}</div>

          <!-- Name -->
          <div class="font-semibold text-[var(--text)] text-sm mb-2 truncate w-full">{{ tName(sp.id) }}</div>

          <!-- Types -->
          <div class="flex gap-1 flex-wrap justify-center">
            <span 
              v-if="sp.primaryType" 
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="getTypeClass(sp.primaryType)"
            >
              {{ tType(sp.primaryType) }}
            </span>
            <span 
              v-if="sp.secondaryType" 
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="getTypeClass(sp.secondaryType)"
            >
              {{ tType(sp.secondaryType) }}
            </span>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'" class="glass-card rounded-2xl overflow-hidden">
        <div class="divide-y divide-[var(--border)]">
          <div
            v-for="sp in filtered"
            :key="sp.id"
            class="p-4 flex items-center gap-4 hover:bg-[var(--surface-hover)] cursor-pointer transition-colors group"
            @click="goto(sp)"
          >
            <!-- Sprite -->
            <div class="pokemon-sprite w-12 h-12 flex items-center justify-center shrink-0">
              <img 
                v-if="sprite(sp.id)" 
                :src="sprite(sp.id)" 
                loading="lazy" 
                class="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
                alt="" 
              />
              <span v-else class="text-xl">❓</span>
            </div>

            <!-- Dex Number -->
            <div class="w-16 text-[var(--text-muted)] font-mono text-sm">#{{ sp.dexnum ?? '—' }}</div>

            <!-- Name & Types -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">{{ tName(sp.id) }}</div>
              <div class="flex gap-1 mt-1">
                <span 
                  v-if="sp.primaryType" 
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="getTypeClass(sp.primaryType)"
                >
                  {{ tType(sp.primaryType) }}
                </span>
                <span 
                  v-if="sp.secondaryType" 
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="getTypeClass(sp.secondaryType)"
                >
                  {{ tType(sp.secondaryType) }}
                </span>
              </div>
            </div>

            <!-- Spawn Count -->
            <div class="flex items-center gap-2">
              <span 
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="(sp.spawnCount ?? 0) === 0 ? 'bg-red-500 bg-opacity-20 text-red-500' : 'bg-green-500 bg-opacity-20 text-green-500'"
              >
                {{ sp.spawnCount ?? 0 }} spawn{{ (sp.spawnCount ?? 0) !== 1 ? 's' : '' }}
              </span>
            </div>

            <!-- Arrow -->
            <svg class="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filtered.length === 0" class="text-center py-12">
        <div class="w-20 h-20 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4 text-4xl">
          🔍
        </div>
        <h3 class="text-lg font-semibold text-[var(--text)] mb-2">Aucun Pokémon trouvé</h3>
        <p class="text-[var(--text-muted)]">Essayez une autre recherche ou modifiez les filtres</p>
      </div>
    </section>
  `,
};
