import { computed } from "vue";
import { useQuasar } from "quasar";

const STORAGE_KEY = "dark-mode";

export function useTheme() {
  const $q = useQuasar();

  const isDark = computed(() => $q.dark.isActive);

  function toggleDark() {
    $q.dark.toggle();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String($q.dark.isActive));
    }
  }

  function setDark(value: boolean | "auto") {
    $q.dark.set(value);
    if (typeof window !== "undefined") {
      if (value === "auto") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, String(value));
    }
  }

  return { isDark, toggleDark, setDark };
}
