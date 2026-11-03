import { canvas, Scale } from "./canvas"
import { RootMenu } from "./menu"

const State = RootMenu.AddToggle("Show cursor")
export function DrawCursor(): void {
	if (!State.value) {
		return
	}
	const size = Scale(28)
	canvas.Image(
		"resource/cursor/source/cursor_default.png",
		InputManager.CursorOnScreen,
		new Vector2(size, size)
	)
}
