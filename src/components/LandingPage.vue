<template>
  <div class="header">
    <div class="inner-header flex">
      <img src="/wave-dynamics.png" height="100">
      <h1>Wave Dynamics</h1>
    </div>
    <div>
      <button class="tile-button" @click="showLandingPageDetails('showWhy')">
        What is Wave Dynamics?
      </button>
      <button class="tile-button" @click="showLandingPageDetails('showTech')">
        TECH stack
      </button><button class="tile-button" @click="showLandingPageDetails('showTeam')">
        Meet the TEAM
      </button>
      <button class="tile-button" @click="redirectToGithub('FE')">FE: Source Code</button>
      <button class="tile-button" @click="redirectToGithub('BE')">BE: Source Code</button>
      <button class="get-started" @click="redirectToForm()">
        Get Started!
      </button>
    </div>
    <div v-if="showWhy">
      <h3 style="color: white;">Interactive web app using authentic ocean data for realistic wave simulation, offering an immersive experience with accurate wave behaviors, and providing an educational and immersive experience for users.</h3>
    </div>
    <div v-if="showTech">
      <h4>Tech Used</h4>
      <h5>Frontend: Three JS, WebGL, Vue + Vite, JavaScript and CPP</h5>
      <h5>Backend: node JS, express</h5>
      <h5>Cloud: Google Cloud SQL Storage</h5>
    </div>
    <div v-if="showTeam" style="color: white;">
      <h4>Our Team</h4>
      <h5>Frontend: Shaik Tabrez</h5>
      <h5>Backend: Ankush Ranapure</h5>
      <h5>Cloud: Richa Singh</h5>
    </div>
    <div>
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
          <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
          <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
      </svg>
    </div>
  </div>
  <div class="content ">
    <div>
      <h3>{{quotes[quoteIndex]['quote'] }}- {{ quotes[quoteIndex]['author'] }}</h3>
    </div>
    <br/>
    <h4>Presented at <a href="https://hacknjit.devpost.com/" target="_blank">HACKNJIT </a><a href="https://www.njit.edu/" target="_blank"> @NJIT </a> 2023 </h4>
  </div>
</template>

<script>

