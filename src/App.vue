<template>
  <q-layout view="hHh lpR fFf">
    <Navbar @reset="resetWheel" @import-names="importNames" />
    <q-page-container class="full-width q-pa-none" style="padding-top: 5px;">
      <q-page class="flex flex-center">
        <div class="row no-wrap items-start q-gutter-xl justify-center" style="align-items:flex-start; margin-top:3px;">
          <div class="">
            <WheelSpinner :names="wheelNames" @winner-selected="handleWinner" />
          </div>
          <div class="">
            <NameList ref="nameList" @update:names="updateWheelNames" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script setup>
import { ref } from 'vue'
import { QLayout, QPageContainer, QPage } from 'quasar'
import WheelSpinner from './components/WheelSpinner.vue'
import Navbar from './components/Navbar.vue'
import NameList from './components/NameList.vue'

const nameList = ref(null)
const wheelNames = ref(['Ali', 'Beatriz', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'George', 'Hanna'])

function updateWheelNames(names) {
  console.log('Updating wheel names:', names)
  wheelNames.value = [...names] // Create a new array reference
}

function handleWinner(winner) {
  console.log('Winner selected:', winner)
  nameList.value?.addWinner(winner)
}

// Default names array
const defaultNames = ['Ali', 'Beatriz', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'George', 'Hanna']

function resetWheel() {
  // Reset wheel names to default
  wheelNames.value = [...defaultNames]
  // Reset namelist component
  nameList.value?.resetToDefault()
}

function importNames(names) {
  // Import names into the namelist component
  nameList.value?.importNames(names)
}
</script>
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.page-container {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
