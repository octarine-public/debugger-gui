import { canvas, Scale } from "./canvas"
import { GuiIcons, WithIcon } from "./icons"
import { RootMenu } from "./menu"
import { RealTime } from "./replay"

const storedFrameCount = 60
const lastFramesCalls: number[] = []
const State = WithIcon(RootMenu.AddToggle("Show FPS", true), GuiIcons.FPS)
export function DrawFPS(): void {
	if (!State.value) {
		return
	}
	if (lastFramesCalls.length === storedFrameCount) {
		lastFramesCalls.shift()
	}
	lastFramesCalls.push(RealTime())
	if (lastFramesCalls.length < 2) {
		return
	}
	const span = lastFramesCalls[lastFramesCalls.length - 1] - lastFramesCalls[0],
		fps = Math.round((1000 * (lastFramesCalls.length - 1)) / span),
		offset = Scale(8),
		window = RendererSDK.WindowSize
	canvas.TextIn(
		fps.toString(),
		new Rectangle(
			new Vector2(0, offset),
			new Vector2(window.x - offset, offset + Scale(26))
		),
		{ color: Color.Yellow, size: Scale(22), flags: TextFlags.Right | TextFlags.Top }
	)
}