export default {
  data: function () {
    return {
      showWhy:false,
      showTeam:false,
      quoteIndex:0,
      showTech:false,
      svgWidth: 0,//  SVG width
      svgHeight: 200,//  SVG height
      centreY: 0,//  Y coord of vertical centre of SVG
      waves: [],//  Array of waves
      wavesCount: 10,//  Number of waves in animation
      quotes:[
        {
          quote:"It is not that life ashore is distasteful to me. But life at sea is better.",
          author:"Sir Francis Drake"
        },
        {
          quote:"The sea, once it casts its spell, holds one in its net of wonder forever.",
          author:"Jacques Yves Cousteau"
        },
        {
          quote:"Just because a sea is calm doesn’t mean that you can believe in its stillness.",
          author:"Anthony T. Hincks"
        },
        {
          quote:"When I’m out sailing, I don’t wonder what heaven is like because I know.",
          author:"Anthony T. Hincks"
        },
        {
          quote:"Now and then we had a hope that if we lived and were good, God would permit us to be Pirates.",
          author:"Mark Twain"
        },
        {
          quote:"That’s what a ship is, you know—it’s not just a keel and a hull and a deck and sails, that’s what a ship needs. But what a ship is, really is, is freedom.",
          author:"Captain Jack Sparrow, 'Pirates of the Caribbean'"
        },
        {
          quote:"Sometimes you need to tether your boats to stop them from following your dreams.",
          author:"Anthony T. Hincks"
        },
        {
          quote:"There is nothing – absolutely nothing – half so much worth doing as simply messing about in boats.",
          author:"Kenneth Grahame"
        },
      ],
    };
  },
  mounted(){
    this.quoteIndex = Math.floor(Math.random() * 7);
  },
  methods: {
    redirectToGithub(type){
      if(type === "FE"){
        window.open("https://github.com/tabrezdn1/hacknjit-fe#hacknjit-fe", '_blank');
      }
      if(type === "BE"){
        window.open("https://github.com/ar2653/hacknjit-be/#readme", '_blank');
      }
    },
    showLandingPageDetails(type){
      this[type] = true;
      setTimeout(() => {
        this[type] = false
      }, 5000);
    },
    redirectToForm() {
      this.$router.push("/waves-form")
    },
    rnd: function (min, max) {
      return min + Math.random() * (max - min);
    },
    randomFrequency: function () {
      return 3 / (Math.random(1, 8) + Math.random(3, 8) + Math.random(2, 5));
    },
    partlyRandomFrequency: function (index) {
      /*
        The frequency of a wave is how many cycles fit into the SVG's width.
        So a wave with frequency == 4 will go up and down 4 times across the whole SVG.
        
        I want to guarantee some high-frequency waves and some low-frequency, so I'm going to
        generate a random number for the frequency of each wave - but the range will be different
        depending on the value of index passed to the function.
        
        If index == 0, range is between 1.1 and 2.6
        If index == 9, range is between 4.5 and 6
        
        So... the numbers are somewhat random, but there's always some highish-frequency waves,
        and some lowish-frequency waves
      */
      const n = index + 1;
      const min = 0.6 + (n * 0.4);
      const max = 2 + (n * 0.4);
      return this.rnd(min, max); //  For 10 waves: min 0.5, max 5
    },
    amplitude: function (frequency) {
      return this.rnd(this.svgHeight / 12, this.svgHeight / 6) / frequency * 4;
    },
    opacity: function (frequency) {
      const wavelength = 1 / frequency;

      /*
        Overall opacity is a 50-50 blend of...
          A function of the wavelength: long waves are stronger, short waves are fainter
          A random number between 0.3 and 1
      */
      const wavelengthOpacity = Math.pow(wavelength / 2, 1.5);//  I messed around with formulas and liked this
      const randomOpacity = this.rnd(0.3, 1);

      const blendedOpacity = (wavelengthOpacity + randomOpacity) / 2;// Calculate average (mean) of both
      return (blendedOpacity).toFixed(2);// Rounded to 2 decimal places
    },
    animateToX: function (frequency) {
      /*
        Each wave's SVG path will be CSS-animated so that its root X position starts at 0, and ends
        off to the left of the screen by a number of pixels equal to exactly one cycle's width.
        
        Then the animation loops, and because it moved exactly 1 cycle, we don't spot the join.
      */
      return 0 - (this.svgWidth / frequency);
    },
    randomDuration: function () {
      //  Just a random number of seconds between limits that... look nice
      return Math.floor(this.rnd(8, 16)) + "s";
    },
    cycleSVGPath: function (frequency, amplitude, cycleIndex) {
      /*
        Here I'm compiling part of a SVG path, defined as two cubic Bezier curves - one that approximates the upward 
        portion of a wave cycle, and a second that approximates the downward portion of the cycle.
        
        So - we're not actually using sine maths here - the Bezier curves look quite a lot like sine waves.
        
        I've forgotten exactly where I learnt how to do this, but I think it's something like a simplified version 
        of this code: https://codepen.io/Sphinxxxx/pen/LpzNzb
      */

      const centreY = this.centreY;
      const minY = centreY - amplitude;
      const maxY = centreY + amplitude;

      const wavelength = 1 / frequency; // A wave with f == 4 has wavelength of 0.25 * SVG width
      const wavelengthPixels = wavelength * this.svgWidth; // Wavelength... in pixels
      const cycleStartXPixels = wavelengthPixels * cycleIndex; // start position of this cycle in pixels

      //  X coordinate of a Bezier control handle, in pixels
      const cycleX = fraction => (fraction * wavelengthPixels) + cycleStartXPixels;

      return `C ${cycleX(0.2)} ${minY} ${cycleX(0.3)} ${minY} ${cycleX(0.5)} ${centreY} C ${cycleX(0.7)} ${maxY} ${cycleX(0.8)} ${maxY} ${cycleX(1)} ${centreY}`;
    },
    waveSVGPath: function (frequency) {

      /*
        To animate the wave, we need the wave's SVG path to contain at least one more cycle than can be 
        displayed in the SVG - so that when we animate it moving to the left, the extra portion of the 
        path is revealed sliding in from the right.
        
        cycleCount is that number
      */
      const cycleCount = Math.ceil(frequency) + 1;
      const amplitude = this.amplitude(frequency);

      /*
        Here's where we compile an array containing parts of the SVG path; each part is a single cycle
        of the wave.
      */
      let cyclesSVGPaths = [];
      for (let cycleIndex = 0; cycleIndex < cycleCount; cycleIndex++) {
        cyclesSVGPaths.push(this.cycleSVGPath(frequency, amplitude, cycleIndex));
      }

      /*
        And here's where we compile the whole path:
          We start with a "M 0 [this.centreY] " which means "move to a point on the left-hand side of the 
          SVG, half-way between the top and bottom".
          
          Then, we just join together the path data for the cycles, separating the cycles with spaces.
          
          So the full path will go something like:
          
          1: Move to 0, centreY
          2: Draw a Bezier curve up
          3: Draw a Bezier curve down
          Repeat (2) and (3) for as many cycles as required
      */
      return `M 0 ${this.centreY} ${cyclesSVGPaths.join(" ")}`;
    },
    compileWaves() {
      /*
        Initialise a couple of parameters:
          this.svgHeight is the height of the SVG tag
          this.centreY is the vertical midpoint of the SVG tag, in pixels
      */
      this.svgWidth = document.documentElement.clientWidth;
      this.centreY = Math.ceil(this.svgHeight / 2);

      /*
        Compile this.waves: push onto the array a number of objects, each of which has properties
        that define the parameters of one wave.
      */
      this.waves = [];
      let frequency;

      for (let index = 0; index < this.wavesCount; index++) {
        frequency = this.partlyRandomFrequency(index);
        this.waves.push({
          id: `wave_${index}`,
          href: `#wave_${index}`,
          pathData: this.waveSVGPath(frequency),
          opacity: this.opacity(frequency),
          animateToX: this.animateToX(frequency),
          animationDuration: this.randomDuration()
        });
      }
    }
  },
  created: function () {
    //  Compile waves
    this.compileWaves();
    //  Recompile waves parameters if window is resized
    window.addEventListener("resize", this.compileWaves);
  }

}
</script>

