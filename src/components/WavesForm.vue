<template>
  <div>

    <div class="login-root">
      <div class="box-root flex-flex flex-direction--column" style="min-height: 100vh;flex-grow: 1;">
        <div class="loginbackground box-background--white padding-top--64">
          <div class="loginbackground-gridContainer">
            <div class="box-root flex-flex" style="grid-area: top / start / 8 / end;">
              <div class="box-root"
                style="background-image: linear-gradient(white 0%, rgb(247, 250, 252) 33%); flex-grow: 1;">
              </div>
            </div>
            <div class="box-root flex-flex" style="grid-area: 4 / 2 / auto / 5;">
              <div class="box-root box-divider--light-all-2 animationLeftRight tans3s" style="flex-grow: 1;"></div>
            </div>
            <div class="box-root flex-flex" style="grid-area: 6 / start / auto / 2;">
              <div class="box-root box-background--blue800" style="flex-grow: 1;"></div>
            </div>
            <div class="box-root flex-flex" style="grid-area: 7 / start / auto / 4;">
              <div class="box-root box-background--blue animationLeftRight" style="flex-grow: 1;"></div>
            </div>
            <div class="box-root flex-flex" style="grid-area: 8 / 4 / auto / 6;">
              <div class="box-root box-background--gray100 animationLeftRight tans3s" style="flex-grow: 1;"></div>
            </div>
            <div class="box-root flex-flex" style="grid-area: 2 / 15 / auto / end;">
              <div class="box-root box-background--cyan200 animationRightLeft tans4s" style="flex-grow: 1;"></div>
            </div>
            <div class="box-root flex-flex" style="grid-area: 3 / 14 / auto / end;">
              <div class="box-root box-background--blue animationRightLeft" style="flex-grow: 1;"></div>
            </div>
            <div class="box-root flex-flex" style="grid-area: 4 / 17 / auto / 20;">
              <div class="box-root box-background--gray100 animationRightLeft tans4s" style="flex-grow: 1;"></div>
            </div>
            <div class="box-root flex-flex" style="grid-area: 5 / 14 / auto / 17;">
              <div class="box-root box-divider--light-all-2 animationRightLeft tans3s" style="flex-grow: 1;"></div>
            </div>
          </div>
        </div>
        <div class="box-root padding-top--24 flex-flex flex-direction--column" style="flex-grow: 1; z-index: 9;">
          <div class="box-root padding-top--48 padding-bottom--24 flex-flex flex-justifyContent--center">
            <img src="/wave-dynamics.png" height="50">
            <h1><a href="./" rel="dofollow">Wave Dynamics</a></h1>
          </div>
          <div class="formbg-outer">
            <div class="formbg">
              <div class="formbg-inner padding-horizontal--48">
                <span class="padding-bottom--15">Enter the region you want to explore!</span>
                <div class="field padding-bottom--24">
                  <label for="lat">Latitude of the location</label>
                  <input name="lat" v-model="lat">
                </div>
                <div class="field padding-bottom--24">
                  <label for="lng">Longtitude of the location</label>
                  <input name="lng" v-model="lng">
                </div>
                <div class="field padding-bottom--24">
                  <button class="get-data" @click="getWaveData">Get DATA</button>
                  <img v-if="isFetching" src="/assets/wait.png" style="height: 35px;" />
                </div>

                <div class="field padding-bottom--24">

                  <button class="get-data" @click="goToSimulate">Simulate WAVES</button>
                </div>

                <div class="field">
                  <button class="button-89" role="button" @click="displayFamousRegions()">Checkout frequently searched
                    ocean
                    regions!</button>
                </div>

              </div>
              <div v-if="showFamousRegions" class="padding-bottom--24">
                <button class="button-57" role="button" @click="prefillLatLng(21.664019, -158.053852)"><span
                    class="text">Banzai Pipeline</span><span>Hawaii</span></button>
                <button class="button-57" role="button" @click="prefillLatLng(6.664, 77.47)"><span
                    class="text">Great Ocean</span><span>India</span></button>
                <button class="button-57" role="button" @click="prefillLatLng(17.847222, -149.267222)"><span
                    class="text">Teahupoo</span><span>Tahiti</span></button>
                <button class="button-57" role="button" @click="prefillLatLng(0.01, 0.01)"><span class="text">Low
                    waves</span><span>Custom data</span></button>
                <button class="button-57" role="button" @click="prefillLatLng(0.02, 0.02)"><span class="text">Medium
                    waves</span><span>Custom data</span></button>
                <button class="button-57" role="button" @click="prefillLatLng(0.03, 0.03)"><span class="text">Huge
                    waves</span><span>Custom data</span></button>
              </div>
            </div>
            <div class="footer-link padding-top--24">
              <span>Ocean and wave data provided by <a href="https://www.meteomatics.com/en/weather-api/"
                  target="_blank">meteo
                  matics</a></span>
              <div class="listing padding-top--24 padding-bottom--24 flex-flex center-center">
                <span><a href="#">© Wave Dynamics</a></span>
                <span><a href="#">Contact</a></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      isFetching: false,
      showFamousRegions: false,
      lat: "",
      lng: "",
    }
  },
  methods: {
    getWaveData() {
      this.isFetching = true,
        setTimeout(() => {
          const date = new Date();
          const dateString = date.toISOString().slice(0, 10) + 'T00:00:00Z';
          axios.get(`http://localhost:4000/waves/getData?data=${dateString}&latitude=${this.lat}&longitude=${this.lng}`)
            .then(response => {
              console.log(response.data, "check");
              let waveData = {
                A: { direction: response.data.data.mean_wave_direction_first_swell, steepness: response.data.data.significant_wave_height_first_swell_converted, wavelength: response.data.data.wave_length_1 },
                B: { direction: response.data.data.mean_wave_direction_second_swell, steepness: response.data.data.significant_wave_height_first_swell_converted, wavelength: response.data.data.wave_length_1 },
                C: { direction: response.data.data.mean_wave_direction_third_swell, steepness: response.data.data.significant_wave_height_first_swell_converted, wavelength: response.data.data.wave_length_1 },
              };
              localStorage.setItem('waves', JSON.stringify(waveData));
            })
          this.isFetching = false
        }, 3000);
    },
    goToSimulate() {
      this.$router.push("/waves-simulate")
    },
    prefillLatLng(lat, lng) {
      this.lat = String(lat),
        this.lng = String(lng)
    },
    displayFamousRegions() {
      this.showFamousRegions = true
      setTimeout(() => {
        this.showFamousRegions = false
      }, 10000);
    }
  },
}
</script>
<style scoped>
* {
  padding: 0;
  margin: 0;
  color: #1a1f36;
  box-sizing: border-box;
  word-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Ubuntu, sans-serif;
}


