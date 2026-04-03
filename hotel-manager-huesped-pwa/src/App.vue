<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Montserrat', -apple-system, sans-serif;
  background: #0A0A0A;
  color: #F5F0E8;
  line-height: 1.6;
  overscroll-behavior: none;
}

:root {
  --gold:        #C9A84C;
  --gold-light:  #E8C97A;
  --gold-dark:   #9A7A2E;
  --dark:        #0A0A0A;
  --dark-2:      #111111;
  --dark-3:      #1A1A1A;
  --dark-4:      #222222;
  --text:        #F5F0E8;
  --text-muted:  #8A8070;
  --text-dim:    #4A4540;
  --radius:      8px;
  --radius-lg:   14px;
  --shadow:      0 4px 20px rgba(0,0,0,0.4);
}

a { color: var(--gold); text-decoration: none; }
button { cursor: pointer; font-family: inherit; border: none; }
input, select, textarea { font-family: inherit; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 4px; }
</style>