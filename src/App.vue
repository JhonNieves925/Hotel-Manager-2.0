<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  line-height: 1.6;
}

/* Variables globales de color */
:root {
  --color-primary:     #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-success:     #16a34a;
  --color-danger:      #dc2626;
  --color-warning:     #d97706;
  --color-gray-50:     #f8fafc;
  --color-gray-100:    #f1f5f9;
  --color-gray-200:    #e2e8f0;
  --color-gray-400:    #94a3b8;
  --color-gray-600:    #475569;
  --color-gray-800:    #1e293b;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --radius:    8px;
  --radius-lg: 12px;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, select, textarea {
  font-family: inherit;
}
</style>