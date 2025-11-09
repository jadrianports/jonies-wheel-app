 <!--Name List Text Box-->
 <template>
  <div class="right-column right-column--responsive" :style="{ background: 'white', borderRadius: '8px', position: isFullscreen ? 'fixed' : '' }">
    <div class="full-height full-height--responsive">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        align-tabs="justify"
        narrow-indicator
      >
      <q-tab name="entries" label="Entries">
        <q-badge color="grey-7" floating>{{ namesCount }}</q-badge>
      </q-tab>
      <q-tab name="results" label="Results">
        <q-badge color="grey-7" floating>{{ resultsCount }}</q-badge>
      </q-tab>
    </q-tabs>
  <q-tab-panels v-model="activeTab" animated class="shadow-2 flex-1 q-tab-panels--responsive">
        <q-tab-panel name="entries" class="q-pa-none">
          <div class="q-pa-sm">
            <div class="row q-col-gutter-sm q-mb-sm justify-end">
              <div class="col">
                <q-btn flat dense color="primary" icon="fas fa-random" label="Shuffle" @click="shuffleNames" />
              </div>
              <div class="col">
                <q-btn flat dense color="primary" icon="fas fa-sort-alpha-up" label="Sort" @click="sortNames" />
              </div>
            </div>
            <q-input
              v-model="namesText"
              type="textarea"
              filled
              class="no-border names-textarea"
              spellcheck="false"
              placeholder="Enter one name per line"
            />
          </div>
        </q-tab-panel>
        <q-tab-panel name="results">
          <div class="text-h6">Winners</div>
          <q-list separator>
            <q-item v-for="(result, index) in results" :key="index">
              <q-item-section>
                <q-item-label>{{ result.name }}</q-item-label>
                <q-item-label caption>Selected at {{ result.timestamp }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { QBtn, QTabs, QTab, QBadge } from 'quasar'

const isFullscreen = ref(false)

// Listen for fullscreen changes
onMounted(() => {
  window.ipcRenderer.onFullscreenChanged((fullscreen) => {
    isFullscreen.value = fullscreen
  })
})

const activeTab = ref('entries')
const namesCount = computed(() => namesText.value.split(/\r?\n/).filter(Boolean).length)
const namesText = ref(`Ali\nBeatriz\nDiya\nEric\nFatima\nGabriel\nGeorge\nHanna`)
const results = ref([])
const resultsCount = computed(() => results.value.length)

// Load saved data on component mount
onMounted(async () => {
  try {
    const response = await window.ipcRenderer.loadAppData()
    if (response.success) {
      namesText.value = response.data.namesText
      results.value = response.data.results
    }
  } catch (error) {
    console.error('Failed to load app data:', error)
  }
})

// Save data whenever namesText or results change
watch(namesText, async (newNamesText) => {
  await saveData()
}, { deep: true })

watch(results, async (newResults) => {
  await saveData()
}, { deep: true })

async function saveData() {
  try {
    await window.ipcRenderer.saveAppData({
      namesText: namesText.value,
      results: JSON.parse(JSON.stringify(results.value))
    })
  } catch (error) {
    console.error('Failed to save app data:', error)
  }
}

// Method to handle winner
function addWinner(winner) {
  // Remove winner from namesText
  const names = namesText.value.split(/\r?\n/).filter(Boolean)
  namesText.value = names.filter(name => name !== winner).join('\n')
  
  // Add to results
  results.value.push({ name: winner, timestamp: new Date().toLocaleTimeString() })
  
  // Switch to results tab
  activeTab.value = 'results'
}

// Emit names whenever they change
const emit = defineEmits(['update:names'])
const names = computed(() => namesText.value.split(/\r?\n/).filter(Boolean))

// Watch for changes in namesText and emit updates
watch(namesText, (newText) => {
  const newNames = newText.split(/\r?\n/).filter(Boolean)
  emit('update:names', newNames)
}, { immediate: true })

function shuffleNames() {
  let arr = namesText.value.split(/\r?\n/).filter(Boolean)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  namesText.value = arr.join('\n')
}
function sortNames() {
  let arr = namesText.value.split(/\r?\n/).filter(Boolean)
  arr.sort((a, b) => a.localeCompare(b))
  namesText.value = arr.join('\n')
}

function resetToDefault() {
  // Reset text to default names
  namesText.value = 'Ali\nBeatriz\nDiya\nEric\nFatima\nGabriel\nGeorge\nHanna'
  // Clear results
  results.value = []
  // Switch back to entries tab
  activeTab.value = 'entries'
}

function importNames(newNames) {
  // Clear existing names and set new ones, removing duplicates
  const uniqueNames = [...new Set(newNames)]
  // Update namesText
  namesText.value = uniqueNames.join('\n')
  // Switch to entries tab
  activeTab.value = 'entries'
}

// Expose methods to parent components
defineExpose({ addWinner, resetToDefault, importNames })
</script>

<style scoped>
.right-column {
  border: 1px solid rgba(0,0,0,0.12);
  width: 320px;
  top: 60px; /* adjust if navbar height differs */
  right: 20px;
  z-index: 10;
}
.q-input textarea {
  font-family: inherit;
  border: none;
  padding: 8px;
}

/* Make the names textarea fixed height and scrollable */
.names-textarea :deep(.q-field__control) {
  max-height: min(clamp(300px, 40vh, 640px), calc(100vh - 320px));
  overflow: auto;
}
.names-textarea textarea {
  height: min(clamp(260px, 36vh, 600px), calc(100vh - 360px));
  overflow-y: auto;
}
.right-column--responsive {
  /* min 260px width, responsive height */
  min-height: clamp(320px, 45vh, 760px);
}
.full-height--responsive {
  min-height: clamp(320px, 45vh, 760px);
  /* ensure the column never extends under a fixed header */
  max-height: calc(100vh - 140px);
  overflow: auto;
}
.q-tab-panels--responsive {
  min-height: clamp(300px, 42vh, 720px) !important;
  max-height: calc(100vh - 220px) !important;
  overflow: auto;
}
/* Responsive width for the right column */
.right-column--responsive {
  width: clamp(260px, 28vw, 380px);
}
.no-border :deep(.q-field__control) {
  border: none !important;
  border-radius: 0;
}
</style>