<style scoped>
@import url(//fonts.googleapis.com/css?family=Lato:300:400);

.tile-button {
  color: #ffffff;
  font-family: 'Lato', sans-serif;
  letter-spacing: 1px;
  font-size: 14px;
  margin: 5px;
  padding: 5px;
  outline: 0;
  grid-gap: 8px;
  align-items: center;
  background: 0 0;
  border: 1px solid #ffffff;
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

.tile-button:hover {
  box-shadow: 4px 4px 0 #ffffff;
  transform: translate(-4px, -4px);
}

.tile-button:focus-visible {
  outline-offset: 1px;
}

.get-started {
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
  border: 1px solid #ffffff;
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

.get-started:hover {
  box-shadow: 4px 4px 0 #ffffff;
  transform: translate(-4px, -4px);
}

.get-started:focus-visible {
  outline-offset: 1px;
}

body {
  margin: 0;
}

h1 {
  font-family: 'Lato', sans-serif;
  font-weight: 300;
  letter-spacing: 2px;
  font-size: 100px;
}

p {
  font-family: 'Lato', sans-serif;
  letter-spacing: 1px;
  font-size: 14px;
  color: #333333;
}

.header {
  position: relative;
  text-align: center;
  background: linear-gradient(60deg, rgba(84, 58, 183, 1) 0%, rgba(0, 172, 193, 1) 100%);
  color: white;
}

.logo {
  width: 50px;
  fill: white;
  padding-right: 15px;
  display: inline-block;
  vertical-align: middle;
}

.inner-header {
  height: 65vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

.flex {
  /*Flexbox for containers*/
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.waves {
  position: relative;
  width: 100%;
  height: 15vh;
  margin-bottom: -7px;
  /*Fix for safari gap*/
  min-height: 100px;
  max-height: 150px;
}

.content {
  position: relative;
  height: 20vh;
  text-align: center;
  background-color: white;
}

/* Animation */

.parallax>use {
  animation: move-forever 25s cubic-bezier(.55, .5, .45, .5) infinite;
}

.parallax>use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}

.parallax>use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}

.parallax>use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}

.parallax>use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/*Shrinking for mobile*/
@media (max-width: 768px) {
  .waves {
    height: 40px;
    min-height: 40px;
  }

  .content {
    height: 30vh;
  }

  h1 {
    font-size: 24px;
  }
}
</style>

