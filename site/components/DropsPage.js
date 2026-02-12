import {
  ref,
  computed,
  onMounted,
  inject,
} from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";
import { spriteFrom } from "../utils/helpers.js";
import { translateItem, translatePokemonName, t, getCurrentLang } from "../utils/i18n.js";

export default {
  name: "DropsPage",
  props: {
    dropItems: { type: Array, default: () => [] }, // [{ item, mons:[{id,name,percentage,quantityRange,biomes,excludeBiomes}] }]
    sprites: { type: Object, default: () => ({ images: {} }) }, // NEW
    route: { type: Object, default: () => ({}) },
    currentLang: { type: String, default: 'fr' },
  },
  setup(props) {
    const q = ref("");
    const page = ref(1);
    const pageSize = ref(25);
    const i18n = inject("i18n", ref({}));

    const normalizeItemName = (id) => {
      if (!id) return "";
      // Try translation first
      const translated = translateItem(id);
      if (translated !== id.split(':').pop().replace(/_/g, ' ')) {
        return translated;
      }
      // Fallback to basic normalization
      const parts = id.split(":");
      const name = parts.length > 1 ? parts[1] : parts[0];
      return name.replace(/_/g, " ");
    };

    const tName = (id) => translatePokemonName(id, i18n.value, props.currentLang);

    const needle = computed(() => q.value.trim().toLowerCase());

    const filtered = computed(() => {
      const n = needle.value;
      if (!n) return props.dropItems;
      return props.dropItems.filter((it) => {
        const simple = normalizeItemName(it.item).toLowerCase();
        return (
          it.item.toLowerCase().includes(n) || simple.includes(n)
          /*
          ||
          it.mons?.some?.((m) =>
            (m.name || m.id || "").toLowerCase().includes(n)
          )
          */
        );
      });
    });

    const normalized = computed(() =>
      filtered.value.map((it) => {
        const rows = (it.mons || []).slice().sort((a, b) => {
          const ap = a.percentage ?? -1;
          const bp = b.percentage ?? -1;
          if (ap !== bp) return bp - ap;
          return (a.name || a.id).localeCompare(b.name || b.id);
        });
        return { ...it, mons: rows };
      })
    );

    const totalPages = computed(() =>
      Math.max(1, Math.ceil(normalized.value.length / pageSize.value))
    );

    const paged = computed(() => {
      const start = (page.value - 1) * pageSize.value;
      return normalized.value.slice(start, start + pageSize.value);
    });

    const goMon = (id) =>
      id && (location.hash = "#/mon/" + encodeURIComponent(id));
    const sprite = (id) => spriteFrom(props.sprites, id); // NEW

    onMounted(() => {
      console.log("[DropsPage] items at mount:", props.dropItems.length);
    });

    const fmtBiomes = (m) => {
      const inc =
        Array.isArray(m.biomes) && m.biomes.length
          ? `in ${m.biomes.join(", ")}`
          : "";
      const exc =
        Array.isArray(m.excludeBiomes) && m.excludeBiomes.length
          ? `not in ${m.excludeBiomes.join(", ")}`
          : "";
      return [inc, exc].filter(Boolean).join(" — ");
    };

    const hasBiomeInfo = (it) =>
      (it.mons || []).some(
        (m) =>
          (m.biomes && m.biomes.length) ||
          (m.excludeBiomes && m.excludeBiomes.length)
      );

    const highlight = (text) => {
      const n = needle.value;
      if (!n) return text;
      const re = new RegExp(
        `(${n.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`,
        "ig"
      );
      return String(text).replace(
        re,
        "<mark class='bg-yellow-200 text-black rounded px-0.5'>$1</mark>"
      );
    };

    return {
      q,
      page,
      pageSize,
      totalPages,
      paged,
      goMon,
      fmtBiomes,
      hasBiomeInfo,
      highlight,
      sprite,
      normalizeItemName,
      tName,
      t,
      getCurrentLang,
    };
  },
  template: `
    <section class="space-y-4">
      <!-- Controls -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <input v-model="q" type="search" :placeholder="t('search.item')"
               class="search-input" />
        <div class="text-sm text-[var(--text-muted)] md:col-span-2 md:justify-self-end md:text-right">
          {{ paged.length }} résultats sur {{ totalPages * pageSize }} (page {{ page }} / {{ totalPages }})
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center gap-2 text-sm">
        <button @click="page = Math.max(1, page-1)" :disabled="page===1"
                class="btn btn-secondary px-3 py-1 disabled:opacity-40">Préc.</button>
        <select v-model.number="page" class="styled-select py-1">
          <option v-for="p in totalPages" :key="p" :value="p">{{ p }}</option>
        </select>
        <button @click="page = Math.min(totalPages, page+1)" :disabled="page===totalPages"
                class="btn btn-secondary px-3 py-1 disabled:opacity-40">Suiv.</button>

        <div class="ml-auto flex items-center gap-2 text-[var(--text-muted)]">
          <span>Par page</span>
          <select v-model.number="pageSize" class="styled-select py-1">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Items -->
      <ul class="space-y-4">
        <li v-for="it in paged" :key="it.item" class="glass-card rounded-2xl overflow-hidden">
          <div class="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-hover)]">
            <h3 class="font-semibold text-[var(--text)]">
                <span v-html="highlight(normalizeItemName(it.item))"></span>
                <span class="ml-2 text-[var(--text-muted)] text-sm font-mono">{{ it.item }}</span>
            </h3>
           </div>

          <!-- Responsive table wrapper -->
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="[&>th]:px-4 [&>th]:py-2 text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th style="width: 36%">Pokémon</th>
                  <th style="width: 12%">Taux</th>
                  <th style="width: 14%">Quantité</th>
                  <th v-if="hasBiomeInfo(it)">Biomes</th>
                  <th style="width: 12%">Lien</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border)]">
                <tr v-for="m in (it.mons || [])" :key="m.id" class="[&>td]:px-4 [&>td]:py-2 hover:bg-[var(--surface-hover)] transition-colors">
                  <!-- Mon cell with sprite -->
                  <td class="flex items-center gap-3">
                    <div class="pokemon-sprite w-10 h-10 flex items-center justify-center shrink-0">
                      <img v-if="sprite(m.id)" :src="sprite(m.id)" loading="lazy" class="h-8 w-8 object-contain" alt="" />
                      <span v-else class="text-lg">❓</span>
                    </div>
                    <div>
                      <div class="font-medium text-[var(--text)]">{{ tName(m.id) }}</div>
                      <div class="text-xs text-[var(--text-muted)]" v-if="m.id">{{ m.id }}</div>
                    </div>
                  </td>

                  <td class="text-[var(--text)]">
                    <span v-if="m.percentage != null" class="chip chip-success">{{ m.percentage }}%</span>
                    <span v-else class="text-[var(--text-muted)]">—</span>
                  </td>

                  <td class="text-[var(--text)]">
                    <span v-if="m.quantityRange" class="chip chip-neutral">{{ m.quantityRange }}</span>
                    <span v-else class="text-[var(--text-muted)]">—</span>
                  </td>

                  <td v-if="hasBiomeInfo(it)" class="text-[var(--text-muted)]">
                    <div v-if="m.biomes && m.biomes.length" class="whitespace-pre-wrap text-green-500">
                      ✓ {{ m.biomes.join(", ") }}
                    </div>
                    <div v-if="m.excludeBiomes && m.excludeBiomes.length" class="text-red-500 whitespace-pre-wrap">
                      ✗ {{ m.excludeBiomes.join(", ") }}
                    </div>
                  </td>

                  <td>
                    <button @click="goMon(m.id)"
                      class="btn btn-primary px-3 py-1 text-sm">
                      Voir
                    </button>
                  </td>
                </tr>

                <tr v-if="(it.mons || []).length === 0">
                  <td colspan="5" class="px-4 py-6 text-center text-[var(--text-muted)]">Aucun Pokémon trouvé</td>
                </tr>
              </tbody>
            </table>
          </div>
        </li>
      </ul>
    </section>
  `,
};
