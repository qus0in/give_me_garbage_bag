<template>
    <CContainer>
        <h1 class="display-5 text-center py-3">📌 성동구 종-봉 어디?</h1>
        <CForm class="d-flex mb-2" @submit.prevent="handleSearch">
            <div class="searchType">
                <CFormSelect @change="changeSearchType">
                    <option value="keyword">키워드</option>
                    <option value="address">주소</option>
                </CFormSelect>
            </div>
            <CInputGroup>
                <CFormInput
                    v-model=keyword
                    type="text"
                    placeholder="중심 좌표를 둘 곳을 입력하세요"
                />
                <CButton @click="handleSearch" color="dark" variant="outline">검색</CButton>
            </CInputGroup>
        </CForm>
        <div class="text-center my-4" v-if="msg">
            {{ msg }}
        </div>
        <div class="my-4" v-if="centerAddress">
            <strong>현재 중심 위치:</strong> {{ centerAddress }}
        </div>
        <CContainer id="map" class="my-4">
            <div class="container-fluid ratio ratio-16x9"></div>
        </CContainer>
        <CContainer class="text-center">
            <p><small>데이터 출처 : <a
                style="text-decoration: none;"
                href="https://www.sd.go.kr/main/selectBbsNttView.do?bbsNo=166&nttNo=330752&&pageUnit=10&searchCnd=SJ&searchKrwd=%EC%A2%85%EB%9F%89%EC%A0%9C&key=1307&pageIndex=1">
                종량제봉투 특수마대 판매소 현황(23년 9월) (성동구청 홈페이지)
            </a></small></p>
        </CContainer>
    </CContainer>
</template>

<script setup lang="ts">
declare global {
  interface Window {
    kakao: any
  }
}

import { CButton, CContainer, CForm, CFormInput, CInputGroup, CFormSelect, CFooter } from '@coreui/vue';
import { onMounted, ref } from 'vue';
import { useAreaStore } from '@/stores/areaStore';

const loadScript = () => {
    const script = document.createElement('script');
    const appKey = import.meta.env.VITE_KAKAO_APP_KEY
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`
    script.addEventListener('load', () => {
        window.kakao.maps.load(() => {
            initMap()
        })
    })
    document.head.appendChild(script)
}

const map = ref<any>(null)
const initMap = () => {
    const container = document.getElementById('map');
    const area = useAreaStore()
    const options = {
        center: new window.kakao.maps.LatLng(area.center.lat, area.center.long),
        level: area.level,
    };
    map.value = new window.kakao.maps.Map(container, options);
    for (const place of area.places) {
        const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(place.lat, place.long),
            title: place.name,
        });
        marker.setMap(map.value);
        window.kakao.maps.event.addListener(marker, 'click', function() {
            window.open(`https://map.kakao.com/link/map/${place.name},${place.lat},${place.long}`)
        });
    }
}

onMounted(() => {
    if (window.kakao?.maps) {
        initMap()
    } else {
        loadScript()
    }
})  

const keyword = ref('')
const msg = ref('')
const centerAddress = ref('')

const searchOption = ref('keyword')
const changeSearchType = (e: Event) => {
    const target = e.target as HTMLSelectElement
    searchOption.value = target.value
}

const handleSearch = () => {
    if (keyword.value === '') {
        msg.value = '검색어를 입력하세요.'
        return
    }
    if (searchOption.value === 'address') {
        searchByAddress()
    } else {
        searchByKeyword()
    }
}

const centerMarker = ref<any>(null)

const searchByKeyword = () => {
    const places = new window.kakao.maps.services.Places()
    places.keywordSearch(keyword.value, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
            if (result.length === 0) {
                msg.value = '검색 결과가 없습니다.'
                return
            }
            if (result[0].address_name.indexOf('성동구') === -1) {
                msg.value = '성동구 관련 키워드를 입력하세요.'
                return
            }
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)
            map.value.setCenter(coords)
            msg.value = ''
            centerAddress.value = result[0].road_address_name || result[0].address_name
            centerMarker.value = new window.kakao.maps.Marker({
                position: coords,
                image: new window.kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', new window.kakao.maps.Size(24, 35)),
            });
            centerMarker.value.setMap(map.value);
        } else {
            msg.value = '검색할 수 없는 키워드입니다.'
            centerAddress.value = ''
            centerMarker.value.setMap(null)
        }
    })
}

const searchByAddress = () => {
    const geocoder = new window.kakao.maps.services.Geocoder()
    console.log(keyword.value)
    geocoder.addressSearch(keyword.value, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
            if (result.length === 0) {
                msg.value = '검색 결과가 없습니다.'
                return
            }
            if (result[0].address_name.indexOf('성동구') === -1) {
                msg.value = '성동구의 주소를 입력하세요.'
                return
            }
            console.log(result)
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)
            map.value.setCenter(coords)
            msg.value = ''
            centerAddress.value = result[0].road_address_name || result[0].address_name
            centerMarker.value = new window.kakao.maps.Marker({
                position: coords,
                image: new window.kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', new window.kakao.maps.Size(24, 35)),
            });            
            centerMarker.value.setMap(map.value);
        } else {
            msg.value = '검색할 수 없는 주소입니다.'
            centerAddress.value = ''
            centerMarker.value.setMap(null)
        }
    })
}

</script>

<style scoped>
.searchType {
    width:8rem;
}
</style>