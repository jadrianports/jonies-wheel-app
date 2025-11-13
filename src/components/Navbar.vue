<script setup>
import { ref, onMounted } from 'vue';
import { QBtn, QIcon, QAvatar, QToolbarTitle, QToolbar, QDialog, QCard, QCardSection, QCardActions } from 'quasar';
import { useToast } from 'vue-toastification';

const toast = useToast()
const emit = defineEmits(['reset', 'import-names'])
const showDialog = ref(false)

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

function handleClose() {
    showDialog.value = true
}

function confirmClose() {
    showDialog.value = false
    window.ipcRenderer.send('close-app')
}

function cancelClose() {
    showDialog.value = false
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
                        Jonies Sizzlers + Roast
                    </q-toolbar-title>
                </q-btn>
                <div class="q-space"></div>
                <div class="toolbar">
                    <q-btn flat no-caps class="q-ml-sm" @click="handleNew">
                        <q-icon name="fas fa-file" class="q-mr-sm" />
                        <span>New</span>
                    </q-btn>
                    <q-btn flat no-caps class="q-ml-sm" @click="handleOpen">
                        <q-icon name="fas fa-folder-open" class="q-mr-sm" />
                        <span>Import</span>
                    </q-btn>
                    <q-btn flat no-caps class="q-ml-sm" @click="toggleFullscreen">
                        <q-icon name="fas fa-expand" class="q-mr-sm" />
                    </q-btn>
                    <q-btn flat no-caps class="q-ml-sm" @click="handleClose">
                        <q-icon name="fas fa-close" class="q-mr-sm" />
                    </q-btn>
                </div>
            </div>
    </header>

    <q-dialog v-model="showDialog" persistent>
        <q-card>
            <q-card-section class="row items-center">
                <span class="q-ml-sm">Are you sure you want to close application?</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="No" color="primary" v-close-popup @click="cancelClose" />
                <q-btn flat label="Yes" color="primary" v-close-popup @click="confirmClose" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<style>
.q-header {
    background: #0a0a0a !important;
}
.q-toolbar {
    color: white;
}
</style>