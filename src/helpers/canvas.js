import Konva from "konva";

const CanvasHelpers = class CanvasHelper {
    background = '';
    artworkLayer;
    backgroundLayer;
    footerLayer;
    textLayer;

    constructor() {
    }

    // function to calculate crop values from source image, its visible size and a crop strategy
    getCrop(image, size, clipPosition = 'center-middle') {
        const width = size.width;
        const height = size.height;
        const aspectRatio = width / height;

        let newWidth;
        let newHeight;

        const imageRatio = image.width / image.height;

        if (aspectRatio >= imageRatio) {
            newWidth = image.width;
            newHeight = image.width / aspectRatio;
        } else {
            newWidth = image.height * aspectRatio;
            newHeight = image.height;
        }

        let x = 0;
        let y = 0;
        if (clipPosition === 'left-top') {
            x = 0;
            y = 0;
        } else if (clipPosition === 'left-middle') {
            x = 0;
            y = (image.height - newHeight) / 2;
        } else if (clipPosition === 'left-bottom') {
            x = 0;
            y = image.height - newHeight;
        } else if (clipPosition === 'center-top') {
            x = (image.width - newWidth) / 2;
            y = 0;
        } else if (clipPosition === 'center-middle') {
            x = (image.width - newWidth) / 2;
            y = (image.height - newHeight) / 2;
        } else if (clipPosition === 'center-bottom') {
            x = (image.width - newWidth) / 2;
            y = image.height - newHeight;
        } else if (clipPosition === 'right-top') {
            x = image.width - newWidth;
            y = 0;
        } else if (clipPosition === 'right-middle') {
            x = image.width - newWidth;
            y = (image.height - newHeight) / 2;
        } else if (clipPosition === 'right-bottom') {
            x = image.width - newWidth;
            y = image.height - newHeight;
        } else if (clipPosition === 'scale') {
            x = 0;
            y = 0;
            newWidth = width;
            newHeight = height;
        } else {
            console.error(
                new Error('Unknown clip position property - ' + clipPosition)
            );
        }

        return {
            cropX: x,
            cropY: y,
            cropWidth: newWidth,
            cropHeight: newHeight,
        };
    }

    drawUploadedArtwork(src, config) {
        const self = this;

        const existing = self.artworkLayer.findOne('.artwork');
        if (existing && existing.attrs.image.src === src) {
            if (config.height && existing.attrs.height === config.height) {
                return;
            }
            existing.setAttrs(config);
            // apply default left-top crop
            applyCrop('center-middle');
            return;
        }

        self.artworkLayer.destroyChildren();

        // function to apply crop
        function applyCrop(pos) {
            const img = self.artworkLayer.findOne('.artwork');
            img.setAttr('lastCropUsed', pos);
            const crop = self.getCrop(
                img.image(),
                {width: img.width(), height: img.height()},
                pos
            );
            img.setAttrs(crop);
        }

        Konva.Image.fromURL(
            src,
            (img) => {
                img.setAttrs(
                    {
                        ...config,
                        ...{
                            name: 'artwork',
                            id: 'img-artwork',
                            draggable: false,
                        }
                    });
                self.artworkLayer.add(img);
                // apply default left-top crop
                applyCrop('center-middle');
            }
        );
    }

    drawRarity(src, config) {
        const self = this;

        const existing = self.footerLayer.findOne('.rarity');
        if (existing && existing.attrs.image.src === src) {
            return;
        }

        self.footerLayer.destroyChildren();

        Konva.Image.fromURL(
            src,
            (img) => {
                img.setAttrs(
                    {
                        ...config,
                        ...{
                            name: 'rarity',
                            id: 'img-ratiry',
                            draggable: false,
                        }
                    });
                self.footerLayer.add(img);
            }
        );
    }

    async drawBackground(src) {
        const self = this;

        const existing = self.backgroundLayer.findOne('.background');
        if (existing && existing.attrs.image.src.endsWith(src)) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            Konva.Image.fromURL(
                src,
                (img) => {
                    img.setAttrs({
                        x: 0,
                        y: 0,
                        name: 'background',
                        id: 'img-background',
                        draggable: false,
                    });
                    if (existing) {
                        // disable clear before draw
                        self.backgroundLayer.clearBeforeDraw(false);
                        self.backgroundLayer.destroyChildren()
                    }
                    // Enable clear before draw
                    self.backgroundLayer.clearBeforeDraw(true);
                    self.backgroundLayer.add(img);

                    resolve();
                }
            );
        });
    }

    drawText(fieldName, text, coordinates, fontFamily, fontSize) {
        const field = this.textLayer.findOne('.' + fieldName);
        if (field) {
            field.setAttrs(config);
            return;
        }

        const textNode = new Konva.Text({
            name: fieldName,
            x: coordinates.x,
            y: coordinates.y,
            width: coordinates.width,
            height: coordinates.height,
            align: 'center',
            verticalAlign: 'center',
            text: text,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: 'black'
        });

        this.textLayer.add(
            textNode
        );

        const tr = new Konva.Transformer({
            nodes: [textNode],
            resizeEnabled: false,
            rotateEnabled: false,
            rotateLineVisible: false,
            borderEnabled: false,
        });

        this.textLayer.add(tr);
    }

    drawCenteredText(config) {
        /**
         * @type {Text}
         */
        const field = this.textLayer.findOne('.' + config.name);
        if (field) {
            Object.keys(config).forEach((key) => {
                if (key === 'fontSize') {
                    return;
                }
                field.setAttr(key, config[key]);
            });
            this.setScaledFontSize(field, config);
            return;
        }

        const textConfig = {
            ...{
                align: 'center',
                verticalAlign: 'middle',
                fill: 'black',
            },
            ...config,
        };
        const textNode = new Konva.Text(textConfig);

        this.textLayer.add(
            textNode
        );

        this.setScaledFontSize(textNode, textConfig);

        let tr = new Konva.Transformer({
            nodes: [textNode],
            resizeEnabled: false,
            rotateEnabled: false,
            rotateLineVisible: false,
            borderEnabled: false,
        });

        this.textLayer.add(tr);
    }

    setScaledFontSize(textNode, config) {
        const scaledFontSize = this.scaledFontsize(
            textNode.attrs.text,
            config.fontSize,
            textNode.fontFamily(),
            textNode.width()
        )
        if (scaledFontSize <= config.fontSize) {
            textNode.fontSize(scaledFontSize);
        }
        // reset scale
        textNode.setAttrs({
            width: textNode.width() * textNode.scaleX(),
            height: textNode.height() * textNode.scaleY(),
            scaleX: 1, scaleY: 1
        });
    }

    drawTextFromConfig(config) {
        const field = this.textLayer.findOne('.' + config.name);
        if (field) {
            field.text(config.text);
            this.textLayer.batchDraw();
            return;
        }

        const textNode = new Konva.Text(
            {
                ...{
                    align: 'center',
                    verticalAlign: 'center',
                    fill: 'black',
                },
                ...config,
            }
        );
        this.textLayer.add(
            textNode
        );

        const tr = new Konva.Transformer({
            nodes: [textNode],
            resizeEnabled: false,
            rotateEnabled: false,
            rotateLineVisible: false,
            borderEnabled: false,
        });

        this.textLayer.add(tr);
    }

    scaledFontsize(text, fontSize, fontface, desiredWidth) {
        const c = document.createElement('canvas');
        const cctx = c.getContext('2d');
        cctx.font = fontSize + 'px ' + fontface;
        const textWidth = cctx.measureText(text).width;
        if (textWidth < desiredWidth) {
            return fontSize;
        }

        // Try and calculate the correct fontsize first
        let newFontSize = (((fontSize * desiredWidth) / textWidth));

        // If it's correct we return it
        if (cctx.measureText(text).width <= desiredWidth) {
            return newFontSize;
        }

        // increment the fontsize with 0.01 untill we get a good size
        while (cctx.measureText(text).width > desiredWidth) {
            newFontSize -= 0.01;
            cctx.font = newFontSize + 'px ' + fontface;
        }

        return newFontSize;
    }
}

export function useCanvasHelper() {
    return CanvasHelpers;
}