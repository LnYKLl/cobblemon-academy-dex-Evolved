import { computed, ref, inject } from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";
import { flatSpawns, spriteFrom } from "../utils/helpers.js";
import { translatePokemonName, t, getCurrentLang } from "../utils/i18n.js";

export default {
  props: ["dex", "biomes", "route", "sprites", "currentLang"],
  setup(props) {
    const i18n = inject("i18n", ref({}));
    const tag = computed(() => props.route.param || "");
    const allTags = computed(() => Object.keys(props.biomes.tags || {}).sort());
    const resolved = computed(
      () => (props.biomes.resolved || {})[tag.value] || []
    );
    const rawVals = computed(() => (props.biomes.tags || {})[tag.value] || []);
    const usedBy = computed(() =>
      props.dex.filter((sp) =>
        flatSpawns(sp).some(
          (d) =>
            (d.biomeTags?.include || []).includes(tag.value) ||
            (d.biomeTags?.exclude || []).includes(tag.value)
        )
      )
    );
    const back = () =>
      history.length > 1 ? history.back() : (location.hash = "#/biome");
    const goMon = (id) => (location.hash = `#/mon/${encodeURIComponent(id)}`);
    const sprite = (id) => spriteFrom(props.sprites, id);
    const tName = (id) => translatePokemonName(id, i18n.value, props.currentLang);

    return { tag, allTags, resolved, rawVals, usedBy, back, goMon, sprite, tName, t, getCurrentLang };
  },
  template: `
    <section class="space-y-6 animate-fadeIn">
      <!-- Liste de tous les biomes -->
      <div v-if="!tag">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-[var(--text)] mb-2">🌍 Tags de Biomes</h2>
          <p class="text-[var(--text-muted)]">Explorez les différents tags de biomes configurés</p>
        </div>
        <div class="glass-card rounded-2xl p-6">
          <div class="flex flex-wrap gap-2">
            <a v-for="b in allTags" :key="b" :href="'#/biome/'+encodeURIComponent(b)" 
               class="chip chip-success hover:scale-105 transition-transform">
              {{ b }}
            </a>
          </div>
        </div>
      </div>

      <!-- Détail d'un biome -->
      <div v-else>
        <button class="btn btn-secondary mb-4" @click="back">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Retour
        </button>

        <div class="glass-card rounded-2xl p-6 mb-6">
          <h2 class="text-2xl font-bold text-[var(--text)] mb-2">🌍 {{ tag }}</h2>
          <p class="text-[var(--text-muted)]">Tag de biome</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="info-box">
            <div class="info-box-header">📋 Valeurs brutes</div>
            <pre class="text-xs text-[var(--text-muted)] whitespace-pre-wrap overflow-auto max-h-48">{{ JSON.stringify(rawVals, null, 2) }}</pre>
          </div>
          <div class="info-box">
            <div class="info-box-header">🗺️ Biomes résolus</div>
            <div class="flex flex-wrap gap-1">
              <span v-for="b in resolved" :key="b" class="chip chip-neutral text-xs">{{ b }}</span>
            </div>
          </div>
        </div>

        <!-- Pokémon utilisant ce biome -->
        <div v-if="usedBy.length" class="info-box mt-6">
          <div class="info-box-header">🔗 Pokémon dans ce biome ({{ usedBy.length }})</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            <div v-for="sp in usedBy" :key="sp.id" 
                 @click="goMon(sp.id)"
                 class="pokemon-card p-3 flex flex-col items-center text-center cursor-pointer group">
              <div class="pokemon-sprite w-12 h-12 flex items-center justify-center mb-2">
                <img v-if="sprite(sp.id)" :src="sprite(sp.id)" class="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="" />
                <span v-else class="text-xl">❓</span>
              </div>
              <div class="text-sm font-medium text-[var(--text)] truncate w-full">{{ tName(sp.id) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
};
