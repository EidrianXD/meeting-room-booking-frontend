import { defineBoot } from "#q-app/wrappers";
import { Dark } from "quasar";

const STORAGE_KEY = "dark-mode";

export default defineBoot(() => {
  if (typeof window === "undefined") return;

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "true") Dark.set(true);
  else if (saved === "false") Dark.set(false);
  else Dark.set("auto");
});
