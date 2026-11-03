import { DrawAttachments } from "./Attachments"
import { DrawCursor } from "./Cursor"
import { DrawEntities } from "./Entities"
import { DrawFPS } from "./FPS"
import { DrawLowerHud } from "./LowerHud"
import { State } from "./menu"
import { DrawMinimap } from "./Minimap"
import { DrawReplay } from "./replay"
import { DrawTopPanel } from "./TopPanel"
import { DrawWorldBars } from "./WorldBars"

EventsSDK.on("Draw", () => {
	if (!State.value) {
		return
	}
	if (GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME) {
		DrawAttachments()
		DrawEntities()
		DrawWorldBars()
		DrawMinimap()
		DrawTopPanel()
		DrawLowerHud()
		DrawCursor()
		DrawFPS()
	}
	DrawReplay()
})
