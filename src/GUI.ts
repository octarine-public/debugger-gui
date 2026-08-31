/* eslint-disable @typescript-eslint/naming-convention */

import { RootMenu } from "./menu"

declare global {
	var INTERNAL_DEBUGGER_Step: () => void
	var INTERNAL_DEBUGGER_Restart: () => void
}

const BUTTON = 32
const GAP = 6
const HEIGHT = 48

const rewind = new Rectangle(),
	playResume = new Rectangle()
let isPaused = true
function TogglePause(): void {
	isPaused = !isPaused
	latestDataUpdate = isPaused ? 0 : hrtime()
}

const GUINode = RootMenu.AddNode("Internal Debugger")
GUINode.SortNodes = false
const draw = GUINode.AddToggle("Draw", true)
GUINode.AddKeybind("Play/Resume").OnPressed(() => TogglePause())
const speed = GUINode.AddSlider("Speed", 1, 0, 80, 1)
const overlay = new MenuSDK.OverlayMenu(GUINode, 914, 130)
const panel = new MenuSDK.OverlayPanel(
	overlay,
	"hud-debugger-playback",
	MenuSDK.EPanelLife.MenuBound
)
draw.OnValue(control => overlay.SetHidden(!control.value))
overlay.SetHidden(!draw.value)

const size = new Vector2(),
	buttonSize = new Vector2(),
	box = new Rectangle()

function IsAttached(): boolean {
	return globalThis.INTERNAL_DEBUGGER_Step !== undefined
}

function IsVisible(): boolean {
	return draw.value && (IsAttached() || (MenuSDK.MenuManager.IsOpen && GUINode.IsOpen))
}

const drawContent = (origin: Vector2): void => {
	box.pos1.CopyFrom(origin)
	box.pos2.SetVector(origin.x + size.x, origin.y + size.y)
	MenuSDK.HudCard.Frame(box)
	const button = MenuSDK.hudW(BUTTON),
		gap = MenuSDK.hudW(GAP),
		pad = MenuSDK.hudW(MenuSDK.HudCard.Pad),
		top = box.y + (size.y - button) / 2
	buttonSize.SetVector(button, button)
	rewind.pos1.SetVector(box.x + pad, top)
	rewind.pos2.SetVector(box.x + pad + button, top + button)
	playResume.pos1.SetVector(rewind.pos2.x + gap, top)
	playResume.pos2.SetVector(playResume.pos1.x + button, top + button)
	MenuSDK.HudCard.Image(
		"panorama/images/hud/reborn/icon_courier_inuse_psd.vtex_c",
		rewind.pos1,
		buttonSize,
		Color.White,
		MenuSDK.hudAlpha()
	)
	MenuSDK.HudCard.Image(
		isPaused
			? "panorama/images/hud/dvr_play_png.vtex_c"
			: "panorama/images/hud/dvr_pause_png.vtex_c",
		playResume.pos1,
		buttonSize,
		Color.White,
		MenuSDK.hudAlpha()
	)
	if (isPaused) {
		MenuSDK.HudCard.Outline(
			playResume,
			MenuSDK.hudW(2),
			MenuSDK.HudColors.accent,
			MenuSDK.hudAlpha()
		)
	}
}

let latestDataUpdate = 0
export function DrawGUI(): void {
	if (IsAttached() && latestDataUpdate !== 0) {
		const tickTime = 1000 / (30 * speed.value),
			timePassed = hrtime() - latestDataUpdate
		const ticksPassed = Math.floor(timePassed / tickTime)
		if (ticksPassed !== 0) {
			for (let i = 0; i < ticksPassed; i++) {
				globalThis.INTERNAL_DEBUGGER_Step()
			}
			latestDataUpdate = 0
		}
	}
	if (!IsVisible()) {
		panel.Reset()
		return
	}
	MenuSDK.setHudScale(panel.Scale)
	const pad = MenuSDK.hudW(MenuSDK.HudCard.Pad)
	size.SetVector(
		Math.round(pad * 2 + MenuSDK.hudW(BUTTON) * 2 + MenuSDK.hudW(GAP)),
		Math.round(MenuSDK.hudH(HEIGHT))
	)
	panel.Draw(size, drawContent)
}

InputEventSDK.on("MouseKeyDown", key => {
	if (!IsVisible()) {
		return true
	}
	if (key === VMouseKeys.MK_LBUTTON && panel.HandlesInput() && IsAttached()) {
		const mousePos = InputManager.CursorOnScreen
		if (rewind.Contains(mousePos)) {
			globalThis.INTERNAL_DEBUGGER_Restart()
			return false
		}
		if (playResume.Contains(mousePos)) {
			TogglePause()
			return false
		}
	}
	return panel.MouseKeyDown(key)
})

InputEventSDK.on("MouseKeyUp", key => {
	if (!IsVisible()) {
		return true
	}
	return key !== VMouseKeys.MK_LBUTTON || panel.MouseKeyUp()
})

EventsSDK.on("GameEnded", () => panel.Reset())

EventsSDK.on("PostDataUpdate", () => {
	if (!isPaused) {
		latestDataUpdate = hrtime()
	}
})