/* CSS */
.button-89 {
  --b: 3px;
  /* border thickness */
  --s: .45em;
  /* size of the corner */
  --color: #373B44;

  padding: calc(.5em + var(--s)) calc(.9em + var(--s));
  color: var(--color);
  --_p: var(--s);
  background:
    conic-gradient(from 90deg at var(--b) var(--b), #0000 90deg, var(--color) 0) var(--_p) var(--_p)/calc(100% - var(--b) - 2*var(--_p)) calc(100% - var(--b) - 2*var(--_p));
  transition: .3s linear, color 0s, background-color 0s;
  outline: var(--b) solid #0000;
  outline-offset: .6em;
  font-size: 16px;

  border: 0;

  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-89:hover,
.button-89:focus-visible {
  --_p: 0px;
  outline-color: var(--color);
  outline-offset: .05em;
}

.button-89:active {
  background: var(--color);
  color: #fff;
}


/* CSS */
.button-57 {
  position: relative;
  overflow: hidden;
  border: 1px solid #18181a;
  color: #18181a;
  display: inline-block;
  font-size: 15px;
  line-height: 15px;
  padding: 18px 18px 17px;
  text-decoration: none;
  cursor: pointer;
  background: #fff;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-57 span:first-child {
  position: relative;
  transition: color 600ms cubic-bezier(0.48, 0, 0.12, 1);
  z-index: 10;
}

.button-57 span:last-child {
  color: white;
  display: block;
  position: absolute;
  bottom: 0;
  transition: all 500ms cubic-bezier(0.48, 0, 0.12, 1);
  z-index: 100;
  opacity: 0;
  top: 50%;
  left: 50%;
  transform: translateY(225%) translateX(-50%);
  height: 14px;
  line-height: 13px;
}

.button-57:after {
  content: "";
  position: absolute;
  bottom: -50%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  transform-origin: bottom center;
  transition: transform 600ms cubic-bezier(0.48, 0, 0.12, 1);
  transform: skewY(9.3deg) scaleY(0);
  z-index: 50;
}

.button-57:hover:after {
  transform-origin: bottom center;
  transform: skewY(9.3deg) scaleY(2);
}

.button-57:hover span:last-child {
  transform: translateX(-50%) translateY(-100%);
  opacity: 1;
  transition: all 900ms cubic-bezier(0.48, 0, 0.12, 1);
}

.success-data {
  font-family: 'Lato', sans-serif;
  letter-spacing: 1px;
  font-size: 14px;
  margin: 5px;
  padding: 5px;
  outline: 0;
  grid-gap: 8px;
  align-items: center;
  background-color: #567dff;
  color: #ffffff;
  border: 1px solid #000000;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-size: 16px;
  gap: 8px;
  justify-content: center;
  line-height: 1.5;
  overflow: hidden;
  padding: 12px 16px;
  text-decoration: none;
  text-overflow: ellipsis;
  transition: all .14s ease-out;
  white-space: nowrap;
}

.success-data:hover {
  box-shadow: 4px 4px 0 #000000;
  transform: translate(-4px, -4px);
}

.success-data:focus-visible {
  outline-offset: 1px;
}

.get-data {
  outline: 0;
  grid-gap: 8px;
  align-items: center;
  background: 0 0;
  border: 1px solid #000;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-size: 16px;
  gap: 8px;
  justify-content: center;
  line-height: 1.5;
  overflow: hidden;
  padding: 12px 16px;
  text-decoration: none;
  text-overflow: ellipsis;
  transition: all .14s ease-out;
  white-space: nowrap;
}

.get-data:hover {
  box-shadow: 4px 4px 0 #000;
  transform: translate(-4px, -4px);
}

.get-data:focus-visible {
  outline-offset: 1px;
}



body {
  min-height: 100%;
  background-color: #ffffff;
}

h1 {
  letter-spacing: -1px;
}

a {
  color: #5469d4;
  text-decoration: unset;
}

.login-root {
  background: #fff;
  display: flex;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.loginbackground {
  min-height: 692px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  z-index: 0;
  overflow: hidden;
}

.flex-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.center-center {
  align-items: center;
  justify-content: center;
}

.box-root {
  box-sizing: border-box;
}

.flex-direction--column {
  -ms-flex-direction: column;
  flex-direction: column;
}

.loginbackground-gridContainer {
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: [start] 1fr [left-gutter] (86.6px)[16] [left-gutter] 1fr [end];
  grid-template-columns: [start] 1fr [left-gutter] repeat(16, 86.6px) [left-gutter] 1fr [end];
  -ms-grid-rows: [top] 1fr [top-gutter] (64px)[8] [bottom-gutter] 1fr [bottom];
  grid-template-rows: [top] 1fr [top-gutter] repeat(8, 64px) [bottom-gutter] 1fr [bottom];
  justify-content: center;
  margin: 0 -2%;
  transform: rotate(-12deg) skew(-12deg);
}

.box-divider--light-all-2 {
  box-shadow: inset 0 0 0 2px #e3e8ee;
}

.box-background--blue {
  background-color: #5469d4;
}

.box-background--white {
  background-color: #ffffff;
}

.box-background--blue800 {
  background-color: #212d63;
}

.box-background--gray100 {
  background-color: #e3e8ee;
}

.box-background--cyan200 {
  background-color: #7fd3ed;
}

.padding-top--64 {
  padding-top: 64px;
}

.padding-top--24 {
  padding-top: 24px;
}

.padding-top--48 {
  padding-top: 48px;
}

.padding-bottom--24 {
  padding-bottom: 24px;
}

.padding-horizontal--48 {
  padding: 48px;
}

.padding-bottom--15 {
  padding-bottom: 15px;
}


.flex-justifyContent--center {
  -ms-flex-pack: center;
  justify-content: center;
}

.formbg {
  margin: 0px auto;
  width: 100%;
  max-width: 448px;
  background: white;
  border-radius: 4px;
  box-shadow: rgba(60, 66, 87, 0.12) 0px 7px 14px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px 0px;
}

span {
  display: block;
  font-size: 20px;
  line-height: 28px;
  color: #1a1f36;
}

label {
  margin-bottom: 10px;
}

.reset-pass a,
label {
  font-size: 14px;
  font-weight: 600;
  display: block;
}

.reset-pass>a {
  text-align: right;
  margin-bottom: 10px;
}

.grid--50-50 {
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: center;
}

.field input {
  font-size: 16px;
  line-height: 28px;
  padding: 8px 16px;
  width: 100%;
  min-height: 44px;
  border: unset;
  border-radius: 4px;
  outline-color: rgb(84 105 212 / 0.5);
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(60, 66, 87, 0.16) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px;
}

input[type="submit"] {
  background-color: rgb(84, 105, 212);
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.12) 0px 1px 1px 0px,
    rgb(84, 105, 212) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(60, 66, 87, 0.08) 0px 2px 5px 0px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.field-checkbox input {
  width: 20px;
  height: 15px;
  margin-right: 5px;
  box-shadow: unset;
  min-height: unset;
}

.field-checkbox label {
  display: flex;
  align-items: center;
  margin: 0;
}

a.ssolink {
  display: block;
  text-align: center;
  font-weight: 600;
}

.footer-link span {
  font-size: 14px;
  text-align: center;
}

.listing a {
  color: #697386;
  font-weight: 600;
  margin: 0 10px;
}

.animationRightLeft {
  animation: animationRightLeft 2s ease-in-out infinite;
}

.animationLeftRight {
  animation: animationLeftRight 2s ease-in-out infinite;
}

.tans3s {
  animation: animationLeftRight 3s ease-in-out infinite;
}

.tans4s {
  animation: animationLeftRight 4s ease-in-out infinite;
}

@keyframes animationLeftRight {
  0% {
    transform: translateX(0px);
  }

  50% {
    transform: translateX(1000px);
  }

  100% {
    transform: translateX(0px);
  }
}

@keyframes animationRightLeft {
  0% {
    transform: translateX(0px);
  }

  50% {
    transform: translateX(-1000px);
  }

  100% {
    transform: translateX(0px);
  }
}</style>