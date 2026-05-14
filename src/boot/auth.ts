import { defineBoot } from "#q-app/wrappers";
import { useAuthStore } from "@/features/auth/store/auth.store";

export default defineBoot(() => {
  useAuthStore().hydrate();
});
