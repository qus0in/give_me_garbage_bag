import { ref } from 'vue'
import { defineStore } from 'pinia'
import places from '@/assets/places.json'

export const useAreaStore = defineStore('area', () => {
  // 초기 위치 : 성동구청
  const center = ref({ lat: 37.5633088, long: 127.036696 })
  const level = ref(4)
  return { center, level, places }
})
