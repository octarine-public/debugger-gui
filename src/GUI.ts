/* eslint-disable @typescript-eslint/naming-convention */
import {
	Color,
	EventsSDK,
	GUIInfo,
	Input,
	InputEventSDK,
	Rectangle,
	RendererSDK,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { RootMenu } from "./menu"

declare global {
	var INTERNAL_DEBUGGER_Step: () => void
	var INTERNAL_DEBUGGER_Restart: () => void
}

const rewind = new Rectangle(),
	playResume = new Rectangle()
let isPaused = true
function TogglePause(): void {
	isPaused = !isPaused
	latestDataUpdate = isPaused ? 0 : hrtime()
}

const GUINode = RootMenu.AddNode("Internal Debugger")
const draw = GUINode.AddToggle("Draw", true)
GUINode.AddKeybind("Play/Resume").OnPressed(() => TogglePause())
const speed = GUINode.AddSlider("Speed", 1, 0, 80, 1)
const buttonsBackground = new Color(0x16, 0x20, 0x34)

let latestDataUpdate = 0
export function DrawGUI(): void {
	if (globalThis.INTERNAL_DEBUGGER_Step === undefined) {
		return
	}
	if (latestDataUpdate !== 0) {
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
	if (!draw.value) {
		return
	}
	const screenSize = RendererSDK.WindowSize
	const buttonSize = new Vector2(
		GUIInfo.ScaleWidth(32, screenSize),
		GUIInfo.ScaleHeight(32, screenSize)
	)
	rewind.Width = playResume.Width = buttonSize.x
	rewind.Height = playResume.Height = buttonSize.y

	const buttonsGap = 6
	const buttonsWidth = buttonSize.x * 2 + buttonsGap

	let currentX =
		GUIInfo.TopBar.TimeOfDayTimeUntil.x +
		(GUIInfo.TopBar.TimeOfDayTimeUntil.Width - buttonsWidth) / 2
	rewind.x = currentX
	currentX += buttonSize.x + buttonsGap
	playResume.x = currentX

	const currentY = GUIInfo.TopBar.TimeOfDayTimeUntil.y - buttonSize.y
	rewind.y = playResume.y = currentY

	RendererSDK.FilledRect(rewind.pos1, buttonSize, buttonsBackground)
	RendererSDK.Image(
		"panorama/images/hud/reborn/icon_courier_inuse_psd.vtex_c",
		rewind.pos1,
		-1,
		buttonSize
	)
	RendererSDK.FilledRect(playResume.pos1, buttonSize, buttonsBackground)
	RendererSDK.Image(
		isPaused
			? "panorama/images/hud/dvr_play_png.vtex_c"
			: "panorama/images/hud/dvr_pause_png.vtex_c",
		playResume.pos1,
		-1,
		buttonSize
	)
}

InputEventSDK.on("MouseKeyDown", () => {
	if (!draw.value || globalThis.INTERNAL_DEBUGGER_Step === undefined) {
		return
	}
	const mousePos = Input.CursorOnScreen
	if (rewind.Contains(mousePos)) {
		globalThis.INTERNAL_DEBUGGER_Restart()
	} else if (playResume.Contains(mousePos)) {
		TogglePause()
	}
})

EventsSDK.on("PostDataUpdate", () => {
	if (!isPaused) {
		latestDataUpdate = hrtime()
	}
})
