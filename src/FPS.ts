
import { RootMenu } from "./menu"

const storedFrameCount = 60
const lastFramesCalls: number[] = []
const State = RootMenu.AddToggle("Show FPS", true)

let visible = false
let element: Nullable<HTMLElement>

MenuSDK.RegisterPanel(
	"debugger-fps",
	() =>
		React.createElement("div", {
			ref: (el: Nullable<HTMLElement | null>) => (element = el ?? undefined),
			style: {
				position: "absolute",
				display: "none",
				pointerEvents: "none",
				color: "#ffff00",
				whiteSpace: "nowrap",
				fontEffect: "outline(1px #000000)"
			}
		}),
	MenuSDK.EPanelLayer.Screen
)

export function DrawFPS(): void {
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
	MenuSDK.WritePx(el, "right", GUIInfo.ScaleWidth(8))
	MenuSDK.WritePx(el, "top", GUIInfo.ScaleHeight(8))
	MenuSDK.WritePx(el, "font-size", GUIInfo.ScaleHeight(22))
	if (lastFramesCalls.length === storedFrameCount) {
		for (let i = 1; i < storedFrameCount; i++) {
			lastFramesCalls[i - 1] = lastFramesCalls[i]
		}
	} else {
		lastFramesCalls.push(0)
	}

	lastFramesCalls[lastFramesCalls.length - 1] = hrtime()

	let avgRendertimeSum = 0
	for (let i = 1; i < lastFramesCalls.length; i++) {
		avgRendertimeSum += lastFramesCalls[i] - lastFramesCalls[i - 1]
	}

	MenuSDK.WriteText(
		el,
		Math.ceil(1000 / (avgRendertimeSum / lastFramesCalls.length)).toString()
	)
}
