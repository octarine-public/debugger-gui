import { EventsSDK, Menu } from "./wrapper/Imports"

export const RootMenu = Menu.AddEntry("Debugger GUI", "panorama/images/plus/achievements/battlecup_icon_png.vtex_c")
RootMenu.AddKeybind("Emit fake Tick").OnRelease(async () => {
	await EventsSDK.emit("PreDataUpdate", false)
	await EventsSDK.emit("MidDataUpdate", false)
	await EventsSDK.emit("PostDataUpdate", false)
	await EventsSDK.emit("Tick", false, 0)
})
