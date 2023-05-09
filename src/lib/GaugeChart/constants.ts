export const CONSTANTS: any = {
    startAngle: -Math.PI / 2 + 0.02, //Negative x-axis
    endAngle: Math.PI / 2 - 0.02, //Positive x-axis
    defaultStyle: {
        width: "100%",
    },
    // Props that should cause an animation on update
    animateNeedleProps:[
        "marginInPercent",
        "arcPadding",
        "value",
        "nrOfLevels",
        "animDelay",
    ],
    defaultColors: ["#5BE12C", "#F5CD19", "#EA4228"],
    debugMarkersRadius: false,
    debugSingleGauge: false,
    rangeBetweenCenteredMarkValueLabel: [0.35, 0.65]
} 
export default CONSTANTS;