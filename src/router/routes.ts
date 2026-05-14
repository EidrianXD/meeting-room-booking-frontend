import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: { requiresAuth: false },
  },

  {
    path: "/",
    component: () => import("@/layouts/AuthenticatedLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: { name: "rooms" } },
      {
        path: "rooms",
        name: "rooms",
        component: () => import("@/pages/RoomsPage.vue"),
      },
      {
        path: "bookings",
        name: "bookings",
        component: () => import("@/pages/BookingsPage.vue"),
      },
      {
        path: "calendar",
        name: "calendar",
        component: () => import("@/pages/CalendarPage.vue"),
      },
    ],
  },

  {
    path: "/:catchAll(.*)*",
    redirect: { name: "rooms" },
  },
];

export default routes;
