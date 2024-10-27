import {
	Ability,
	ArrayExtensions,
	Color,
	Creep,
	Entity,
	EntityManager,
	EventsSDK,
	GUIInfo,
	Hero,
	ImageData,
	Input,
	LocalPlayer,
	ParticlesSDK,
	Rectangle,
	RendererSDK,
	Rune,
	Tree,
	Unit,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { RootMenu } from "./menu"

function UnitPath(name: string): string {
	if (name.includes("npc_dota_hero_")) {
		return `panorama/images/heroes/${name}_png.vtex_c`
	}

	if (name.includes("_courier")) {
		return "github.com/octarine-private/immortal-core/scripts_files/images/couriers/radiant.png"
	}

	if (name.includes("badguys_tower") || name.includes("goodguys_tower")) {
		return "panorama/images/heroes/npc_dota_hero_tower_radiant_png.vtex_c"
	}

	if (name.includes("eidolon")) {
		return "panorama/images/heroes/npc_dota_eidolon_png.vtex_c"
	}

	if (name.includes("familiar")) {
		return "panorama/images/heroes/npc_dota_visage_familiar_png.vtex_c"
	}

	if (name.includes("shaman_ward")) {
		return "panorama/images/heroes/npc_dota_shadow_shaman_ward_png.vtex_c"
	}

	if (name.includes("golem")) {
		return "panorama/images/heroes/npc_dota_warlock_golem_png.vtex_c"
	}

	if (name.includes("creep_badguys")) {
		return "panorama/images/heroes/npc_dota_hero_creep_dire_png.vtex_c"
	}

	if (name.includes("creep_goodguys")) {
		return "panorama/images/heroes/npc_dota_hero_creep_radiant_png.vtex_c"
	}

	if (name.includes("druid_bear")) {
		return "panorama/images/heroes/npc_dota_lone_druid_bear_png.vtex_c"
	}

	if (name.includes("lycan_wolf")) {
		return "panorama/images/heroes/npc_dota_lycan_wolf_png.vtex_c"
	}

	if (name.includes("undying_zombie")) {
		return "panorama/images/heroes/npc_dota_unit_undying_zombie_png.vtex_c"
	}

	if (name.includes("necronomicon_archer")) {
		return "panorama/images/heroes/npc_dota_necronomicon_archer_png.vtex_c"
	}

	if (name.includes("necronomicon_warrior")) {
		return "panorama/images/heroes/npc_dota_necronomicon_warrior_png.vtex_c"
	}

	if (name.includes("roshan")) {
		return "panorama/images/spellicons/roshan_halloween_angry_png.vtex_c"
	}

	return `panorama/images/heroes/${name}_png.vtex_c`
}

function GetEntityTeamColor(ent: Entity): Color {
	if (ent.IsNeutral) {
		return Color.White
	}
	if (ent.IsEnemy()) {
		return Color.Red
	}
	return Color.Green
}

function RenderEntity(ent: Entity, size: Vector2, path: string): void {
	const screenPos = RendererSDK.WorldToScreen(ent.Position)
	if (screenPos === undefined) {
		return
	}
	screenPos.SubtractForThis(size.DivideScalar(2))
	RendererSDK.FilledCircle(
		screenPos.SubtractScalar(2),
		size.AddScalar(4),
		GetEntityTeamColor(ent)
	)
	RendererSDK.Image(path, screenPos, 0, size)
	const position = new Rectangle(screenPos, screenPos.Add(size))

	const isUnder = Input.CursorOnScreen.IsUnderRectangle(
		position.pos1.x,
		position.pos1.y,
		position.Width,
		position.Height
	)

	if (!isUnder) {
		return
	}

	const text = `
		IsAlive: ${ent.IsAlive}
		IsVisible: ${ent.IsVisible}
		Index: ${ent.Index}
		Handle: ${ent.Handle}
		Name: ${ent.Name}
		ClassName: ${ent.ClassName}
	`
	RendererSDK.TextByFlags(text, position, Color.White, 4)
}

const Trees = EntityManager.GetEntitiesByClass(Tree)
function DrawTrees(size: Vector2): void {
	const treeSize = size.DivideScalar(2)
	for (const tree of Trees) {
		if (!tree.IsAlive) {
			continue
		}
		const screenPos = RendererSDK.WorldToScreen(tree.Position)
		if (screenPos === undefined) {
			continue
		}
		screenPos.SubtractForThis(treeSize.DivideScalar(2))
		RendererSDK.FilledCircle(screenPos, treeSize, Color.Yellow)
	}
}

const Creeps = EntityManager.GetEntitiesByClass(Creep)
function DrawCreeps(size: Vector2): void {
	for (const creep of Creeps) {
		if (/*!creep.IsVisible || */ !creep.IsAlive /* || !creep.IsSpawned*/) {
			continue
		}
		RenderEntity(creep, size, UnitPath(creep.Name))
	}
}

const Heroes = EntityManager.GetEntitiesByClass(Hero)
function DrawHeroes(size: Vector2): void {
	for (const hero of Heroes) {
		if (hero.IsVisible && hero.IsAlive) {
			RenderEntity(hero, size, UnitPath(hero.Name))
		}
	}
}

const Runes = EntityManager.GetEntitiesByClass(Rune)
function DrawRunes(size: Vector2): void {
	for (const rune of Runes) {
		if (rune.IsVisible) {
			RenderEntity(rune, size, ImageData.GetRuneTexture(rune.Name))
		}
	}
}

const otherEnts: Entity[] = []
function DrawOther(): void {
	for (const ent of otherEnts) {
		if (!ent.IsVisible || (ent instanceof Unit && !ent.IsSpawned)) {
			continue
		}
		const screenPos = RendererSDK.WorldToScreen(ent.Position)
		if (screenPos === undefined) {
			continue
		}
		let text = ent.Name
		if (text.length === 0) {
			text = ent.ClassName
		}
		RendererSDK.Text(text, screenPos, GetEntityTeamColor(ent))
	}
}

EventsSDK.on("EntityCreated", ent => {
	if (
		ent instanceof Ability ||
		ent instanceof Rune ||
		ent instanceof Hero ||
		ent instanceof Creep ||
		ent instanceof Tree
	) {
		return
	}
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
		if (!ent.IsVisible) {
			return
		}
		if (ent instanceof Tree && (!TreesState.value || !ent.IsAlive)) {
			return
		} else if (
			ent instanceof Creep &&
			(!CreepsState.value || !ent.IsAlive || !ent.IsSpawned)
		) {
			return
		} else if (ent instanceof Rune && !RunesState.value) {
			return
		} else if (ent instanceof Hero && (!HeroesState.value || !ent.IsAlive)) {
			return
		}
		ent.BoundingBox.Polygon.Draw(
			"",
			LocalPlayer!.Hero!,
			particles,
			GetEntityTeamColor(ent),
			40,
			40,
			false
		)
	})
}

export function DrawEntities(): void {
	const size = new Vector2(
		GUIInfo.ScaleWidth(64, RendererSDK.WindowSize),
		GUIInfo.ScaleHeight(64, RendererSDK.WindowSize)
	)
	if (Hitboxes.value) {
		DrawHitboxes()
	}
	if (!Icons.value) {
		return
	}
	if (TreesState.value) {
		DrawTrees(size)
	}
	if (CreepsState.value) {
		DrawCreeps(size)
	}
	if (RunesState.value) {
		DrawRunes(size)
	}
	if (HeroesState.value) {
		DrawHeroes(size)
	}
	if (Other.value) {
		DrawOther()
	}
}
