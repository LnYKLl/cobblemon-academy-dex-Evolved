import {
  createApp,
  ref,
  reactive,
  computed,
  onMounted,
  provide, // ⟵ add
} from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";
import DexList from "./components/DexList.js";
import MonPage from "./components/MonPage.js";
import PresetPage from "./components/PresetPage.js";
import BiomePage from "./components/BiomePage.js";
import DropsPage from "./components/DropsPage.js";
import SnackPage from "./components/SnackPage.js";
import { parseRoute } from "./utils/helpers.js";
import { loadTranslations, getTranslations, getCurrentLang, setLanguage, t } from "./utils/i18n.js";

createApp({
  components: { DexList, MonPage, PresetPage, BiomePage, DropsPage, SnackPage },
  setup() {
    const dex = ref([]); // now a lean index
    const presets = ref({});
    const biomes = ref({ tags: {}, resolved: {}, all_biomes: [] });
    const sprites = ref({ images: {} });
    const dropsIndex = ref({ items: [] });
    const dropItems = computed(() => dropsIndex.value?.items ?? []);
    const loading = ref(true);
    const error = ref(null);
    const route = reactive(parseRoute());
    const i18n = ref({});
    const currentLang = ref('fr');
    
    // Language management
    const toggleLanguage = () => {
      const newLang = currentLang.value === 'fr' ? 'en' : 'fr';
      currentLang.value = newLang;
      setLanguage(newLang);
    };
    
    // Theme management
    const isDark = ref(document.documentElement.classList.contains("dark"));
    const toggleTheme = () => {
      isDark.value = !isDark.value;
      document.documentElement.classList.toggle("dark", isDark.value);
      localStorage.setItem("theme", isDark.value ? "dark" : "light");
    };

    // NEW: simple per-mon cache + loader
    const monCache = reactive(new Map());
    const CACHE_VERSION = '20260212d'; // Change this to bust cache
    const fetchJson = async (url) => {
      // Add cache-busting parameter to force reload
      const r = await fetch(url + '?v=' + CACHE_VERSION);
      if (!r.ok) throw new Error("Failed to load " + url);
      return r.json();
    };
    const getMon = async (id) => {
      // Clear cache if version changed
      const cacheKey = id + '_' + CACHE_VERSION;
      if (monCache.has(cacheKey)) return monCache.get(cacheKey);
      const data = await fetchJson(`./out/mons/${id}.json`);
      monCache.set(cacheKey, data);
      return data;
    };

    const currentView = computed(() => {
      const v = route.view;
      if (v === "mon") return "MonPage";
      if (v === "preset" || v === "presets") return "PresetPage";
      if (v === "biome" || v === "biomes") return "BiomePage";
      if (v === "drops") return "DropsPage";
      if (v === "snack") return "SnackPage";
      return "DexList";
    });

    const loadAll = async () => {
      try {
        const [d, p, b, s, di, i18nResult] = await Promise.all([
          fetchJson("./out/dex.json"), // ⟵ moved to /out
          fetchJson("./out/presets.json").catch(() => ({})), // ⟵ moved to /out
          fetchJson("./out/biomes.json").catch(() => ({
            tags: {},
            resolved: {},
            all_biomes: [],
          })), // ⟵ moved to /out
          fetchJson("./out/sprites.json").catch(() => ({ images: {} })), // ⟵ moved to /out
          fetchJson("./out/drops_index.json").catch(() => ({ items: [] })), // NEW
          loadTranslations(), // Load translations and detect language
        ]);
        dex.value = d;
        presets.value = p;
        biomes.value = b;
        sprites.value = s;
        dropsIndex.value = di; // NEW
        i18n.value = i18nResult?.translations || {};
        currentLang.value = i18nResult?.lang || 'fr';
        console.log("[main] dropsIndex loaded:", dropsIndex.value.items.length);
        console.log("[main] i18n loaded:", Object.keys(i18n.value).length, "keys");
      } catch (e) {
        error.value = String(e.message || e);
      } finally {
        loading.value = false;
      }
    };

    // make loader available to children (MonPage)
    provide("getMon", getMon);
    provide("monCache", monCache);
    provide("i18n", i18n);
    provide("currentLang", currentLang);
    provide("toggleLanguage", toggleLanguage);
    provide("t", t);

    onMounted(async () => {
      await loadAll();
      // optional: prefetch current mon if landing directly on a mon route
      if (route.view === "mon" && route.params?.id) {
        getMon(route.params.id).catch(() => {});
      }
      window.addEventListener("hashchange", () => {
        Object.assign(route, parseRoute());
        if (route.view === "mon" && route.params?.id) {
          getMon(route.params.id).catch(() => {});
        }
      });
    });

    return {
      dex,
      presets,
      biomes,
      sprites,
      dropsIndex,
      dropItems,
      loading,
      error,
      route,
      currentView,
      isDark,
      toggleTheme,
      currentLang,
      toggleLanguage,
      t,
      // optionally expose to components via props if you prefer props over provide/inject:
      getMon,
      monCache,
    };
  },
}).mount("#app");
