import { defineRouter } from "#q-app/wrappers";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";

import routes from "./routes";
import { TOKEN_STORAGE_KEY } from "@/shared/http";

function hasValidToken(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(TOKEN_STORAGE_KEY));
}

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth === true);
    const authenticated = hasValidToken();

    if (requiresAuth && !authenticated) {
      return { name: "login", query: { redirect: to.fullPath } };
    }

    if (to.name === "login" && authenticated) {
      return { name: "rooms" };
    }

    return true;
  });

  return Router;
});
