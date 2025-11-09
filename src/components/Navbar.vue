<script setup>
import { ref, onMounted } from 'vue';
import { QBtn, QIcon, QAvatar, QToolbarTitle, QToolbar } from 'quasar';
import { useToast } from 'vue-toastification';

const toast = useToast()
const emit = defineEmits(['reset', 'import-names'])

function handleNew() {
    emit('reset')
    toast.success("Wheel has been reset to default state!", {
        icon: "🔄",
        timeout: 2000
    })
}

async function handleOpen() {
    try {
        const result = await window.ipcRenderer.importNamesFromXlsx()
        if (result.success) {
            emit('import-names', result.names)
            toast.success(`Imported ${result.names.length} names successfully!`, {
                icon: "📄",
                timeout: 3000
            })
        } else {
            toast.error(result.error || 'Failed to import names', {
                icon: "❌",
                timeout: 3000
            })
        }
    } catch (error) {
        toast.error('An error occurred while importing names', {
            icon: "❌",
            timeout: 3000
        })
    }
}

function toggleFullscreen() {
    window.ipcRenderer.send('toggle-fullscreen')
}
</script>

<template>
    <header class="q-header q-layout__section--marginal fixed-top">
            <div class="q-toolbar row no-wrap items-center header q-px-none" role="toolbar">
                <q-btn flat no-caps href="/" class="no-border-radius">
                    <q-avatar size="38px" class="q-mr-sm">
                        <img src="../assets/jonies-logo.jpg" alt="logo">
                    </q-avatar>
                    <q-toolbar-title class="text-weight-regular">
                        Jonie's Sizzlers and Roast
                    </q-toolbar-title>
                </q-btn>
                <div class="q-space"></div>
                <div class="toolbar">
                    <q-btn flat no-caps class="q-ml-sm" @click="handleNew">
                        <q-icon name="fas fa-file" class="q-mr-sm" />
                        <span>New</span>
                    </q-btn>
                    <q-btn flat no-caps class="q-ml-sm">
                        <q-icon name="fas fa-palette" class="q-mr-sm" />
                        <span>Customize</span>
                    </q-btn>
                    <q-btn flat no-caps class="q-ml-sm" @click="handleOpen">
                        <q-icon name="fas fa-folder-open" class="q-mr-sm" />
                        <span>Open</span>
                    </q-btn>
                    <q-btn flat no-caps class="q-ml-sm" @click="toggleFullscreen">
                        <q-icon name="fas fa-expand" class="q-mr-sm" />
                    </q-btn>
                </div>
            </div>
    </header>
</template>

<style>
.q-header {
    background: #0a0a0a !important;
}
.q-toolbar {
    color: white;
}
</style>