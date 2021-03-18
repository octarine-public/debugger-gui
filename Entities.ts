import { RootMenu } from "./menu"
import { Ability, ArrayExtensions, Color, Creep, DOTA_RUNES, Entity, EntityManager, EventsSDK, GUIInfo, Hero, LocalPlayer, ParticlesSDK, RendererSDK, Rune, Team, Tree, Unit, Vector2 } from "./wrapper/Imports"
import { PathX } from "./X-Core/Imports"

function GetEntityTeamColor(ent: Entity): Color {
	if (ent.IsNeutral)
		return Color.White
	if (ent.IsEnemy())
		return Color.Red
	return Color.Green
}

function RenderEntity(
	ent: Entity,
	size: Vector2,
	path: string,
): void {
	const screen_pos = RendererSDK.WorldToScreen(ent.Position)
	if (screen_pos === undefined)
		return
	screen_pos.SubtractForThis(size.DivideScalar(2))
	RendererSDK.FilledCircle(
		screen_pos.SubtractScalar(2),
		size.AddScalar(4),
		GetEntityTeamColor(ent),
	)
	RendererSDK.Image(path, screen_pos, 0, size)
}

const Trees = EntityManager.GetEntitiesByClass(Tree)
function DrawTrees(size: Vector2): void {
	const tree_size = size.DivideScalar(2)
	for (const tree of Trees) {
		if (!tree.IsAlive)
			continue
		const screen_pos = RendererSDK.WorldToScreen(tree.Position)
		if (screen_pos === undefined)
			continue
		screen_pos.SubtractForThis(tree_size.DivideScalar(2))
		RendererSDK.FilledCircle(
			screen_pos,
			tree_size,
			Color.Yellow,
		)
	}
}

const Creeps = EntityManager.GetEntitiesByClass(Creep)
function DrawCreeps(size: Vector2): void {
	for (const creep of Creeps) {
		if (!creep.IsVisible || !creep.IsAlive || !creep.IsSpawned)
			continue
		let path = PathX.Heroes(creep.Name, false)
		if (creep.IsLaneCreep)
			path = creep.Team === Team.Radiant
				? PathX.Heroes("npc_dota_hero_creep_radiant", false)
				: PathX.Heroes("npc_dota_hero_creep_dire", false)
		RenderEntity(creep, size, path)
	}
}

const Heroes = EntityManager.GetEntitiesByClass(Hero)
function DrawHeroes(size: Vector2): void {
	for (const hero of Heroes)
		if (hero.IsVisible && hero.IsAlive)
			RenderEntity(hero, size, PathX.Heroes(hero.Name))
}

const Runes = EntityManager.GetEntitiesByClass(Rune)
function DrawRunes(size: Vector2): void {
	for (const rune of Runes) {
		if (!rune.IsVisible)
			continue
		let rune_name: string
		switch (rune.Type) {
			case DOTA_RUNES.DOTA_RUNE_DOUBLEDAMAGE:
				rune_name = "doubledamage"
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
			case DOTA_RUNES.DOTA_RUNE_ARCANE:
				rune_name = "arcane"
				break
			case DOTA_RUNES.DOTA_RUNE_BOUNTY:
				rune_name = "bounty"
				break
			default:
				continue
		}
		RenderEntity(rune, size, PathX.Runes(rune_name))
	}
}

const otherEnts: Entity[] = []
function DrawOther(): void {
	for (const ent of otherEnts) {
		if (!ent.IsVisible || (ent instanceof Unit && !ent.IsSpawned))
			continue
		const screen_pos = RendererSDK.WorldToScreen(ent.Position)
		if (screen_pos === undefined)
			continue
		let text = ent.Name
		if (text.length === 0)
			text = ent.ClassName
		RendererSDK.Text(
			text,
			screen_pos,
			GetEntityTeamColor(ent),
		)
	}
}

EventsSDK.on("EntityCreated", ent => {
	if (
		ent instanceof Ability
		|| ent instanceof Rune
		|| ent instanceof Hero
		|| ent instanceof Creep
		|| ent instanceof Tree
	)
		return
	otherEnts.push(ent)
})
EventsSDK.on("EntityDestroyed", ent => ArrayExtensions.arrayRemove(otherEnts, ent))

const EntitiesNode = RootMenu.AddNode("Entities")
const TreesState = EntitiesNode.AddToggle("Trees", true),
	CreepsState = EntitiesNode.AddToggle("Creeps", true),
	RunesState = EntitiesNode.AddToggle("Runes", true),
	HeroesState = EntitiesNode.AddToggle("Heroes", true),
	Other = EntitiesNode.AddToggle("Other", true),
	Hitboxes = EntitiesNode.AddToggle("Hitboxes", false),
	Icons = EntitiesNode.AddToggle("Icons", true),
	particles = new ParticlesSDK()
function DrawHitboxes(): void {
	EntityManager.AllEntities.forEach(ent => {
		if (!ent.IsVisible)
			return
		if (ent instanceof Tree && (!TreesState.value || !ent.IsAlive))
			return
		else if (ent instanceof Creep && (!CreepsState.value || !ent.IsAlive || !ent.IsSpawned))
			return
		else if (ent instanceof Rune && !RunesState.value)
			return
		else if (ent instanceof Hero && (!HeroesState.value || !ent.IsAlive))
			return
		ent.BoundingBox.Polygon.Draw(
			"",
			LocalPlayer!.Hero!,
			particles,
			GetEntityTeamColor(ent),
			40,
			40,
			false,
		)
	})
}

export function DrawEntities(): void {
	const size = new Vector2(
		GUIInfo.ScaleWidth(64, RendererSDK.WindowSize),
		GUIInfo.ScaleHeight(64, RendererSDK.WindowSize),
	)
	if (Hitboxes.value)
		DrawHitboxes()
	if (!Icons.value)
		return
	if (TreesState.value)
		DrawTrees(size)
	if (CreepsState.value)
		DrawCreeps(size)
	if (RunesState.value)
		DrawRunes(size)
	if (HeroesState.value)
		DrawHeroes(size)
	if (Other.value)
		DrawOther()
}
