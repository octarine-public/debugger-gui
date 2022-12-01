import {
	Color,
	EntityManager,
	GameRules,
	GUIInfo,
	Player,
	PlayerResource,
	Rectangle,
	RendererSDK,
	Team,
	UnitData,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { RootMenu } from "./menu"

function DrawTopPanelHeroIcon(rect: Rectangle, heroName: string, isDead: boolean): void {
	if (heroName === "") {
		return
	}
	RendererSDK.Image(
		`panorama/images/heroes/${heroName}_png.vtex_c`,
		rect.pos1,
		-1,
		rect.Size,
		Color.White,
		0,
		undefined,
		isDead
	)
}

function DrawTopPanelRespawnTimer(rect: Rectangle, remaining: number): void {
	RendererSDK.FilledRect(rect.pos1, rect.Size, new Color(0x18, 0x1b, 0x1d))
	const text = remaining.toString()
	const textSize = RendererSDK.GetTextSize(text)
	RendererSDK.Text(
		text,
		new Vector2(rect.pos1.x + (rect.Width - textSize.x) / 2, rect.pos1.y + (rect.Height - textSize.y) / 2)
	)
}

function DrawTeamsBackground(): void {
	const radiantRect = GUIInfo.TopBar.RadiantTeamBackground,
		direRect = GUIInfo.TopBar.DireTeamBackground
	RendererSDK.Image("panorama/images/hud/reborn/top_bar_team_bg_psd.vtex_c", radiantRect.pos1, -1, radiantRect.Size)
	RendererSDK.Image(
		"panorama/images/hud/reborn/top_bar_team_bg_psd.vtex_c",
		direRect.Size.AddForThis(direRect.pos1),
		-1,
		direRect.Size,
		Color.White,
		180
	)
}

function DrawTeamScore(rect: Rectangle, score: number): void {
	const text = score.toString(),
		size = GUIInfo.ScaleHeight(22, RendererSDK.WindowSize)
	const textSize = RendererSDK.GetTextSize(text, "Calibri", size)
	RendererSDK.Text(
		text,
		new Vector2(rect.pos1.x + (rect.Width - textSize.x) / 2, rect.pos1.y + rect.Height / 2 - textSize.y),
		Color.White,
		"Calibri",
		size
	)
}

function DrawTeamsScore(): void {
	let radiantScore = 0,
		direScore = 0
	EntityManager.GetEntitiesByClass(Player).forEach(player => {
		const data = PlayerResource?.PlayerTeamData[player.PlayerID]
		if (data === undefined) {
			return
		}
		if (player.Team === Team.Radiant) {
			radiantScore += data.Kills
		} else if (player.Team === Team.Dire) {
			direScore += data.Kills
		}
	})
	DrawTeamScore(GUIInfo.TopBar.RadiantTeamScore, radiantScore)
	DrawTeamScore(GUIInfo.TopBar.DireTeamScore, direScore)
}

function DrawTimeOfDay(): void {
	const clock = GUIInfo.TopBar.TimeOfDay
	RendererSDK.Image("panorama/images/hud/reborn/bg_timer_psd.vtex_c", clock.pos1, -1, clock.Size)
	let time = GameRules?.GameTime ?? 0
	if (time < 0) {
		time = Math.abs(time + 1)
	}
	let secondsText = Math.floor(time % 60).toString()
	if (secondsText.length === 1) {
		secondsText = `0${secondsText}`
	}
	const text = `${Math.floor(time / 60)}:${secondsText}`
	const textSize = RendererSDK.GetTextSize(text)
	RendererSDK.Text(
		text,
		new Vector2(clock.pos1.x + (clock.Width - textSize.x) / 2, clock.pos1.y + (clock.Height - textSize.y) / 2)
	)
}

const State = RootMenu.AddToggle("Top Panel", true)
const Players = EntityManager.GetEntitiesByClass(Player)
export function DrawTopPanel(): void {
	if (!State.value) {
		return
	}
	DrawTeamsBackground()
	DrawTeamsScore()
	DrawTimeOfDay()
	for (const player of Players) {
		if (player.Team !== Team.Radiant && player.Team !== Team.Dire) {
			continue
		}
		const data = PlayerResource?.PlayerTeamData[player.PlayerID]
		if (data === undefined) {
			continue
		}
		const slot = data.TeamSlot
		if (slot >= 5) {
			continue
		}
		const rect =
			player.Team === Team.Radiant
				? GUIInfo.TopBar.RadiantPlayersHeroImages[slot]
				: GUIInfo.TopBar.DirePlayersHeroImages[slot]
		const isDead = data.RespawnSeconds > 0
		DrawTopPanelHeroIcon(rect, UnitData.GetHeroNameByID(data.SelectedHeroID), isDead)
		if (isDead) {
			DrawTopPanelRespawnTimer(
				player.Team === Team.Radiant
					? GUIInfo.TopBar.RadiantPlayersRespawnTimers[slot]
					: GUIInfo.TopBar.DirePlayersRespawnTimers[slot],
				data.RespawnSeconds + 1
			)
		}
	}
}
