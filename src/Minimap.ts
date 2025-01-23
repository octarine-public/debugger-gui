import {
	Barrack,
	Building,
	Color,
	ConVarsSDK,
	Courier,
	Creep,
	DOTA_RUNES,
	DOTA_SHOP_TYPE,
	Entity,
	EntityManager,
	Fort,
	Fountain,
	GUIInfo,
	HallOfFame,
	Hero,
	MinimapSDK,
	NeutralItemStash,
	NeutralSpawner,
	NeutralSpawnerType,
	RendererSDK,
	RoshanSpawner,
	Rune,
	Shop,
	Siege,
	Team,
	Tower
} from "github.com/octarine-public/wrapper/index"

import { RootMenu } from "./menu"

function DrawMinimapBackground(): void {
	const minimapBlock = GUIInfo.Minimap.Minimap
	RendererSDK.Image(
		"panorama/images/hud/reborn/bg_minimap_psd.vtex_c",
		minimapBlock.pos1,
		-1,
		minimapBlock.Size,
		Color.White,
		0,
		minimapBlock
	)

	const minimap = GUIInfo.Minimap.MinimapRenderBounds,
		material = ConVarsSDK.GetBoolean("dota_minimap_simple_background", true)
			? (MinimapSDK.CurrentMinimapOverview?.simpleMaterial ??
				MinimapSDK.CurrentMinimapOverview?.material ??
				"")
			: (MinimapSDK.CurrentMinimapOverview?.material ??
				MinimapSDK.CurrentMinimapOverview?.simpleMaterial ??
				"")
	if (material !== "") {
		RendererSDK.Image(
			material,
			minimap.pos1,
			-1,
			minimap.Size,
			Color.White,
			0,
			minimapBlock
		)
	}
}

function DrawEntityIcon(
	ent: Entity,
	name: string,
	size = 600,
	color = Color.White,
	additionalPriority = 0
) {
	MinimapSDK.DrawIcon(
		name,
		ent.Position,
		size,
		color,
		0,
		ent,
		0,
		0,
		-Number.MAX_SAFE_INTEGER + additionalPriority
	)
}

function DrawMinimapCouriers(): void {
	EntityManager.GetEntitiesByClass(Courier).forEach(courier => {
		if (!courier.IsAlive || !courier.IsVisible) {
			return
		}
		DrawEntityIcon(
			courier,
			courier.Team === Team.Radiant
				? courier.IsFlying
					? "courier_flying"
					: "courier"
				: courier.IsFlying
					? "courier_dire_flying"
					: "courier_dire",
			200
		)
	})
}

function DrawMinimapHeroIcons(): void {
	EntityManager.GetEntitiesByClass(Hero).forEach(hero => {
		if (!hero.IsAlive || !hero.IsVisible) {
			return
		}
		DrawEntityIcon(hero, `heroicon_${hero.Name}`, 600, Color.White, 1)
	})
}

function DrawMinimapRuneIcons(): void {
	EntityManager.GetEntitiesByClass(Rune).forEach(rune => {
		if (!rune.IsVisible) {
			return
		}
		let runeName = "unknown"
		switch (rune.Type) {
			case DOTA_RUNES.DOTA_RUNE_ARCANE:
				runeName = "arcane"
				break
			case DOTA_RUNES.DOTA_RUNE_BOUNTY:
				runeName = "bounty"
				break
			case DOTA_RUNES.DOTA_RUNE_DOUBLEDAMAGE:
				runeName = "dd"
				break
			case DOTA_RUNES.DOTA_RUNE_HASTE:
				runeName = "haste"
				break
			case DOTA_RUNES.DOTA_RUNE_ILLUSION:
				runeName = "illusion"
				break
			case DOTA_RUNES.DOTA_RUNE_INVISIBILITY:
				runeName = "invis"
				break
			case DOTA_RUNES.DOTA_RUNE_REGENERATION:
				runeName = "regen"
				break
			default:
				break
		}
		DrawEntityIcon(rune, `rune_${runeName}`)
	})
}

