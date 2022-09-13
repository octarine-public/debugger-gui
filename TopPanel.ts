import { Color, EntityManager, GameRules, GUIInfo, Player, PlayerResource, Rectangle, RendererSDK, Team, UnitData, Vector2 } from "github.com/octarine-public/wrapper/index"
import { RootMenu } from "./menu"

function DrawTopPanelHeroIcon(rect: Rectangle, hero_name: string, is_dead: boolean): void {
	if (hero_name === "")
		return
	RendererSDK.Image(
		`panorama/images/heroes/${hero_name}_png.vtex_c`,
		rect.pos1,
		-1,
		rect.Size,
		Color.White,
		0,
		undefined,
		is_dead,
	)
}

function DrawTopPanelRespawnTimer(
	rect: Rectangle,
	remaining: number,
): void {
	RendererSDK.FilledRect(
		rect.pos1,
		rect.Size,
		new Color(0x18, 0x1b, 0x1d),
	)
	const text = remaining.toString()
	const text_size = RendererSDK.GetTextSize(text)
	RendererSDK.Text(
		text,
		new Vector2(
			rect.pos1.x + (rect.Width - text_size.x) / 2,
			rect.pos1.y + (rect.Height - text_size.y) / 2,
		),
	)
}

function DrawTeamsBackground(): void {
	const radiant_rect = GUIInfo.TopBar.RadiantTeamBackground,
		dire_rect = GUIInfo.TopBar.DireTeamBackground
	RendererSDK.Image(
		"panorama/images/hud/reborn/top_bar_team_bg_psd.vtex_c",
		radiant_rect.pos1,
		-1,
		radiant_rect.Size,
	)
	RendererSDK.Image(
		"panorama/images/hud/reborn/top_bar_team_bg_psd.vtex_c",
		dire_rect.Size.AddForThis(dire_rect.pos1),
		-1,
		dire_rect.Size,
		Color.White,
		180,
	)
}

function DrawTeamScore(rect: Rectangle, score: number): void {
	const text = score.toString(),
		size = GUIInfo.ScaleHeight(22, RendererSDK.WindowSize)
	const text_size = RendererSDK.GetTextSize(text, "Calibri", size)
	RendererSDK.Text(
		text,
		new Vector2(
			rect.pos1.x + (rect.Width - text_size.x) / 2,
			rect.pos1.y + (rect.Height / 2) - text_size.y,
		),
		Color.White,
		"Calibri",
		size,
	)
}

function DrawTeamsScore(): void {
	let radiant_score = 0,
		dire_score = 0
	EntityManager.GetEntitiesByClass(Player).forEach(player => {
		const data = PlayerResource?.PlayerTeamData[player.PlayerID]
		if (data === undefined)
			return
		if (player.Team === Team.Radiant)
			radiant_score += data.Kills
		else if (player.Team === Team.Dire)
			dire_score += data.Kills
	})
	DrawTeamScore(GUIInfo.TopBar.RadiantTeamScore, radiant_score)
	DrawTeamScore(GUIInfo.TopBar.DireTeamScore, dire_score)
}

function DrawTimeOfDay(): void {
	const clock = GUIInfo.TopBar.TimeOfDay
	RendererSDK.Image(
		"panorama/images/hud/reborn/bg_timer_psd.vtex_c",
		clock.pos1,
		-1,
		clock.Size,
	)
	let time = GameRules?.GameTime ?? 0
	if (time < 0)
		time = Math.abs(time + 1)
	let seconds_text = Math.floor(time % 60).toString()
	if (seconds_text.length === 1)
		seconds_text = `0${seconds_text}`
	const text = `${Math.floor(time / 60)}:${seconds_text}`
	const text_size = RendererSDK.GetTextSize(text)
	RendererSDK.Text(
		text,
		new Vector2(
			clock.pos1.x + (clock.Width - text_size.x) / 2,
			clock.pos1.y + (clock.Height - text_size.y) / 2,
		),
	)
}

const State = RootMenu.AddToggle("Top Panel", true)
const Players = EntityManager.GetEntitiesByClass(Player)
export async function DrawTopPanel(): Promise<void> {
	if (!State.value)
		return
	DrawTeamsBackground()
	DrawTeamsScore()
	DrawTimeOfDay()
	for (const player of Players) {
		if (player.Team !== Team.Radiant && player.Team !== Team.Dire)
			continue
		const data = PlayerResource?.PlayerTeamData[player.PlayerID]
		if (data === undefined)
			continue
		const slot = data.TeamSlot
		if (slot >= 5)
			continue
		const rect = player.Team === Team.Radiant
			? GUIInfo.TopBar.RadiantPlayersHeroImages[slot]
			: GUIInfo.TopBar.DirePlayersHeroImages[slot]
		const is_dead = data.RespawnSeconds > 0
		DrawTopPanelHeroIcon(rect, await UnitData.GetHeroNameByID(data.SelectedHeroID), is_dead)
		if (is_dead)
			DrawTopPanelRespawnTimer(
				player.Team === Team.Radiant
					? GUIInfo.TopBar.RadiantPlayersRespawnTimers[slot]
					: GUIInfo.TopBar.DirePlayersRespawnTimers[slot],
				data.RespawnSeconds + 1,
			)
	}
}
