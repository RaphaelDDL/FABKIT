const Card = class Card {
    canvasHelper;
    cardbackConfig;
    drawTimeout;
    backgroundIndex = 0;
    power = '';
    name = '';
    text = '';
    defense = '';
    cost = '';
    talent = '';
    talentcustom = '';
    class = '';
    secondaryclass = '';
    actionsubtype = '';
    rarity = '';
    herointellect = '';
    life = '';
    equipmentsubtype = '';
    instantsubtype = '';
    macrogroup = '';
    resourcesubtype = '';
    classcustom = '';
    secondaryclasscustom = '';
    actionsubtypecustom = '';
    equipmentsubtypecustom = '';
    instantsubtypecustom = '';
    resourcesubtypecustom = '';
    herosubtype = '';
    weaponsubtype = '';
    weaponsubtypecustom = '';
    weapon1h = '';
    weapon2h = '';
    tokensubtype = '';
    defensereactionsubtype = '';
    defensereactionsubtypecustom = '';
    uploadedartwork = '';

    /**
     * @param {CanvasHelper} canvasHelper
     * @param {Object} backgrounds
     * @param {Object} cardbackConfig
     */
    constructor(
        canvasHelper,
        backgrounds,
        cardbackConfig,
    ) {
        this.canvasHelper = canvasHelper;
        this.backgrounds = backgrounds;
        this.cardbackConfig = cardbackConfig;
    }

    _type = '';

    get type() {
        return this._type;
    }

    set type(type) {
        if (type === this._type) return;
        this._type = type;
        this.backgroundIndex = 0;
        this.setValue('pitch', 1);
    }

    _pitch = 1;

    get pitch() {
        return this._pitch;
    }

    set pitch(value) {
        const newPitch = this.clamp(value, 1, 3);
        if (this._pitch === newPitch) return;

        this._pitch = this.clamp(value, 1, 3);
    }

    get typetext() {
        let classText = this.class;
        if (classText === 'Custom' && this.classcustom) {
            classText = this.classcustom;
        }

        let subtype = '';
        let cardSubtype = this.getValue(this.type.replace('_', '') + 'subtype');
        if ("demi_hero" === this.type) {
            // Also select hero subtype for demi hero
            cardSubtype = this.herosubtype;
        }
        if (cardSubtype) {
            subtype = cardSubtype;
            if (cardSubtype === 'Custom') {
                subtype = this.getValue(this.type.replace('_', '') + 'subtypecustom');
            }
        }

        if (subtype) {
            subtype = ' - ' + subtype;
        }
        if (this.type === 'weapon') {
            subtype += (this.weapon2h ? ' (2H)' : ' (1H)');
        }

        let type = this.capitalizeFirstLetter(this.type).split('_').map((word) => this.capitalizeFirstLetter(word)).join(' ');

        let secondaryclass = '';
        if (this.secondaryclass) {
            secondaryclass = ' / ' + this.secondaryclass;
            if (this.secondaryclass === 'Custom') {
                secondaryclass = ' / ' + this.secondaryclasscustom;
            }
        }

        let talent = this.talent;
        if (talent === 'Custom') {
            talent = this.talentcustom;
        }

        return `${talent} ${classText} ${secondaryclass} ${type} ${subtype}`
            .replace(/  +/g, ' ')
            .replace(/ $/, '')
            .replace(/^ /, '')
            ;
    }

    get frame() {
        // img/cardbacks/allstats/1/aria_allstats_1_dented.png
        const re = /.*_(.*).png/
        const match = this.getBackground().match(re);

        if (!match || !match[1]) {
            console.error(`No frame type found for ${this.getBackground()}`)
            return;
        }

        return match[1]
    }

    async setValue(name, value) {
        if (!(name in this)) {
            console.error(`Card doesn't have the "${name}" field.`);
        }
        const isNewValue = this[name] !== value;
        this[name] = value;
        if (!isNewValue) {
            return Promise.resolve();
        }
        return Promise.resolve();
    }

    getAvailableBackgrounds() {
        return this.backgrounds[this.getTypeFolder()][this.pitch];
    }

    async previousBackground() {
        this.backgroundIndex = this.clamp(
            (this.backgroundIndex - 1 + this.getAvailableBackgrounds().length) % this.getAvailableBackgrounds().length,
            0,
            this.getAvailableBackgrounds().length - 1
        );
        return this.draw();
    }

    async nextBackground() {
        this.backgroundIndex = this.clamp(
            (this.backgroundIndex + 1) % this.getAvailableBackgrounds().length,
            0,
            this.getAvailableBackgrounds().length - 1
        );
        return this.draw();
    }

    getBackground() {
        const typeFolder = this.getTypeFolder();
        if (!this.backgrounds[typeFolder]) return "";
        if (!this.backgrounds[typeFolder][this.pitch]) return "";
        if (!this.backgrounds[typeFolder][this.pitch][this.backgroundIndex]) return "";

        return this.backgrounds[typeFolder][this.pitch][this.backgroundIndex];
    }

    async draw() {
        if (!this.cardbackConfig[this.frame]) {
            console.error(`No config found for frame: ${this.frame}`);
            return Promise.resolve();
        }

        // Get default fields

        const defaultFields = this.cardbackConfig[this.frame].default;
        if (!defaultFields) {
            console.error(`No default configs found for frame: ${this.frame}`);
            return Promise.resolve();
        }

        const specialtyFields = this.cardbackConfig[this.frame][this.type];

        if (!specialtyFields) {
            console.debug(`No specialty configs found for frame: ${this.frame} and type: ${this.type}`);
        }

        await this.canvasHelper.drawUploadedArtwork(this.uploadedartwork, specialtyFields ? specialtyFields.uploadedartwork : defaultFields.uploadedartwork);
        await this.canvasHelper.drawBackground(this.getBackground(), 'Card Preview');

        Object.keys(defaultFields).forEach(field => {
            if (specialtyFields && specialtyFields[field]) {
                // Specialty fields are rendered later
                return Promise.resolve();
            }
            if (field === 'rarity') {
                this.canvasHelper.drawRarity(this.rarity, defaultFields.rarity);
                return;
            }

            this.drawProperty(field, defaultFields, {});
        });

        if (!specialtyFields) {
            // No specialty fields to render
            return Promise.resolve();
        }
        Object.keys(specialtyFields).forEach(field => {
            this.drawProperty(field, defaultFields, specialtyFields);
        });
    }

    drawProperty(property, defaultFields, specialtyFields) {
        if (['uploadedartwork'].includes(property)) {
            return Promise.resolve();
        }
        const drawCentered = [
            'name',
            'typetext',
        ];
        const propConfig = {
            name: property,
            text: this.getValue(property),
        }
        const fieldConfig = (specialtyFields[property] ?? defaultFields[property]) ?? null
        if (!fieldConfig) {
            // No config for this property
            return Promise.resolve();
        }
        let config = {
            ...propConfig,
            ...fieldConfig
        }

        if (drawCentered.includes(property)) {
            this.canvasHelper.drawCenteredText(config);
            return Promise.resolve();
        }

        this.canvasHelper.drawTextFromConfig(config);

        return Promise.resolve();
    }

    getTypeFolder() {
        if (["equipment", "hero", "token", "weapon", "resource"].includes(this.type)) {
            return this.type
        }
        if ("demi_hero" === this.type) {
            return "hero";
        }
        // Determine category based on attack/defense presence
        const hasPower = this.power;
        const hasDefense = this.defense;

        // Special categories (direct folder mapping)
        if (hasPower && hasDefense) {
            return "allstats";
        } else if (!hasDefense && hasPower) {
            return 'nodefense';
        } else if (!hasPower && hasDefense) {
            return "nopower";
        }

        return "nostats";
    }

    clamp(number, min, max) {
        return Math.max(min, Math.min(number, max));
    }

    getValue(name) {
        return this[name];
    }

    getCardBackName() {
        // img/cardbacks/allstats/1/aria_allstats_1_dented.png
        const re = /([^\\^\/]*?)_.*.png/
        const match = this.getBackground().match(re);

        if (!match || !match[1]) {
            return '';
        }

        return this.capitalizeFirstLetter(match[1]);
    }

    capitalizeFirstLetter(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }
}

export function useCard() {
    return Card;
}