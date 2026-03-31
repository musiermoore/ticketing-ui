import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        titleKey: 'pages.home.title',
        descriptionKey: 'pages.home.subtitle',
      },
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
      props: { mode: 'login' },
      meta: {
        titleKey: 'pages.auth.loginTitle',
        descriptionKey: 'pages.auth.loginSubtitle',
      },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../views/AuthView.vue'),
      props: { mode: 'register' },
      meta: {
        titleKey: 'pages.auth.registerTitle',
        descriptionKey: 'pages.auth.registerSubtitle',
      },
    },
    {
      path: '/events/:id',
      name: 'event-details',
      component: () => import('../views/EventDetailsView.vue'),
      meta: {
        titleKey: 'pages.eventDetails.title',
        descriptionKey: 'pages.eventDetails.subtitle',
      },
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: () => import('../views/BookingsView.vue'),
      meta: {
        titleKey: 'pages.bookings.title',
        descriptionKey: 'pages.bookings.subtitle',
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        titleKey: 'pages.profile.title',
        descriptionKey: 'pages.profile.subtitle',
      },
    },
    {
      path: '/admin/venues',
      name: 'admin-venues',
      component: () => import('../views/AdminResourceView.vue'),
      props: {
        resource: 'venues',
      },
      meta: {
        requiresAdmin: true,
        titleKey: 'pages.admin.venues.title',
        descriptionKey: 'pages.admin.venues.subtitle',
      },
    },
    {
      path: '/admin/events',
      name: 'admin-events',
      component: () => import('../views/AdminResourceView.vue'),
      props: {
        resource: 'events',
      },
      meta: {
        requiresAdmin: true,
        titleKey: 'pages.admin.events.title',
        descriptionKey: 'pages.admin.events.subtitle',
      },
    },
    {
      path: '/admin/event-times',
      name: 'admin-event-times',
      component: () => import('../views/AdminResourceView.vue'),
      props: {
        resource: 'eventTimes',
      },
      meta: {
        requiresAdmin: true,
        titleKey: 'pages.admin.eventTimes.title',
        descriptionKey: 'pages.admin.eventTimes.subtitle',
      },
    },
    {
      path: '/admin/event-times/:id',
      name: 'admin-event-times-show',
      component: () => import('../views/AdminEventTimeShowView.vue'),
      meta: {
        requiresAdmin: true,
        titleKey: 'pages.admin.eventTimes.showTitle',
        descriptionKey: 'pages.admin.eventTimes.showSubtitle',
      },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminResourceView.vue'),
      props: {
        resource: 'users',
      },
      meta: {
        requiresAdmin: true,
        titleKey: 'pages.admin.users.title',
        descriptionKey: 'pages.admin.users.subtitle',
      },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) {
    return true
  }

  const auth = useAuthStore()

  await auth.initialize()

  if (!auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (!auth.isAdmin) {
    return { name: 'home' }
  }

  return true
})

export default router
