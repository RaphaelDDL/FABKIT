import {computed, nextTick, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {useCardBacks} from "../config/cardbacks.js";
import {useCardBackSettings} from "../config/cardSettings.js";
import {useMath} from "./math.js";
import useTypes from "../config/types.js";
import {useCardRarities} from "./cardRarities.js";
import {useCanvasHelper} from "./canvas.js";
import {useTextConfig} from "../config/text.js";
import {toPng} from "html-to-image";

const {clamp} = useMath();

const capitalizeFirstLetter = function (val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function useCard() {
    const fields = reactive({
        cardType: '',
        cardPitch: '',
        cardName: '',
        cardResource: '',
        cardText: '',
        cardPower: '',
        cardHeroIntellect: '',
        cardTalent: '',
        cardClass: '',
        cardSecondaryClass: '',
        cardSubType: '',
        cardMacroGroup: '',
        cardWeapon: '',
        cardRarity: 0,
        cardDefense: '',
        cardLife: '',
        cardUploadedArtwork: '',
        cardFooterText: '',
        cardArtworkCredits: '',
        cardBorderRound: false,
    });
    const cardTypeText = computed(() => {
        const classText = fields.cardClass;

        let subTypeText;
        switch (fields.cardType) {
            default:
                subTypeText = fields.cardSubType;
                break;
        }

        if (subTypeText) {
            subTypeText = ' - ' + subTypeText;
        }
        if (fields.cardType === 'weapon') {
            subTypeText += ' ' + fields.cardWeapon;
        }
        if (fields.cardType === 'weapon_equipment') {
            subTypeText += ' ' + fields.cardWeapon;
        }

        let type = capitalizeFirstLetter(fields.cardType).split('_').map((word) => capitalizeFirstLetter(word)).join(' ');
        if (type === 'Demi Hero') type = 'Demi-Hero';

        let secondaryClass = '';
        if (fields.cardSecondaryClass) {
            const separator = ['hero', 'demi_hero'].includes(fields.cardType) ? ' ' : ' / ';
            secondaryClass = separator + fields.cardSecondaryClass;
            if (fields.cardSecondaryClass === 'Custom') {
                secondaryClass = separator + fields.cardSecondaryClassCustom;
            }
        }

        const talent = fields.cardTalent;

        // Filter out null, undefined, and empty string values before joining
        const parts = [talent, classText, secondaryClass, type, subTypeText]
            .filter(part => part && part !== 'null' && part !== 'undefined' && part.trim() !== '');

        return parts.join(' ')
            .replace(/  +/g, ' ')
            .trim();
    });

    const types = useTypes();

    const activeFields = computed(() => {
        if (fields.cardType === '') return [];

        const selectedType = types.find(t => t.type === fields.cardType);
        if (!selectedType) return false;


        return selectedType.fields.map(el => el.id);
    })
    const isFieldShown = (fieldId) => {
        if (!activeFields.value.includes(fieldId)) {
            fields[fieldId] = '';
            return false;
        }

        if (fields.cardType === 'action') {
            if (fieldId === 'cardDefense' && fields.cardSubType === 'Ally') {
                fields.cardDefense = '';
                return false;
            }
            if (fieldId === 'cardLife' && fields.cardSubType !== 'Ally') {
                fields.cardLife = '';
                return false;
            }
        }

        return true;
    };

    const cardbacks = useCardBacks();

    const availableCardbacks = computed(() => {
        return cardbacks.filter(el => {
            let type = 'General';
            if (fields.cardType === 'ally') {
                type = 'token';
            }
            if (['equipment', 'hero', 'demi_hero', 'equipment', 'weapon', 'token', 'resource'].includes(fields.cardType)) {
                type = fields.cardType;
                if (fields.cardType === 'demi_hero') {
                    type = 'hero';
                }
            }
            if (fields.cardType === 'weapon_equipment') {
                type = 'weapon';
            }
            if (fields.cardType === 'event') {
                type = 'event';
            }
            return el.type.toLowerCase() === type.toLowerCase();
        });
    });

    const filteredAvailableCardbacks = computed(() => {

        // Filter based on dented property
        if (selectedStyle.value === 'dented') {
            // Only show cardbacks where dented is explicitly true
            return availableCardbacks.value.filter(cb => cb.dented === true);
        } else if (selectedStyle.value === 'flat') {
            // Show cardbacks where dented is false, undefined, or null
            return availableCardbacks.value.filter(cb => !cb.dented);
        }

        return availableCardbacks.value;
    });

    const currentCardback = computed(() => {
        const filtered = filteredAvailableCardbacks.value;

        if (backgroundIndex.value > (filtered.length - 1)) {
            // Only reset if we have a filtered list and no pending style change
            if (filtered.length > 0) {
                backgroundIndex.value = 0;
            }
        }

        return filtered[backgroundIndex.value] || filtered[0];
    })

    const currentBackground = computed(() => {
        let currentPitch = fields.cardPitch || 1;
        if (currentCardback.value.images.length < currentPitch) {
            // Reset pitch to 1 if the current pitch is invalid
            currentPitch = 1;
        }
        return currentCardback.value.images.find(el => String(el.pitch) === String(currentPitch)).url
    });

    const frameType = computed(() => {
        if (currentCardback.value.dented) {
            return 'dented';
        }

        return 'flat';
    });

    const cardTextStyle = computed(() => {
        let base = `transform: translateX(calc(-50% * ${scale.value}));height: calc(135px * ${scale.value});width: calc(345px * ${scale.value}););`
        // Return the frame type CSS style
        if (frameType.value === 'flat') {
            return base + `top: calc(397.3px * ${scale.value});left: calc(50.165% * ${scale.value});`;
        }

        return base + `top:calc(408px * ${scale.value});left: calc(50% * ${scale.value});`
    });

    const cardBackSettings = useCardBackSettings();

    const getConfig = function (fieldName) {
        if (!cardBackSettings[frameType.value]) return {};
        if (cardBackSettings[frameType.value][fields.cardType] && cardBackSettings[frameType.value][fields.cardType][fieldName]) {
            return {
                ...cardBackSettings[frameType.value][fields.cardType][fieldName],
            };
        }
        if (cardBackSettings[frameType.value].default[fieldName]) {
            return {
                ...cardBackSettings[frameType.value].default[fieldName],
            };
        }

        return {};
    }

    const backgroundIndex = ref(0);
    const selectedStyle = ref('dented');

    const switchBackground = function (dir) {
        const available = filteredAvailableCardbacks.value;
        if (dir === 'next') {
            backgroundIndex.value = clamp(
                (backgroundIndex.value + 1) % available.length,
                0,
                available.length - 1
            );

            return Promise.resolve();
        }
        if (dir === 'previous') {
            backgroundIndex.value = clamp(
                (backgroundIndex.value - 1 + available.length) % available.length,
                0,
                available.length - 1
            );
            return Promise.resolve();
        }

        return Promise.resolve();
    }


    const scaledFontsize = function (text, fontSize, fontface, desiredWidth, desiredHeight = null) {
        if (!text || !fontSize || !fontface || !desiredWidth) {
            return fontSize;
        }

        const c = document.createElement('canvas');
        const cctx = c.getContext('2d');
        cctx.font = fontSize + 'px ' + fontface;
        const textWidth = cctx.measureText(text).width;

        // Estimate text height (approximate)
        const textHeight = fontSize * 1.2; // Line height is typically 1.2x font size

        // Check if text fits both width and height (if height is specified)
        const fitsWidth = textWidth <= desiredWidth;
        const fitsHeight = !desiredHeight || textHeight <= desiredHeight;

        if (fitsWidth && fitsHeight) {
            return fontSize;
        }

        // Calculate scaling factor based on both width and height constraints
        let widthScale = desiredWidth / textWidth;
        let heightScale = desiredHeight ? desiredHeight / textHeight : 1;

        // Use the more restrictive scaling factor
        let newFontSize = fontSize * Math.min(widthScale, heightScale);

        // Fine-tune with the existing logic but check both dimensions
        cctx.font = newFontSize + 'px ' + fontface;
        while (cctx.measureText(text).width > desiredWidth ||
        (desiredHeight && newFontSize * 1.2 > desiredHeight)) {
            newFontSize -= 0.01;
            cctx.font = newFontSize + 'px ' + fontface;

            // Prevent infinite loop
            if (newFontSize <= 1) break;
        }

        return newFontSize;
    }

    const nameFontSize = computed(() => {
        const config = getConfig('cardName') || {};

        return scaledFontsize(fields.cardName, config.fontSize, config.fontFamily, config.width);
    })

    const typeTextFontSize = computed(() => {
        const typeTextConfig = getConfig('cardTypeText') || {};

        return scaledFontsize(
            cardTypeText.value,
            typeTextConfig.fontSize,
            typeTextConfig.fontFamily,
            typeTextConfig.width,
            typeTextConfig.height
        );
    })

    const footerTextFontSize = computed(() => {
        const footerTextConfig = getConfig('cardFooterText') || {};

        return scaledFontsize(cardTypeText.value, footerTextConfig.fontSize, footerTextConfig.fontFamily, footerTextConfig.width);
    })

    watch(selectedStyle, () => {
        backgroundIndex.value = 0;
    });

    const findBestMatch = (targetName, cardbackList) => {
        if (!targetName || !cardbackList.length) return 0;

        const calculateSimilarity = (str1, str2) => {
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;

            if (longer.length === 0) return 1;

            const editDistance = (s1, s2) => {
                const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

                for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
                for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

                for (let j = 1; j <= s2.length; j++) {
                    for (let i = 1; i <= s1.length; i++) {
                        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                        matrix[j][i] = Math.min(
                            matrix[j][i - 1] + 1,
                            matrix[j - 1][i] + 1,
                            matrix[j - 1][i - 1] + cost
                        );
                    }
                }

                return matrix[s2.length][s1.length];
            };

            return (longer.length - editDistance(longer, shorter)) / longer.length;
        };

        let bestMatch = 0;
        let highestSimilarity = 0;

        cardbackList.forEach((cardback, index) => {
            const similarity = calculateSimilarity(
                targetName.toLowerCase(),
                cardback.name.toLowerCase()
            );

            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = index;
            }
        });

        return bestMatch;
    };


    const handleStyleToggle = (event) => {
        const currentCardbackName = currentCardback.value?.name;

        selectedStyle.value = event.target.checked ? 'flat' : 'dented';

        if (currentCardbackName) {
            nextTick(() => {
                const newFilteredCardbacks = filteredAvailableCardbacks.value;
                const exactMatchIndex = newFilteredCardbacks.findIndex(cb => cb.name === currentCardbackName);

                if (exactMatchIndex !== -1) {
                    backgroundIndex.value = exactMatchIndex;
                } else {
                    backgroundIndex.value = findBestMatch(currentCardbackName, newFilteredCardbacks);
                }
            });
        }
    };

    const {cardRarities} = useCardRarities();
    const cardRarityImage = computed(() => {
        return cardRarities.find(value => value.id === fields.cardRarity).image[0].value;
    })


    const containerElement = ref();
    const contentElement = ref();

    const {flatConfig, dentedConfig} = useTextConfig();
    const frameTypeTextConfig = computed(() => {
        if (frameType.value === 'flat') {
            return flatConfig;
        } else {
            return dentedConfig;
        }
    });

    const fontsLoaded = ref(false);

    const flatFooterText = computed(() => {
        if (!fontsLoaded.value) {
            return '';
        }
        return `FaB TCG BY${String.fromCharCode(0x00A0)}${String.fromCharCode(0x00A0)}${String.fromCharCode(0x00A0)}LSS`;
    });

    const dentedFooterText = computed(() => {
        if (!fontsLoaded.value) {
            return '';
        }
        return `NOT TOURNAMENT LEGAL - FaB TCG BY${String.fromCharCode(0x00A0)}${String.fromCharCode(0x00A0)}${String.fromCharCode(0x00A0)}LSS`;
    });

    const artworkCreditsText = computed(() => {
        if (!fontsLoaded.value) {
            return '';
        }
        if (selectedStyle.value === 'flat') {
            if (!fields.cardArtworkCredits) return '';
            return 'FABKIT | ' + fields.cardArtworkCredits.toUpperCase() + ' | NOT TOURNAMENT LEGAL';
        }

        if (!fields.cardArtworkCredits) return 'FABKIT - ' + dentedFooterText.value;

        return `FABKIT - ` + fields.cardArtworkCredits.toUpperCase();
    })

    const resizeText = ({element, minSize = frameTypeTextConfig.value.minFontSize, maxSize = frameTypeTextConfig.value.maxFontSize, step = frameTypeTextConfig.value.step, unit = 'px'}) => {
        if (!element) {
            return;
        }
        const parent = element.parentNode;
        const maxHeight = parent.clientHeight;

        // Binary search for the optimal font size
        let low = minSize;
        let high = maxSize;
        let optimalSize = minSize;

        // Helper function to calculate line height based on font size
        const calculateLineHeight = (fontSize) => {
            return ((fontSize / frameTypeTextConfig.value.baseFontSize) * frameTypeTextConfig.value.baseLineHeight) * scale.value;
        };

        // UPDATED: Apply styles to element and paragraphs
        const applyStyles = (size) => {
            element.style.fontSize = `${(size * scale.value)}${unit}`;
            element.style.lineHeight = `${calculateLineHeight(size)}${unit}`;

            // Apply paragraph spacing
            const paragraphs = element.querySelectorAll('p');
            paragraphs.forEach((p, index) => {
                p.style.margin = '0';
                p.style.padding = '0';
                // Add margin-top to all paragraphs except the first
                if (index > 0) {
                    p.style.marginTop = `${(calculateLineHeight(size) * frameTypeTextConfig.value.paragraphSpacing)}${unit}`;
                }
            });
        };

        // Helper function to check if content overflows parent
        const isOverflowing = (size) => {
            applyStyles(size);

            // Check if element's scroll height exceeds parent's client height
            return element.scrollHeight > maxHeight;
        };

        // First check if max size fits
        if (!isOverflowing(maxSize)) {
            applyStyles(maxSize);
            return;
        }

        // Binary search
        while (high - low > step) {
            const mid = (low + high) / 2;

            if (!isOverflowing(mid)) {
                optimalSize = mid;
                low = mid;
            } else {
                high = mid;
            }
        }

        // Apply the optimal size
        applyStyles(optimalSize);
    };

    function recalculateRatio() {
        if (containerElement.value === undefined || contentElement.value === undefined) return;

        resizeText({
            element: contentElement.value,
            minSize: frameTypeTextConfig.value.minFontSize,
            maxSize: frameTypeTextConfig.value.maxFontSize,
            step: frameTypeTextConfig.value.step
        });
    }

    watch(() => fields.cardText, () => {
        nextTick().then(() => {
            recalculateRatio();
        })
    }, {deep: true});

    watch(frameType, (newFrameType) => {
        // Only proceed if frameType is actually defined
        if (newFrameType) {
            nextTick().then(() => {
                recalculateRatio();
            });
        }
    });

    const loadingBackground = ref(false);

    const doLoading = async function (callback) {
        loadingBackground.value = true;
        const konvaStage = stage.value.getStage();
        if (loadingBackground.value === true) {
            konvaStage.opacity(0.5)
        }

        callback().finally(() => {
            loadingBackground.value = false;
            konvaStage.opacity(1);
        });
    }


    const CanvasHelper = useCanvasHelper();
    const stage = ref();
    const artwork = ref();
    const background = ref();

    const canvasHelper = new CanvasHelper();

    watch(currentBackground, (newBackground) => {
        nextTick().then(async () => {
            await doLoading(async () => {
                return canvasHelper.drawBackground(newBackground);
            })
        })
    });

    watch(fields.cardText, () => {
        nextTick().then(async () => {
            updateSize();
            recalculateRatio();
        })
    })

    watch(() => fields.cardType, (newCardType) => {
        nextTick().then(() => {
            updateSize();
            recalculateRatio();
        });
        if (!newCardType) return;
        canvasHelper.drawBackground(currentBackground.value);
        canvasHelper.drawUploadedArtwork(fields.cardUploadedArtwork, getConfig('cardUploadedArtwork'));
        if (fontsLoaded.value === false) {
            nextTick().then(() => {
                setTimeout(() => fontsLoaded.value = true, 100)
            })
        }
    }, {deep: true});

    watch(() => fields.cardUploadedArtwork, (newUploadedArtwork) => {
        canvasHelper.drawUploadedArtwork(newUploadedArtwork, getConfig('cardUploadedArtwork'));
    }, {deep: true});

    watch(() => fields.cardClass, (newValue) => {
        if (!newValue) {
            fields.cardSecondaryClass = ''
        }
    })

    watch(() => fields.cardBorderRound, (newValue) => {
        canvasHelper.enableClipping = newValue;
        canvasHelper.updateClipping();
    })

    // Define virtual size for our scene
    const sceneWidth = 450;
    const sceneHeight = 628;

    // Reactive references
    const stageContainerRef = ref(null);
    const scale = ref(1);

    // Computed properties for stage dimensions
    const stageWidth = computed(() => sceneWidth * scale.value);
    const stageHeight = computed(() => sceneHeight * scale.value);

    // Function to handle resize
    const updateSize = () => {
        if (!stageContainerRef.value) return;

        // Get container width
        let containerWidth = stageContainerRef.value.offsetWidth;

        if (0 === containerWidth) {
            containerWidth = sceneWidth;
        }

        // Calculate scale
        scale.value = containerWidth / sceneWidth;
    };

    onMounted(() => {
        fields.cardRarity = 1;
        canvasHelper.artworkLayer = artwork.value;
        canvasHelper.backgroundLayer = background.value;
        canvasHelper.stageLayer = stage.value.getStage();
        updateSize();
        recalculateRatio();
        // Add event listener
        window.addEventListener('resize', () => {
            nextTick().then(() => {
                updateSize();
                recalculateRatio();
            });
        });
    });

    onUnmounted(() => {
        // Clean up
        window.removeEventListener('resize', () => {
            nextTick().then(() => {
                updateSize();
                recalculateRatio();
            });
        });

        fields.cardType = '';
        fields.cardPitch = '';
        fields.cardName = '';
        fields.cardResource = '';
        fields.cardText = '';
        fields.cardPower = '';
        fields.cardHeroIntellect = '';
        fields.cardTalent = '';
        fields.cardClass = '';
        fields.cardSecondaryClass = '';
        fields.subType = '';
        fields.cardMacroGroup = '';
        fields.cardWeapon = '';
        fields.cardRarity = 0;
        fields.cardDefense = '';
        fields.cardLife = '';
        fields.cardUploadedArtwork = '';
        fields.cardFooterText = '';
        fields.cardBorderRound = true;
    });

    const downloadURI = function (uri, name) {
        const link = document.createElement('a');
        link.download = name;
        link.href = uri;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link.remove();
    }

    const downloadImage = function () {
        downloadingImage.value = true;
        const stageInstance = stage.value.getStage();
        stageInstance.setWidth(450);
        stageInstance.setHeight(628);
        stageInstance.setScale(1, 1);
        scale.value = 1;
        stageInstance.batchDraw();
        recalculateRatio();
        nextTick(() => {
            setTimeout(() => {
                toPng(document.querySelector('.cardParent'), {
                    width: 450,
                    canvasWidth: 450,
                    height: 628,
                    canvasHeight: 628,
                })
                    .then((dataUrl) => {
                        downloadURI(dataUrl, (fields.cardName || 'card') + '.png');
                    })
                    .catch((err) => {
                        console.error('oops, something went wrong!', err);
                    }).finally(() => {
                    downloadingImage.value = false;
                    updateSize();
                    recalculateRatio();
                    stageInstance.batchDraw();
                });
            }, 300);
        })
    }

    const downloadingImage = ref(false);

    const generateAndOpen = function () {
        downloadingImage.value = true;
        const stageInstance = stage.value.getStage();
        stageInstance.setWidth(450);
        stageInstance.setHeight(628);
        stageInstance.setScale(1, 1);
        scale.value = 1;
        stageInstance.batchDraw();
        recalculateRatio();
        nextTick(() => {
            setTimeout(() => {
                toPng(document.querySelector('.cardParent'), {
                    width: 450,
                    canvasWidth: 450,
                    height: 628,
                    canvasHeight: 628,
                })
                    .then((dataUrl) => {
                        // Open in new tab instead of downloading
                        const newWindow = window.open();
                        newWindow.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;" alt="Generated Card">`);
                        newWindow.document.title = fields.cardName || 'Generated Card';
                    })
                    .catch((err) => {
                        console.error('oops, something went wrong!', err);
                    }).finally(() => {
                    downloadingImage.value = false;
                    updateSize();
                    recalculateRatio();
                    stageInstance.batchDraw();
                });
            }, 300);
        })
    }

    return {
        types,
        fields,
        cardTypeText,
        isFieldShown,
        currentBackground,
        getConfig,
        switchBackground,
        selectedStyle,
        nameFontSize,
        typeTextFontSize,
        footerTextFontSize,
        frameType,
        cardTextStyle,
        filteredAvailableCardbacks,
        backgroundIndex,
        handleStyleToggle,
        cardRarityImage,
        stage,
        artwork,
        background,
        flatFooterText,
        dentedFooterText,
        artworkCreditsText,
        containerElement,
        contentElement,
        stageContainerRef,
        stageWidth,
        stageHeight,
        scale,
        downloadImage,
        loadingBackground,
        downloadingImage,
        generateAndOpen,
    };
}
