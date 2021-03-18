import { DrawAttachments } from "./Attachments"
import { DrawCursor } from "./Cursor"
import { DrawEntities } from "./Entities"
import { DrawFPS } from "./FPS"
import { DrawGUI } from "./GUI"
import { DrawMinimap } from "./Minimap"
import { DrawTopPanel } from "./TopPanel"
import { DOTAGameUIState_t, EventsSDK, GameState } from "./wrapper/Imports"

EventsSDK.on("PreDraw", async () => {
	if (GameState.UIState !== DOTAGameUIState_t.DOTA_GAME_UI_DOTA_INGAME)
		return
	DrawAttachments()
	DrawEntities()
	DrawMinimap()
	await DrawTopPanel()
	DrawCursor()
	DrawFPS()
	DrawGUI()
})
