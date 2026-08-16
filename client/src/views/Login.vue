<template>
  <div class="login-stage">
    <div class="login-card label-card">
      <h1 class="login-title">Pantry</h1>
      <p class="login-sub">Enter to see what's in stock</p>
      <form @submit.prevent="login">
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="login-input"
          autofocus
        />
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Logging in…' : 'Login' }}
        </button>
      </form>
      <p v-if="error" class="login-error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { apiCall } from '../api'

export default {
  name: 'Login',
  emits: ['authenticated'],
  setup(props, { emit }) {
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const login = async () => {
      error.value = ''
      loading.value = true

      try {
        const response = await apiCall('/auth/login', 'POST', { password: password.value })
        emit('authenticated')
      } catch (err) {
        error.value = err.message || 'Invalid password'
        password.value = ''
      } finally {
        loading.value = false
      }
    }

    return { password, loading, error, login }
  }
}
</script>

<style scoped>
.login-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg);
}

.login-card {
  width: 100%;
  max-width: 300px;
  padding: 32px 28px 28px;
}

.login-title {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 1.6rem;
  text-align: center;
  margin-bottom: 4px;
}

.login-sub {
  font-family: 'Special Elite', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-faint-on-label);
  text-align: center;
  margin-bottom: 22px;
}

.login-card form { display: flex; flex-direction: column; gap: 12px; }

.login-input {
  padding: 10px 12px;
  border: 1px solid var(--label-tab);
  background: var(--label-input);
  color: var(--ink);
  font-family: 'Karla', sans-serif;
  font-size: 0.95rem;
  border-radius: 1px;
}
.login-input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.login-btn {
  padding: 10px;
  background: var(--accent);
  color: var(--ink);
  border: none;
  font-family: 'Karla', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 1px;
}
.login-btn:hover:not(:disabled) { background: var(--accent-hover); }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.login-error {
  color: var(--red-on-label);
  text-align: center;
  margin-top: 14px;
  font-size: 0.85rem;
}
</style>
