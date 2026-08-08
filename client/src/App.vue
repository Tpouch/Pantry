<template>
  <div v-if="!authenticated" id="login-view">
    <Login @authenticated="onAuthenticated" />
  </div>
  <div v-else id="layout">
    <nav class="toolbar">
      <div class="toolbar-logo">Pantry</div>
      <router-link to="/" class="btn btn-sm desktop-nav" :class="{ 'btn-active': $route.path === '/' }">⌂ Dashboard</router-link>
      <router-link to="/ingredients" class="btn btn-sm desktop-nav" :class="{ 'btn-active': $route.path === '/ingredients' }">⬡ Ingredients</router-link>
      <router-link to="/recipes" class="btn btn-sm desktop-nav" :class="{ 'btn-active': $route.path.startsWith('/recipes') }">⚙ Recipes</router-link>
      <router-link to="/cook-log" class="btn btn-sm desktop-nav" :class="{ 'btn-active': $route.path === '/cook-log' }">📋 Cook Log</router-link>
      <router-link to="/meal-plan" class="btn btn-sm desktop-nav" :class="{ 'btn-active': $route.path === '/meal-plan' }">📅 Plan</router-link>
      <button class="btn btn-sm logout-btn" @click="logout">🚪 Logout</button>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
    <nav class="mobile-nav">
      <router-link to="/" :class="{ active: $route.path === '/' }">
        <span class="nav-icon">⌂</span>
        <span class="nav-label">Dash</span>
      </router-link>
      <router-link to="/ingredients" :class="{ active: $route.path === '/ingredients' }">
        <span class="nav-icon">⬡</span>
        <span class="nav-label">Ingredients</span>
      </router-link>
      <router-link to="/recipes" :class="{ active: $route.path.startsWith('/recipes') }">
        <span class="nav-icon">⚙</span>
        <span class="nav-label">Recipes</span>
      </router-link>
      <router-link to="/cook-log" :class="{ active: $route.path === '/cook-log' }">
        <span class="nav-icon">📋</span>
        <span class="nav-label">Cook Log</span>
      </router-link>
      <router-link to="/meal-plan" :class="{ active: $route.path === '/meal-plan' }">
        <span class="nav-icon">📅</span>
        <span class="nav-label">Plan</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { apiCall } from './api'
import Login from './views/Login.vue'

export default {
  components: { Login },
  setup() {
    const authenticated = ref(false)

    const checkAuth = async () => {
      try {
        const response = await apiCall('/auth/status')
        authenticated.value = response.authenticated
      } catch (err) {
        authenticated.value = false
      }
    }

    const onAuthenticated = () => {
      authenticated.value = true
    }

    const logout = async () => {
      try {
        await apiCall('/auth/logout', 'POST')
        authenticated.value = false
      } catch (err) {
        console.error('Logout failed:', err)
      }
    }

    onMounted(() => {
      checkAuth()
      window.addEventListener('session-expired', () => {
        authenticated.value = false
      })
    })

    return { authenticated, onAuthenticated, logout }
  }
}
</script>

<style>
#login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
}

#layout { display: flex; flex-direction: column; height: 100vh; }
.toolbar {
  background: var(--header);
  border-bottom: 2px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo), 0 2px 6px rgba(0,0,0,0.6);
  display: flex; align-items: center; height: 42px; padding: 0 8px; gap: 2px; flex-shrink: 0;
}
.toolbar-logo {
  color: var(--text);
  font-weight: 700; font-size: 0.92rem;
  letter-spacing: 1px; text-transform: uppercase;
  padding: 0 12px 0 4px; margin-right: 6px; border-right: 1px solid var(--border-dim);
}
.toolbar a { text-decoration: none; }
.logout-btn {
  margin-left: auto;
}
.main-content { flex: 1; overflow: hidden; }

.mobile-nav { display: none; }

@media (max-width: 767px) {
  .desktop-nav { display: none !important; }
  .toolbar-logo { border-right: none; margin-right: 0; }

  #layout { padding-bottom: 56px; }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 56px;
    background: var(--header);
    border-top: 2px solid var(--border-dim);
    box-shadow: 0 -2px 8px rgba(0,0,0,0.6);
    z-index: 50;
  }
  .mobile-nav a {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: var(--text-dim);
    font-size: 0.6rem;
    gap: 2px;
    padding: 6px 4px;
    border-right: 1px solid var(--border-dim);
    transition: background 0.1s;
  }
  .mobile-nav a:last-child { border-right: none; }
  .mobile-nav a.active {
    color: var(--accent);
    background: rgba(224,160,32,0.08);
  }
  .mobile-nav .nav-icon { font-size: 1.25rem; line-height: 1; }
  .mobile-nav .nav-label { text-transform: uppercase; letter-spacing: 0.5px; }
}
</style>
