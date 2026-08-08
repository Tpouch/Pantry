<template>
  <div v-if="!authenticated" id="login-view">
    <Login @authenticated="onAuthenticated" />
  </div>
  <div v-else id="layout">
    <nav class="toolbar">
      <div class="toolbar-logo">Pantry</div>
      <router-link to="/" class="tab desktop-nav" :class="{ active: $route.path === '/' }"><Icon name="home" />Dashboard</router-link>
      <router-link to="/ingredients" class="tab desktop-nav" :class="{ active: $route.path === '/ingredients' }"><Icon name="jar" />Ingredients</router-link>
      <router-link to="/recipes" class="tab desktop-nav" :class="{ active: $route.path.startsWith('/recipes') }"><Icon name="book" />Recipes</router-link>
      <router-link to="/cook-log" class="tab desktop-nav" :class="{ active: $route.path === '/cook-log' }"><Icon name="ribbon" />Cook Log</router-link>
      <router-link to="/meal-plan" class="tab desktop-nav" :class="{ active: $route.path === '/meal-plan' }"><Icon name="calendar" />Plan</router-link>
      <button class="btn btn-sm logout-btn" @click="logout">Log out</button>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
    <nav class="mobile-nav">
      <router-link to="/" :class="{ active: $route.path === '/' }">
        <Icon name="home" class="nav-icon" />
        <span class="nav-label">Dash</span>
      </router-link>
      <router-link to="/ingredients" :class="{ active: $route.path === '/ingredients' }">
        <Icon name="jar" class="nav-icon" />
        <span class="nav-label">Ingredients</span>
      </router-link>
      <router-link to="/recipes" :class="{ active: $route.path.startsWith('/recipes') }">
        <Icon name="book" class="nav-icon" />
        <span class="nav-label">Recipes</span>
      </router-link>
      <router-link to="/cook-log" :class="{ active: $route.path === '/cook-log' }">
        <Icon name="ribbon" class="nav-icon" />
        <span class="nav-label">Cook Log</span>
      </router-link>
      <router-link to="/meal-plan" :class="{ active: $route.path === '/meal-plan' }">
        <Icon name="calendar" class="nav-icon" />
        <span class="nav-label">Plan</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { apiCall } from './api'
import Login from './views/Login.vue'
import Icon from './components/Icon.vue'

export default {
  components: { Login, Icon },
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
  min-height: 100vh;
}

#layout { display: flex; flex-direction: column; height: 100vh; }
.toolbar {
  background: var(--header);
  border-bottom: 2px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo), 0 2px 6px rgba(0,0,0,0.5);
  display: flex; align-items: flex-end; height: 42px; padding: 0 8px; gap: 2px; flex-shrink: 0;
}
.toolbar-logo {
  color: var(--text);
  font-family: 'Fraunces', serif; font-weight: 700; font-size: 1rem;
  padding: 0 14px 8px 4px; margin-right: 6px; align-self: center;
}
.toolbar a.tab {
  text-decoration: none;
  background: var(--panel-alt);
  border: 1px solid var(--border-dim);
  border-bottom: none;
  color: var(--text-dim);
  font-size: 0.82rem;
  padding: 8px 14px 7px;
  display: inline-flex; align-items: center; gap: 6px;
  clip-path: polygon(0 100%, 0 8px, 8px 0, 100% 0, 100% 100%);
}
.toolbar a.tab.active {
  background: var(--label);
  color: var(--ink);
  font-weight: 700;
}
.logout-btn {
  margin-left: auto;
  align-self: center;
}
.main-content { flex: 1; overflow: hidden; border-top: 3px solid var(--label); }

.mobile-nav { display: none; }

@media (max-width: 767px) {
  .desktop-nav { display: none !important; }
  .toolbar-logo { margin-right: 0; }

  #layout { padding-bottom: 56px; }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 56px;
    background: var(--header);
    border-top: 2px solid var(--border-dim);
    box-shadow: 0 -2px 8px rgba(0,0,0,0.5);
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
    border-right: 1px dashed var(--border-dim);
    transition: background 0.1s;
  }
  .mobile-nav a:last-child { border-right: none; }
  .mobile-nav a.active {
    color: var(--accent);
    background: rgba(192,138,46,0.10);
  }
  .mobile-nav .nav-icon { font-size: 1.25rem; line-height: 1; }
  .mobile-nav .nav-label { text-transform: uppercase; letter-spacing: 0.5px; }
}
</style>
