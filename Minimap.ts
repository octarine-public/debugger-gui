import { RootMenu } from "./menu"
import { Barrack, Building, Color, Courier, Creep, DOTA_RUNES, DOTA_SHOP_TYPE, Entity, EntityManager, Fort, Fountain, GUIInfo, HallOfFame, Hero, MinimapSDK, NeutralItemStash, NeutralSpawner, NeutralSpawnerType, RendererSDK, RoshanSpawner, Rune, Shop, Siege, Team, Tower } from "./wrapper/Imports"

function DrawMinimapBackground(): void {
	const minimap_block = GUIInfo.Minimap.Minimap
	RendererSDK.Image(
		"panorama/images/hud/reborn/bg_minimap_psd.vtex_c",
		minimap_block.pos1,
		-1,
		minimap_block.Size,
		Color.White,
		0,
		minimap_block,
	)

	const minimap = GUIInfo.Minimap.MinimapRenderBounds,
		material = ConVars.GetInt("dota_minimap_simple_background") !== 0
			? MinimapSDK.CurrentMinimapOverview?.simple_material ?? MinimapSDK.CurrentMinimapOverview?.material ?? ""
			: MinimapSDK.CurrentMinimapOverview?.material ?? MinimapSDK.CurrentMinimapOverview?.simple_material ?? ""
	if (material !== "") {
		RendererSDK.Image(
			material,
			minimap.pos1,
			-1,
			minimap.Size,
			Color.White,
			0,
			minimap_block,
		)
	}
}

function DrawEntityIcon(ent: Entity, name: string, size = 600, color = Color.White, additional_priority = 0) {
	MinimapSDK.DrawIcon(
		name,
		ent.Position,
		size,
		color,
		0,
		ent,
		0,
		0,
		-Number.MAX_SAFE_INTEGER + additional_priority,
	)
}

function DrawMinimapCouriers(): void {
	EntityManager.GetEntitiesByClass(Courier).forEach(courier => {
		if (!courier.IsAlive || !courier.IsVisible)
			return
		DrawEntityIcon(
			courier,
			courier.Team === Team.Radiant
				? courier.IsFlying
					? "courier_flying"
					: "courier"
				: courier.IsFlying
					? "courier_dire_flying"
					: "courier_dire",
			200,
		)
	})
}

function DrawMinimapHeroIcons(): void {
	EntityManager.GetEntitiesByClass(Hero).forEach(hero => {
		if (!hero.IsAlive || !hero.IsVisible)
			return
		DrawEntityIcon(hero, `heroicon_${hero.Name}`, 600, Color.White, 1)
	})
}

function DrawMinimapRuneIcons(): void {
	EntityManager.GetEntitiesByClass(Rune).forEach(rune => {
		if (!rune.IsVisible)
			return
		let rune_name = "unknown"
		switch (rune.Type) {
			case DOTA_RUNES.DOTA_RUNE_ARCANE:
				rune_name = "arcane"
				break
			case DOTA_RUNES.DOTA_RUNE_BOUNTY:
				rune_name = "bounty"
				break
			case DOTA_RUNES.DOTA_RUNE_DOUBLEDAMAGE:
				rune_name = "dd"
				break
			case DOTA_RUNES.DOTA_RUNE_HASTE:
				rune_name = "haste"
				break
			case DOTA_RUNES.DOTA_RUNE_ILLUSION:
				rune_name = "illusion"
				break
			case DOTA_RUNES.DOTA_RUNE_INVISIBILITY:
				rune_name = "invis"
				break
			case DOTA_RUNES.DOTA_RUNE_REGENERATION:
				rune_name = "regen"
				break
			default:
				break
		}
		DrawEntityIcon(rune, `rune_${rune_name}`)
	})
}

function DrawMinimapBuildingIcons(): void {
	EntityManager.GetEntitiesByClass(Building).forEach(building => {
		if (!building.IsAlive || !building.IsVisible)
			return
		let building_name = "miscbuilding"
		if (building instanceof Fort)
			building_name = "ancient"
		else if (building instanceof Tower)
			building_name = building.Name.includes("mid")
				? "tower45"
				: "tower90"
		else if (building instanceof Barrack)
			building_name = building.Name.includes("mid")
				? "racks45"
				: "racks90"
		else if (building instanceof Shop)
			switch (building.ShopType) {
				case DOTA_SHOP_TYPE.DOTA_SHOP_SECRET:
					building_name = "secretshop"
					break
				case DOTA_SHOP_TYPE.DOTA_SHOP_SIDE:
					building_name = "sideshop"
					break
				case DOTA_SHOP_TYPE.DOTA_SHOP_HOME:
					return
				default:
					building_name = "shop"
					break
			}
		else if (
			building instanceof HallOfFame
			|| building instanceof Fountain
			|| building instanceof NeutralItemStash
		)
			return
		DrawEntityIcon(
			building,
			building_name,
			120,
			building.IsNeutral
				? Color.White
				: building.IsEnemy()
					? Color.Red
					: Color.Green,
		)
	})
}

const camp_color = new Color(159, 105, 0)
function DrawMinimapCreepCampIcons(): void {
	EntityManager.GetEntitiesByClass(NeutralSpawner).forEach(spawner => {
		let spawner_name = "creepcamp"
		switch (spawner.Type) {
			case NeutralSpawnerType.Ancient:
				spawner_name = "creepcamp_ancient"
				break
			case NeutralSpawnerType.Large:
				spawner_name = "creepcamp_big"
				break
			case NeutralSpawnerType.Medium:
				spawner_name = "creepcamp_mid"
				break
			default:
				break
		}
		DrawEntityIcon(spawner, spawner_name, 175, camp_color)
	})
	EntityManager.GetEntitiesByClass(RoshanSpawner).forEach(spawner => DrawEntityIcon(
		spawner,
		"roshancamp",
		200,
		Color.Red,
	))
}

function DrawMinimapCreepIcons(): void {
	EntityManager.GetEntitiesByClass(Creep).forEach(creep => {
		if (!creep.IsAlive || !creep.IsVisible)
			return
		let creep_name = "creep"
		if (creep instanceof Siege)
			creep_name = "siege"
		DrawEntityIcon(
			creep,
			creep_name,
			110,
			creep.IsEnemy()
				? Color.Red
				: Color.Green,
		)
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
	if (!State.value)
		return
	DrawMinimapBackground()
	if (CreepCampIconsState.value)
		DrawMinimapCreepCampIcons()
	if (CreepIcons.value)
		DrawMinimapCreepIcons()
	if (RuneIcons.value)
		DrawMinimapRuneIcons()
	if (Couriers.value)
		DrawMinimapCouriers()
	if (HeroIcons.value)
		DrawMinimapHeroIcons()
	if (BuildingIcons.value)
		DrawMinimapBuildingIcons()
}
