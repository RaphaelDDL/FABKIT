const card_backs = {
    dented: {
        default: {
            name: {
                x: 88,
                y: 41.2,
                width: 273.5,
                height: 31,
                fontFamily: 'Amanda Std Regular',
                fontSize: 25,
            },
            cost: {
                x: 372.1,
                y: 34.6,
                width: 48,
                height: 44,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 19,
                verticalAlign: "middle",
                stroke: "#C42025",
                strokeWidth: 2,
                fillAfterStrokeEnabled: true,
            },
            defense: {
                x: 352.3,
                y: 572,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            power: {
                x: 73,
                y: 572,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            typetext: {
                x: 116.3,
                y: 562.55,
                width: 217.2,
                height: 23,
                fontFamily: 'Amanda Std Regular',
                fontSize: 17.6,
                verticalAlign: "middle",
            },
            life: {
                x: 352.1,
                y: 572,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            rarity: {
                x: 126,
                y: 596,
                width: 12,
                height: 12,
            },
            uploadedartwork: {
                width: 390,
                height: 309,
                x: 30,
                y: 76,
            },
        },
        // Specialty cases
        hero: {
            name: {
                x: 55.6,
                y: 34.6,
                width: 338.5,
                height: 38,
                fontFamily: 'Amanda Std Regular',
                fontSize: 29,
            },
            herointellect: {
                x: 73.4,
                y: 572,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            uploadedartwork: {
                height: 628,
            },
        },
        demi_hero: {
            name: {
                x: 55.6,
                y: 34.6,
                width: 338.5,
                height: 38,
                fontFamily: 'Amanda Std Regular',
                fontSize: 29,
            },
            herointellect: {
                x: 73.4,
                y: 572,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            uploadedartwork: {
                height: 628,
            },
        },
    },
    flat: {
        default: {
            name: {
                x: 88,
                y: 41.2,
                width: 273.5,
                height: 31,
                fontFamily: 'Amanda Std Regular',
                fontSize: 25,
            },
            cost: {
                x: 372.1,
                y: 34.6,
                width: 48,
                height: 44,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 19,
                verticalAlign: "middle",
                stroke: "#C42025",
                strokeWidth: 2,
                fillAfterStrokeEnabled: true,
            },
            defense: {
                x: 352.3,
                y: 571.5,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            power: {
                x: 73,
                y: 571.5,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            typetext: {
                x: 116.3,
                y: 562.55,
                width: 217.2,
                height: 23,
                fontFamily: 'Amanda Std Regular',
                fontSize: 17.6,
                verticalAlign: "middle",
            },
            herointellect: {
                x: 73.4,
                y: 571.8,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            life: {
                x: 352.1,
                y: 571.8,
                width: 24,
                height: 29,
                fontFamily: 'Palatino LT Std Light',
                fontSize: 20.6,
                verticalAlign: "middle",
            },
            uploadedartwork: {
                width: 390,
                height: 309,
                x: 30,
                y: 76,
            },
        },
        hero: {
            uploadedartwork: {
                height: 628,
            },
        },
        demi_hero: {
            uploadedartwork: {
                height: 628,
            },
        }
    }
}

export function useCardBacks() {
    return card_backs;
}