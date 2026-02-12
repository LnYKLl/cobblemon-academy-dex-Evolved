import { computed, ref, inject } from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";
import { flatSpawns, spriteFrom } from "../utils/helpers.js";
import { translatePokemonName, t, getCurrentLang } from "../utils/i18n.js";

export default {
  props: ["dex", "presets", "route", "sprites", "currentLang"],
  setup(props) {
    const i18n = inject("i18n", ref({}));
    const name = computed(() => props.route.param || "");
    const preset = computed(() => props.presets[name.value] || null);
    const speciesUsing = computed(() =>
      props.dex.filter((sp) =>
        flatSpawns(sp).some((d) => (d.presets || []).includes(name.value))
      )
    );
    const allNames = computed(() => Object.keys(props.presets || {}).sort());
    const back = () =>
      history.length > 1 ? history.back() : (location.hash = "#/preset");
    const goMon = (id) => (location.hash = `#/mon/${encodeURIComponent(id)}`);
    const sprite = (id) => spriteFrom(props.sprites, id);
    const tName = (id) => translatePokemonName(id, i18n.value, props.currentLang);

    return { name, preset, speciesUsing, allNames, back, goMon, sprite, tName, t, getCurrentLang };
  },
  template: `
    <section class="space-y-6 animate-fadeIn">
      <!-- Liste de tous les presets -->
      <div v-if="!name">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-[var(--text)] mb-2">📋 Presets de Spawn</h2>
          <p class="text-[var(--text-muted)]">Configurations de spawn prédéfinies</p>
        </div>
        <div class="glass-card rounded-2xl p-6">
          <div class="flex flex-wrap gap-2">
            <a v-for="p in allNames" :key="p" :href="'#/preset/'+encodeURIComponent(p)" 
               class="chip chip-primary hover:scale-105 transition-transform">
              {{ p }}
            </a>
          </div>
        </div>
      </div>

      <!-- Détail d'un preset -->
      <div v-else>
        <button class="btn btn-secondary mb-4" @click="back">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Retour
        </button>

        <div class="glass-card rounded-2xl p-6 mb-6">
          <h2 class="text-2xl font-bold text-[var(--text)] mb-2">📋 {{ name }}</h2>
          <p class="text-[var(--text-muted)]">Preset de configuration de spawn</p>
        </div>

        <div v-if="preset" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="info-box">
            <div class="info-box-header">🎯 Contextes</div>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="c in (preset.contexts||[])" :key="c" class="chip chip-neutral">{{ c }}</span>
              <span v-if="!(preset.contexts||[]).length" class="text-[var(--text-muted)]">Aucun contexte</span>
            </div>
          </div>
          <div class="info-box lg:col-span-2">
            <div class="info-box-header">✅ Conditions</div>
            <pre class="text-xs text-[var(--text-muted)] whitespace-pre-wrap overflow-auto max-h-48 mt-2">{{ JSON.stringify(preset.conditions, null, 2) }}</pre>
          </div>
          <div class="info-box lg:col-span-3">
            <div class="info-box-header">❌ Anti-conditions</div>
            <pre class="text-xs text-[var(--text-muted)] whitespace-pre-wrap overflow-auto max-h-48 mt-2">{{ JSON.stringify(preset.anticonditions, null, 2) }}</pre>
          </div>
        </div>

        <!-- Pokémon utilisant ce preset -->
        <div v-if="speciesUsing.length" class="info-box mt-6">
          <div class="info-box-header">🔗 Pokémon utilisant ce preset ({{ speciesUsing.length }})</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            <div v-for="sp in speciesUsing" :key="sp.id" 
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
