import type { RouteRecordRaw } from "vue-router";

// Rotas reais serão adicionadas nas etapas seguintes (login, rooms, bookings, calendar).
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [{ path: "", name: "home", component: () => import("@/pages/IndexPage.vue") }],
  },

  // Fallback 404
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/pages/IndexPage.vue"),
  },
];

export default routes;
