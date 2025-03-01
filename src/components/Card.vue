<script setup>
import {useCanvasHelper} from "../helpers/canvas.js";
import {useCard} from "../helpers/card.js";
import {useBackgrounds} from "../config/backgrounds.js";
import {useCardBacks} from "../config/card_backs.js";
import {nextTick, onMounted, ref, watch} from "vue";
import {ArrowLeftIcon, ArrowRightIcon, DocumentArrowDownIcon} from '@heroicons/vue/24/solid'
import Konva from "konva";
import html2canvas from "html2canvas-pro";


const fields = defineModel();
const Card = useCard();
const CanvasHelper = useCanvasHelper();
const configKonva = {
  width: 450,
  height: 628,
};
const stage = ref();
const artwork = ref();
const background = ref();
const footer = ref();
const text = ref();
const canvasHelper = new CanvasHelper();
let card = ref();
card.value = new Card(canvasHelper, useBackgrounds(), useCardBacks());
const cardTextImage = new Konva.Image(
    {
      x: 55,
      y: 408,
      draggable: false,
      name: 'card-text-image',
    }
);

onMounted(() => {
  canvasHelper.artworkLayer = artwork.value.getStage();
  canvasHelper.backgroundLayer = background.value.getStage();
  canvasHelper.footerLayer = footer.value.getStage();
  canvasHelper.textLayer = text.value.getStage();
  canvasHelper.textLayer.add(cardTextImage);

  watch(fields, (newFields) => {
    Object.keys(newFields).forEach((key) => {
      card.value.setValue(key.replace('card', '').toLowerCase(), newFields[key]);
    });
    doLoading(async () => {
      await card.value.draw().then(() => {
        nextTick(() => recalculateRatio());
      });
    })
  }, {deep: true});
})

const downloadImage = function () {
  cardTextImage.image('');
  // convert DOM into image
  html2canvas(document.querySelector('#renderedCardText'), {
    scale: 1,
    width: 345,
    height: 135,
    backgroundColor: 'rgba(0,0,0,0)',
  }).then((canvas) => {
    // show it inside Konva.Image
    cardTextImage.image(canvas);

    downloadURI(stage.value.getStage().toDataURL({pixelRatio: 1}), (card.value.name || 'card') + '.png');

    cardTextImage.image('');
  });
}
const downloadURI =function(uri, name) {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  link.remove();
}

const containerElement = ref();
const contentElement = ref();

function recalculateRatio() {
  if (containerElement.value === undefined || contentElement.value === undefined) return;
    resizeText(
      {
        element: contentElement.value,
        step: 0.1,
        minSize: 1,
        maxSize: 17.82
      })
}

const isOverflown = ({clientHeight, scrollHeight}) => scrollHeight > clientHeight

const resizeText = ({element, elements, minSize = 10, maxSize = 512, step = 1, unit = 'px'}) => {
  (elements || [element]).forEach(el => {
    let i = minSize
    let overflow = false

    const parent = el.parentNode

    el.style.fontSize = `${maxSize}${unit}`
    el.style.lineHeight = (((maxSize))/17.82)*21.16+'px';
    if (!isOverflown(parent)) {
      // If not too tall, don't do anything
      return;
    }

    while (!overflow && i < maxSize) {
      el.style.fontSize = `${i}${unit}`
      el.style.lineHeight = (((i))/17.82)*21.16+'px';
      overflow = isOverflown(parent)

      if (!overflow) i += step
    }

    // revert to last state where no overflow happened
    el.style.fontSize = `${i - step}${unit}`
    el.style.lineHeight = (((i - step))/17.82)*21.16+'px';
  })
}

const loadingBackground = ref(false);

const doLoading = async function (callback) {
  loadingBackground.value = true;
  const konvaStage = stage.value.getStage();
  // if it takes longer than 100 ms to load => set visual indicator
  setTimeout(() => {
    if (loadingBackground.value === true) {
      konvaStage.opacity(0.5)
    }
  }, 100);

  callback().finally(() => {
    loadingBackground.value = false;
    konvaStage.opacity(1);
  });
}

const switchBackground = function (dir) {
  doLoading(async () => {
    if (dir === 'next') {
      return card.value.nextBackground();
    }
    if (dir === 'previous') {
      return card.value.previousBackground();
    }

    return Promise.resolve();
  });
}

</script>

<template>
  <div>
    <label class="block text-sm/6 font-medium text-gray-900 dark:text-white text-center" for="cardBackLabel">Select Card Background</label>
    <div v-if="fields.cardType" class="w-full flex justify-between items-center mt-2 mb-4 col-start-2">
      <button :disabled="loadingBackground" class="button-primary px-3.5 py-2.5" type="button"
              v-on:click="() => switchBackground('next')">
        <ArrowLeftIcon aria-hidden="true" class="-mr-0.5 size-5"/>
      </button>
      <span id="cardBackLabel" class="text-center flex-grow-1 font-semibold text-gray-900 dark:text-white">{{ card.getCardBackName() }}</span>
      <button :disabled="loadingBackground"
              class="button-primary px-3.5 py-2.5" type="button"
              v-on:click="() => switchBackground('previous')">
        <ArrowRightIcon aria-hidden="true" class="-mr-0.5 size-5"/>
      </button>
    </div>

    <div class="cardParent">
      <div id="renderedCardText" ref="containerElement">
        <div id="renderedContent" ref="contentElement" v-html="fields.cardText"></div>
      </div>
      <v-stage
          ref="stage"
          :config="configKonva"
      >
        <v-layer id="artwork" ref="artwork"></v-layer>
        <v-layer id="background" ref="background"></v-layer>
        <v-layer id="text" ref="text"></v-layer>
        <v-layer id="footer" ref="footer"></v-layer>
        <v-layer id="footertext" ref="footertext">
          <v-text text="FABKIT - NOT TOURNAMENT LEGAL - FaB TCG by © LSS" :x="142" :y="597.9" :width="182" :height="12" fontFamily="Dialog Cond Semibold Regular" :fontSize="9.2" verticalAlign="top" fill="white"></v-text>
        </v-layer>
      </v-stage>
    </div>

    <div class="flex justify-center mt-2">
      <button class="inline-flex items-center gap-x-1.5 button-primary px-3.5 py-2.5" type="button" v-on:click="() => downloadImage()">
        Download Card
        <DocumentArrowDownIcon aria-hidden="true" class="-mr-0.5 size-5"/>
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>