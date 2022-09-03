import { EventsSDK, Menu } from "./wrapper/Imports"

declare global {
	var INTERNAL_DEBUGGER_Skip: (seconds: number) => void
}

export const RootMenu = Menu.AddEntry("Debugger GUI", "panorama/images/plus/achievements/battlecup_icon_png.vtex_c")
RootMenu.AddKeybind("Emit fake Tick").OnRelease(async () => {
	await EventsSDK.emit("PreDataUpdate", false)
	await EventsSDK.emit("MidDataUpdate", false)
	await EventsSDK.emit("PostDataUpdate", false)
	await EventsSDK.emit("Tick", false, 0)
})

const SkipMenu = RootMenu.AddNode("Skip into the game")
const SkipMinute = SkipMenu.AddSlider("Minute", 5, 0, 120),
	SkipSecond = SkipMenu.AddSlider("Second", 0, 0, 59)
SkipMenu.AddButton("Skip").OnValue(() => {
	if (globalThis.INTERNAL_DEBUGGER_Skip !== undefined)
		INTERNAL_DEBUGGER_Skip(SkipMinute.value * 60 + SkipSecond.value)
})
