import { createRouter, createWebHistory } from "vue-router";
import Main from "@/views/main/Main.vue";
import Test from "@/views/main/components/Tester";

const routes = [
  {
    path: "/",
    name: "Main",
    component: Main,
  },
  {
    path: "/test",
    name: "Test",
    component: Test,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
