<script setup>

import {PhotoIcon} from '@heroicons/vue/24/solid'
import {ChevronDownIcon} from '@heroicons/vue/16/solid'
import useTypes from "../config/types.js";
import {useFields} from "../helpers/fields.js";
import Card from "./Card.vue";
import {TrashIcon} from "@heroicons/vue/24/solid/index.js";
import Editor from '@tinymce/tinymce-vue'
import {RadioGroup, RadioGroupOption} from "@headlessui/vue";


const types = useTypes();
const fields = useFields();

// a computed ref
const isFieldShown = (fieldId) => {
  if (fields.cardType === '') return false;

  const selectedType = types.find(t => t.type === fields.cardType);
  if (!selectedType) return false;

  const field = selectedType.fields.find(f => f.id === fieldId);
  if (!field) {
    // Reset field value when not shown
    fields[fieldId] = '';
    return false;
  }
  return true;
};

const readFile = function readFile(event) {

  if (!event.target.files || !event.target.files[0]) return;

  const FR = new FileReader();

  FR.addEventListener("load", function (evt) {
    fields.uploadedartwork = evt.target.result;
  });

  FR.readAsDataURL(event.target.files[0]);
}

const buttons = [
  {
    text: "\uE000",
    icon: "fab-cost",
  },
  {
    text: "\uE001",
    icon: "fab-defense",
  },
  {
    text: "\uE002",
    icon: "fab-intellect",
  },
  {
    text: "\uE003",
    icon: "fab-life",
  },
  {
    text: "\uE004",
    icon: "fab-power",
  },
];

const tinyMCEConfig = {
  selector: 'textarea#cardText',
  license_key: 'gpl',
  // x = 53
  // y = 406
  resize: false,
  height: 285,
  width: '100%',
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'searchreplace',
    'emoticons'
  ],
  toolbar: 'bold italic underline alignleft aligncenter alignright alignjustify bullist ' + buttons.map((b) => 'custom_button_' + b.icon).join(' '),
  promotion: false,
  branding: false,
  skin: (window.matchMedia("(prefers-color-scheme: dark)").matches ? "oxide-dark" : "oxide"),
  content_css: (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : ""),
  content_style: "@import url('tinymce/fonts.css');body { font-family: Palatino LT Std Light; }",
  setup: (editor) => {
    buttons.forEach((button) => {
      editor.ui.registry.addButton('custom_button_' + button.icon, {
        text: button.text,
        onAction: (_) => editor.insertContent(button.text)
      });
    });

    let editorChangeHandlerId = null;
    editor.on('Paste Change input Undo Redo', function () {
      clearTimeout(editorChangeHandlerId);
      editorChangeHandlerId = setTimeout(function () {
        fields.cardText = editor.getContent();
      }, 250);
    });
  }
};
</script>

