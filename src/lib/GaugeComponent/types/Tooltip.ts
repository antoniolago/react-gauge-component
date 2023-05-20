export interface Tooltip {
    style: React.CSSProperties,
    text: string
}

export const defaultTooltipStyle = {
    borderColor: '#3D3D3D',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '5px',
    color: 'white',
    padding: '5px',
    fontSize: '15px',
    textShadow: '1px 1px 2px black, 0 0 1em black, 0 0 0.2em black'

    // fontSize: '15px'
}