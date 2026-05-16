import { defineBoot } from "#q-app/wrappers";
import { Quasar } from "quasar";
import langPtBr from "quasar/lang/pt-BR";

// Define globalmente o idioma do Quasar (afeta q-date, q-time, q-table, formatadores).
export default defineBoot(() => {
  Quasar.lang.set(langPtBr);
});