function DrawMinimapBuildingIcons(): void {
	EntityManager.GetEntitiesByClass(Building).forEach(building => {
		if (!building.IsAlive || !building.IsVisible) {
			return
		}
		let buildingName = "miscbuilding"
		if (building instanceof Fort) {
			buildingName = "ancient"
		} else if (building instanceof Tower) {
			buildingName = building.Name.includes("mid") ? "tower45" : "tower90"
		} else if (building instanceof Barrack) {
			buildingName = building.Name.includes("mid") ? "racks45" : "racks90"
		} else if (building instanceof Shop) {
			switch (building.ShopType) {
				case DOTA_SHOP_TYPE.DOTA_SHOP_SECRET:
					buildingName = "secretshop"
					break
				case DOTA_SHOP_TYPE.DOTA_SHOP_SIDE:
					buildingName = "sideshop"
					break
				case DOTA_SHOP_TYPE.DOTA_SHOP_HOME:
					return
				default:
					buildingName = "shop"
					break
			}
		} else if (
			building instanceof HallOfFame ||
			building instanceof Fountain ||
			building instanceof NeutralItemStash
		) {
			return
		}
		DrawEntityIcon(
			building,
			buildingName,
			120,
			building.IsNeutral
				? Color.White
				: building.IsEnemy()
					? Color.Red
					: Color.Green
		)
	})
}

const campColor = new Color(159, 105, 0)
function DrawMinimapCreepCampIcons(): void {
	EntityManager.GetEntitiesByClass(NeutralSpawner).forEach(spawner => {
		let spawnerName = "creepcamp"
		switch (spawner.Type) {
			case NeutralSpawnerType.Ancient:
				spawnerName = "creepcamp_ancient"
				break
			case NeutralSpawnerType.Large:
				spawnerName = "creepcamp_big"
				break
			case NeutralSpawnerType.Medium:
				spawnerName = "creepcamp_mid"
				break
			default:
				break
		}
		DrawEntityIcon(spawner, spawnerName, 175, campColor)
	})
	EntityManager.GetEntitiesByClass(RoshanSpawner).forEach(spawner =>
		DrawEntityIcon(spawner, "roshancamp", 200, Color.Red)
	)
}

function DrawMinimapCreepIcons(): void {
	EntityManager.GetEntitiesByClass(Creep).forEach(creep => {
		if (!creep.IsAlive || !creep.IsVisible) {
			return
		}
		let creepName = "creep"
		if (creep instanceof Siege) {
			creepName = "siege"
		}
		DrawEntityIcon(creep, creepName, 110, creep.IsEnemy() ? Color.Red : Color.Green)
	})
}

const EntitiesNode = RootMenu.AddNode("Minimap")
const State = EntitiesNode.AddToggle("State", true),
	CreepCampIconsState = EntitiesNode.AddToggle("Creep Camps", true),
	CreepIcons = EntitiesNode.AddToggle("Creeps", true),
	RuneIcons = EntitiesNode.AddToggle("Runes", true),
	Couriers = EntitiesNode.AddToggle("Couriers", true),
	HeroIcons = EntitiesNode.AddToggle("Heroes", true),
	BuildingIcons = EntitiesNode.AddToggle("Buildings", true)
export function DrawMinimap(): void {
	if (!State.value) {
		return
	}
	DrawMinimapBackground()
	if (CreepCampIconsState.value) {
		DrawMinimapCreepCampIcons()
	}
	if (CreepIcons.value) {
		DrawMinimapCreepIcons()
	}
	if (RuneIcons.value) {
		DrawMinimapRuneIcons()
	}
	if (Couriers.value) {
		DrawMinimapCouriers()
	}
	if (HeroIcons.value) {
		DrawMinimapHeroIcons()
	}
	if (BuildingIcons.value) {
		DrawMinimapBuildingIcons()
	}
}
