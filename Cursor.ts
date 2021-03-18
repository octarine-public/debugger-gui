import { RootMenu } from "./menu"
import { GUIInfo, Input, RendererSDK, Vector2 } from "./wrapper/Imports"

const State = RootMenu.AddToggle("Show cursor")
export function DrawCursor(): void {
	if (!State.value)
		return
	const screen_size = RendererSDK.WindowSize
	RendererSDK.Image(
		"resource/cursor/source/cursor_default.png",
		Input.CursorOnScreen,
		-1,
		new Vector2(
			GUIInfo.ScaleWidth(28, screen_size),
			GUIInfo.ScaleHeight(28, screen_size),
		),
	)
}
