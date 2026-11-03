export const canvas = new MenuSDK.Canvas("debugger-gui")

export const Scale = (value: number) =>
	Math.round((value * RendererSDK.WindowSize.y) / 1080)

/** Text centred in `box` */
export function TextCentered(
	text: string,
	box: Rectangle,
	style?: MenuSDK.CanvasTextStyle
): void {
	canvas.TextIn(text, box, { ...style, flags: TextFlags.Center })
}