<template>
  <div>
    <div class="w-full mb-3">
      <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="location">Type</label>
      <div class="mt-2 grid grid-cols-1">
        <select id="cardType" v-model="fields.cardType"
                class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                name="location">
          <option value="">-- Select Card Type --</option>
          <option v-for="type in types.sort((a, b) => a.label.localeCompare(b.label))" :value="type.type">
            {{ type.label }}
          </option>
        </select>
        <ChevronDownIcon
            aria-hidden="true"
            class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-[2fr_1fr]">
      <div class="container mx-auto p-6">
        <form>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-if="isFieldShown('cardPitch')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardPitch">Pitch</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardPitch"
                    v-model="fields.cardPitch"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
            </div>
            <div v-if="isFieldShown('cardName')" class="">
              <label v-if="['hero', 'demi_hero'].includes(fields.cardType)" id="cardHeroNameLabel"
                     class="block text-sm/6 font-medium text-gray-900 dark:text-white">Hero name</label>
              <label v-else id="cardNameLabel" class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardName">Card
                name</label>
              <div class="mt-2">
                <div
                    class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                  <input id="cardName" v-model="fields.cardName"
                         class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                         maxlength="50" type="text">
                </div>
              </div>
            </div>
            <div v-if="isFieldShown('cardCost')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardCost">Cost</label>
              <div class="mt-2">
                <div
                    class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                  <input id="cardCost" v-model="fields.cardCost"
                         class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                         maxlength="2" type="text">
                </div>
              </div>
            </div>
            <div v-if="isFieldShown('cardPower')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardPower">Power</label>
              <div class="mt-2">
                <div
                    class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                  <input id="cardPower" v-model="fields.cardPower"
                         class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                         type="number">
                </div>
              </div>
            </div>
            <div v-if="isFieldShown('cardHeroIntellect')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardHeroIntellect">Intellect</label>
              <div class="mt-2">
                <div
                    class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                  <input id="cardHeroIntellect" v-model="fields.cardHeroIntellect"
                         class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                         type="number">
                </div>
              </div>
            </div>
            <div v-if="isFieldShown('cardTalent')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardTalent">Talent (f.e. Mystic)</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardTalent"
                    v-model="fields.cardTalent"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Chaos">Chaos</option>
                  <option value="Draconic">Draconic</option>
                  <option value="Earth">Earth</option>
                  <option value="Elemental">Elemental</option>
                  <option value="Ice">Ice</option>
                  <option value="Light">Light</option>
                  <option value="Lightning">Lightning</option>
                  <option value="Mystic">Mystic</option>
                  <option value="Royal">Royal</option>
                  <option value="Shadow">Shadow</option>
                  <option value="Custom">Custom</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardTalent === 'Custom'">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardTalentCustom">Custom Talent</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardTalentCustom" v-model="fields.cardTalentCustom"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6 "
                           placeholder="Enter custom resource subtype"
                           type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="isFieldShown('cardClass')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardClass">Class</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardClass"
                    v-model="fields.cardClass"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Adjudicator">Adjudicator</option>
                  <option value="Assassin">Assassin</option>
                  <option value="Bard">Bard</option>
                  <option value="Brute">Brute</option>
                  <option value="Generic">Generic</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Illusionist">Illusionist</option>
                  <option value="Mechanologist">Mechanologist</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Ninja">Ninja</option>
                  <option value="Ranger">Ranger</option>
                  <option value="Runeblade">Runeblade</option>
                  <option value="Shapeshifter">Shapeshifter</option>
                  <option value="Warrior">Warrior</option>
                  <option value="Wizard">Wizard</option>
                  <option value="Custom">Custom...</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardClass === 'Custom'">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardClassCustom">Custom class</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardClassCustom" v-model="fields.cardClassCustom"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                           placeholder="Enter custom class" type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="fields.cardClass && isFieldShown('cardSecondaryClass')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardSecondaryClass">Secondary class
                (optional)</label>
              <div class="mt-2 grid grid-cols-1">
                <select id="cardSecondaryClass" v-model="fields.cardSecondaryClass"
                        class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Adjudicator">Adjudicator</option>
                  <option value="Assassin">Assassin</option>
                  <option value="Bard">Bard</option>
                  <option value="Brute">Brute</option>
                  <option value="Generic">Generic</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Illusionist">Illusionist</option>
                  <option value="Mechanologist">Mechanologist</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Ninja">Ninja</option>
                  <option value="Ranger">Ranger</option>
                  <option value="Runeblade">Runeblade</option>
                  <option value="Shapeshifter">Shapeshifter</option>
                  <option value="Warrior">Warrior</option>
                  <option value="Wizard">Wizard</option>
                  <option value="Custom">Custom...</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardSecondaryClass === 'Custom'">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardSecondaryClassCustom">Custom class</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardSecondaryClassCustom" v-model="fields.cardSecondaryClassCustom"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                           placeholder="Enter custom class"
                           type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="isFieldShown('cardActionSubtype')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardActionSubtype">Action subtype (f.e
                Attack
                Action)</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardActionSubtype"
                    v-model="fields.cardActionSubtype"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Attack">Attack</option>
                  <option value="Arrow Attack">Arrow Attack</option>
                  <option value="Dagger Attack">Dagger Attack</option>
                  <option value="Aura">Aura</option>
                  <option value="Affliction Aura">Affliction Aura</option>
                  <option value="Construct">Construct</option>
                  <option value="Invocation">Invocation</option>
                  <option value="Item">Item</option>
                  <option value="Shuriken Item">Shuriken Item</option>
                  <option value="Landmark">Landmark</option>
                  <option value="Song">Song</option>
                  <option value="Custom">Custom...</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardActionSubtype === 'Custom'">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardActionSubtypeCustom">Custom action subtype</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardActionSubtypeCustom" v-model="fields.cardActionSubtypeCustom"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6 "
                           placeholder="Enter custom action subtype"
                           type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="isFieldShown('cardDefenseReactionSubtype')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardDefenseReactionSubtype">Defense Reaction
                subtype (optional, f.e: Trap)</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardDefenseReactionSubtype"
                    v-model="fields.cardDefenseReactionSubtype"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Trap">Trap</option>
                  <option value="Custom">Custom</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardDefenseReactionSubtype === 'Custom'">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardDefenseReactionSubtypeCustom">Custom Defense Reaction
                  subtype</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardDefenseReactionSubtypeCustom" v-model="fields.cardDefenseReactionSubtypeCustom"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6 "
                           placeholder="Enter custom defense reaction subtype"
                           type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="isFieldShown('cardEquipmentSubtype')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardEquipmentSubtype">Equipment subtype
                (f.e.
                Legs)</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardEquipmentSubtype"
                    v-model="fields.cardEquipmentSubtype"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Head">Head</option>
                  <option value="Chest">Chest</option>
                  <option value="Arms">Arms</option>
                  <option value="Legs">Legs</option>
                  <option value="Base">Base</option>
                  <option value="Off-Hand">Off-Hand</option>
                  <option value="Item">Item</option>
                  <option value="Custom">Custom...</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardEquipmentSubtype === 'Custom'">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardEquipmentSubtypeCustom">Custom equipment
                  subtype</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardEquipmentSubtypeCustom" v-model="fields.cardEquipmentSubtypeCustom"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6 "
                           placeholder="Enter custom equipment subtype"
                           type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="isFieldShown('cardInstantSubtype')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardInstantSubtype">Instant subtype (f.e.
                Aura)</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardInstantSubtype"
                    v-model="fields.cardInstantSubtype"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Aura">Aura</option>
                  <option value="Figment">Figment</option>
                  <option value="Trap">Trap</option>
                  <option value="Custom">Custom</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardInstantSubtype === 'Custom'">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardInstantSubtypeCustom">Custom instant subtype</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardInstantSubtypeCustom" v-model="fields.cardInstantSubtypeCustom"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6 "
                           placeholder="Enter custom instant subtype"
                           type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="isFieldShown('cardResourceSubtype')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardResourceSubtype">Resource subtype
                (f.e.
                Gem)</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardResourceSubtype"
                    v-model="fields.cardResourceSubtype"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Gem">Gem</option>
                  <option value="Chi">Chi</option>
                  <option value="Custom">Custom</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardResourceSubtype === 'Custom'">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardResourceSubtypeCustom">Custom resource
                  subtype</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardResourceSubtypeCustom" v-model="fields.cardResourceSubtypeCustom"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6 "
                           placeholder="Enter custom resource subtype"
                           type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="isFieldShown('cardMacroGroup')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardMacroGroup">Macro Group (f.e.
                Rosetta)</label>
              <div class="mt-2">
                <div
                    class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                  <input id="cardMacroGroup" v-model="fields.cardMacroGroup"
                         class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                         type="text">
                </div>
              </div>
            </div>
            <div v-if="isFieldShown('cardHeroSubtype')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardResourceSubtype">Hero subtype</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardHeroSubtype"
                    v-model="fields.cardHeroSubtype"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Demon">Demon</option>
                  <option value="Young">Young</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
            </div>
            <div v-if="isFieldShown('cardWeaponSubtype')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardWeaponSubtype">Weapon subtype (f.e.
                Axe)</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardWeaponSubtype"
                    v-model="fields.cardWeaponSubtype"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="">None</option>
                  <option value="Axe">Axe</option>
                  <option value="Book">Book</option>
                  <option value="Bow">Bow</option>
                  <option value="Brush">Brush</option>
                  <option value="Club">Club</option>
                  <option value="Dagger">Dagger</option>
                  <option value="Fiddle">Fiddle</option>
                  <option value="Flail">Flail</option>
                  <option value="Gun">Gun</option>
                  <option value="Hammer">Hammer</option>
                  <option value="Lute">Lute</option>
                  <option value="Orb">Orb</option>
                  <option value="Pistol">Pistol</option>
                  <option value="Polearm">Polearm</option>
                  <option value="Scepter">Scepter</option>
                  <option value="Scroll">Scroll</option>
                  <option value="Scythe">Scythe</option>
                  <option value="Staff">Staff</option>
                  <option value="Sword">Sword</option>
                  <option value="Wrench">Wrench</option>
                  <option value="Custom">Custom...</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <template v-if="fields.cardWeaponSubtype === 'Custom'">
                <!-- Custom input field for weapon type -->
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardWeaponSubtypeCustom"></label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardWeaponSubtypeCustom" v-model="fields.cardWeaponSubtype"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6 "
                           placeholder="Enter custom weapon subtype"
                           type="text">
                  </div>
                </div>
              </template>
            </div>
            <div v-if="isFieldShown('cardWeapon')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" id="cardWeapon">1H or 2H?</label>
              <fieldset aria-label="1H or 2H?">
                <RadioGroup v-model="fields.cardWeapon" class="mt-2 grid grid-cols-2 gap-6">
                  <RadioGroupOption as="template"  value="(1H)" v-slot="{ active, checked }">
                    <div class="cursor-pointer focus:outline-hidden" :class="[active ? 'ring-2 bg-primary ring-offset-2' : '', checked ? 'bg-primary text-white ring-0 hover:bg-primary' : 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50', !active && !checked ? 'ring-inset' : '', active && checked ? 'ring-2' : '', 'flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold uppercase sm:flex-1']">1h</div>
                  </RadioGroupOption>
                  <RadioGroupOption as="template" value="(2H)" v-slot="{ active, checked }">
                    <div class="cursor-pointer focus:outline-hidden" :class="[active ? 'ring-2 bg-primary ring-offset-2' : '', checked ? 'bg-primary text-white ring-0 hover:bg-primary' : 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50', !active && !checked ? 'ring-inset' : '', active && checked ? 'ring-2' : '', 'flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold uppercase sm:flex-1']">2h</div>
                  </RadioGroupOption>
                </RadioGroup>
              </fieldset>
            </div>
            <div v-if="isFieldShown('cardRarity')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardRarity">Rarity</label>
              <div class="mt-2 grid grid-cols-1">
                <select
                    id="cardRarity"
                    v-model="fields.cardRarity"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-dark py-1.5 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
                  <option value="img/rarities/rarity_common.svg">Common</option>
                  <option value="img/rarities/rarity_fabled.svg">Fabled</option>
                  <option value="img/rarities/rarity_legendary.svg">Legendary</option>
                  <option value="img/rarities/rarity_majestic.svg">Majestic</option>
                  <option value="img/rarities/rarity_marvel.svg">Marvel</option>
                  <option value="img/rarities/rarity_promo.svg">Promo</option>
                  <option value="img/rarities/rarity_rare.svg">Rare</option>
                  <option value="img/rarities/rarity_superrare.svg">Super Rare</option>
                  <option value="img/rarities/rarity_token.svg">Token</option>
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"/>
              </div>
              <div v-if="isFieldShown('cardTokenSubtype')" class="">
                <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardTokenSubtype">Subtype (optional)
                  (f.e. Aura)</label>
                <div class="mt-2">
                  <div
                      class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                    <input id="cardTokenSubtype" v-model="fields.cardTokenSubtype"
                           class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                           type="text">
                  </div>
                </div>
              </div>
            </div>
            <div v-if="isFieldShown('cardDefense')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardDefense">Defense</label>
              <div class="mt-2">
                <div
                    class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                  <input id="cardDefense" v-model="fields.cardDefense"
                         class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                         type="number">
                </div>
              </div>
            </div>
            <div v-if="isFieldShown('cardLife')" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardLife">Life</label>
              <div class="mt-2">
                <div
                    class="flex items-center rounded-md bg-white dark:bg-dark pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                  <input id="cardLife" v-model="fields.cardLife"
                         class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                         type="number">
                </div>
              </div>
            </div>
            <div v-if="fields.cardType !== ''" class="">
              <label class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="photo-cover">Artwork</label>
              <div v-if="fields.uploadedartwork" class="mt-2 w-full flex justify-center rounded-lg border border-dashed border-gray-900/25 dark:border-white px-6 py-1">
                <img :src="fields.uploadedartwork" alt="Uploaded artwork" class="rounded">
                <button class="inline-flex items-center gap-x-1.5 rounded-r-md bg-primary px-2.5  text-sm font-semibold text-white shadow-xs hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" type="button" v-on:click="() => fields.uploadedartwork = ''">
                  <TrashIcon aria-hidden="true" class="-mr-0.5 size-5"/>
                </button>
              </div>
              <div v-else class="mt-2 w-full flex justify-center rounded-lg border border-dashed border-gray-900/25 dark:border-white px-6 py-10">
                <div class="text-center">
                  <PhotoIcon aria-hidden="true" class="mx-auto size-12 text-gray-300"/>
                  <div class="mt-4 flex text-sm/6 text-gray-600 dark:text-white">
                    <label class="relative cursor-pointer rounded-md font-semibold text-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:outline-hidden hover:text-primary-500" for="cardUploadedArtwork">
                      <span>Upload your artwork</span>
                      <input id="cardUploadedArtwork" class="sr-only" type="file" v-on:change="readFile" accept="image/png, image/jpeg, image/gif" size="10000000">
                    </label>
                  </div>
                  <p class="text-xs/5 text-gray-600 dark:text-white">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            <div v-show="isFieldShown('cardText')" class="sm:col-span-2">
              <label v-if="['hero', 'demi_hero'].includes(fields.cardType)" id="cardHeroPowerLabel" class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardText">Hero power</label>
              <label v-else id="cardTextLabel" class="block text-sm/6 font-medium text-gray-900 dark:text-white" for="cardText">Card text</label>
              <div class="col-span-full">
                <div class="mt-2">
                  <editor
                      api-key="gpl"
                      :init="tinyMCEConfig"
                      tinymce-script-src="tinymce/tinymce.min.js"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="flex flex-col items-center">
        <Card v-show="fields.cardType" v-model="fields" class=""></Card>
      </div>
    </div>
  </div>
</template>
