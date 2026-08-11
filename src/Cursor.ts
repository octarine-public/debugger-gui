
import { RootMenu } from "./menu"

const State = RootMenu.AddToggle("Show cursor")
export function DrawCursor(): void {
	if (!State.value) {
		return
	}
	const screenSize = RendererSDK.WindowSize
	RendererSDK.Image(
		"resource/cursor/source/cursor_default.png",
		InputManager.CursorOnScreen,
		-1,
		new Vector2(
			GUIInfo.ScaleWidth(28, screenSize),
			GUIInfo.ScaleHeight(28, screenSize)
		)
	)
}
