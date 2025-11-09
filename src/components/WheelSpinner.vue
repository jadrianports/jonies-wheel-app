<template>
  <div class="wheel-container q-pa-md column items-center">
  <div ref="wheelContainer" class="wheel-wrapper wheel-wrapper--responsive" style="position:relative;" @click="handleWheelClick">
      <!-- Overlaid pointer arrow -->
      <div class="pointer-overlay" style="
           position:absolute;
           top:0;
           left:50%;
           transform:translateX(-50%);
           width:0; height:0;
           border-left:20px solid transparent;
           border-right:20px solid transparent;
           border-top:30px solid black;
           z-index:10;
         "></div>
      <!-- Center logo -->
      <img :src="joniesLogo" alt="Jonies Logo" class="center-logo">
      <!-- The library will draw inside wheelContainer -->
    </div>
    <!-- Winner Modal -->
    <q-dialog v-model="showWinnerModal">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">We have a winner! 🎉</div>
        </q-card-section>

        <q-card-section class="text-center text-h5 q-pt-none">
          {{ currentWinner }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup @click="handleWinner" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
// import the library
import { Wheel } from 'spin-wheel';
import joniesLogo from '../assets/jonies-logo.jpg';

const wheelContainer = ref(null);
const showWinnerModal = ref(false);
const currentWinner = ref('');
const isSpinning = ref(false);
let wheel = null;
let idleAnimationId = null;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTick() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Define props for names and emits
const props = defineProps({
  names: {
    type: Array,
    default: () => [
      'Ali', 'Beatriz', 'Diya', 'Eric',
      'Fatima', 'Gabriel', 'George', 'Hanna'
    ]
  }
});

const emit = defineEmits(['winner-selected']);

// Function to truncate text
function truncateText(text, maxLength = 12) {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// Create a wheel configuration factory to ensure consistent settings
function createWheelConfig(items) {
  return {
    items,
    pointerAngle: 0,
    radius: 0.99,
    isInteractive: false,
    itemBackgroundColors: ['#a41f22','#ffffff','#f9ab17', '#ffffff','#ef4625', '#ffffff', '#f9ab17', '#ffffff'],
    borderWidth: 10,
    borderColor: '#a41f22',
    rotationSpeedMax: 500, // Higher initial speed for faster acceleration
    rotationResistance: -25, // Lower resistance for slower deceleration
    onCurrentIndexChange: event => {
      if (isSpinning.value) {
        playTick();
      }
    },
    onRest: event => {
      const idx = event.currentIndex;
      console.log('Wheel stopped at index:', idx);
      const group = items[idx].originalGroup;
      const winner = group[Math.floor(Math.random() * group.length)];
      console.log('Wheel stopped. Winner:', winner);
      currentWinner.value = winner;
      showWinnerModal.value = true;
      isSpinning.value = false;
    }
  };
}

// Convert names to entries format with truncation and grouping for performance
const entries = computed(() => {
  const maxVisibleSegments = 300;
  const visibleSegments = Math.min(maxVisibleSegments, props.names.length);
  const groupSize = Math.ceil(props.names.length / visibleSegments);
  const groups = [];
  for (let i = 0; i < props.names.length; i += groupSize) {
    groups.push(props.names.slice(i, i + groupSize));
  }
  return groups.map(group => ({
    label: (group.length === 1 && props.names.length < 100) ? truncateText(group[0]) : '',
    originalGroup: group // Keep group for random selection
  }));
});

function startIdleSpin() {
  if (idleAnimationId) return;
  const spinSpeed = 0.05; // Very slow rotation
  const animate = () => {
    if (wheel && !isSpinning.value && !showWinnerModal.value) {
      wheel.rotation += spinSpeed;
    }
    idleAnimationId = requestAnimationFrame(animate);
  };
  animate();
}

function stopIdleSpin() {
  if (idleAnimationId) {
    cancelAnimationFrame(idleAnimationId);
    idleAnimationId = null;
  }
}

onMounted(() => {
  wheel = new Wheel(wheelContainer.value, createWheelConfig(entries.value));
  startIdleSpin();
  // keyboard shortcut: Ctrl+Enter or Cmd+Enter to spin
  const keyHandler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      doSpin()
    }
  }
  window.addEventListener('keydown', keyHandler)

  // store handler for removal
  wheel._keyHandler = keyHandler
});

// Watch for changes in entries outside of onMounted
watch(entries, (newEntries) => {
  if (wheel) {
    console.log('Updating wheel with new entries:', newEntries);
    wheel.init(createWheelConfig(newEntries));
  }
}, { deep: true });

onBeforeUnmount(() => {
  // remove key handler if added
  if (wheel && wheel._keyHandler) {
    window.removeEventListener('keydown', wheel._keyHandler)
  }
  stopIdleSpin();
});

function handleWinner() {
  emit('winner-selected', currentWinner.value);
  currentWinner.value = '';
}

function doSpin() {
  if (!wheel || isSpinning.value) return
  // spin to random item:
  isSpinning.value = true
  wheel.spin(600);
  console.log("Wheel is now spinning!")
}

function handleWheelClick() {
  // allow clicking the wheel container to spin
  if (!isSpinning.value) doSpin()
}
</script>

<style scoped>
.wheel-wrapper--responsive {
  width: clamp(300px, 46vw, 1000px);
  height: clamp(300px, 46vw, 10000px);
  cursor: pointer;
}
.pointer-overlay {
  /* keep triangle pointer centered; scale borders slightly with viewport */
  border-left: calc(min(20px, 2vw)) solid transparent;
  border-right: calc(min(20px, 2vw)) solid transparent;
  border-top: calc(min(30px, 3vw)) solid black;
}
.center-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(120px, 15vw, 200px);
  height: clamp(120px, 15vw, 200px);
  z-index: 5;
  border-radius: 50%;
  object-fit: cover;

}
</style>
