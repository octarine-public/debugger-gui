
import { RootMenu } from "./menu"

const State = RootMenu.AddToggle("Show cursor")

let visible = false
let element: Nullable<HTMLElement>

MenuSDK.RegisterPanel(
	"debugger-cursor",
	() =>
		React.createElement("img", {
			ref: (el: Nullable<HTMLElement | null>) => (element = el ?? undefined),
			src: "resource/cursor/source/cursor_default.png",
			style: {
				position: "absolute",
				display: "none",
				pointerEvents: "none",
				zIndex: 100
			}
		}),
	MenuSDK.EPanelLayer.Screen
)

export function DrawCursor(): void {
	const el = element
	if (el === undefined) {
		return
	}
	const show =
		State.value && GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
	if (!show) {
		if (visible) {
			MenuSDK.WriteShown(el, false)
			visible = false
		}
		return
	}
	if (!visible) {
		MenuSDK.WriteShown(el, true)
		visible = true
	}
	const position = InputManager.CursorOnScreen
	MenuSDK.WritePx(el, "left", position.x)
	MenuSDK.WritePx(el, "top", position.y)
	MenuSDK.WritePx(el, "width", GUIInfo.ScaleWidth(28))
	MenuSDK.WritePx(el, "height", GUIInfo.ScaleHeight(28))
}
