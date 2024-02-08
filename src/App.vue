<script setup lang="ts">
import { CContainer, CRow, CCol } from '@coreui/vue';
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <CContainer>
    <CRow>
      <CCol class="mx-auto" :lg=9>
        <RouterView />
      </CCol>      
    </CRow>
  </CContainer>
</template>

<style scoped>

</style>
