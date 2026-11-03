// AUTO-GENERATED - do not edit.
declare class item_radiance extends Item {
	public get TexturePath(): string
	public GetBaseAOERadiusForLevel(level: number): number
	/**
	 * The burn of its aura, on while it is: `aura_damage` a second, magical - an illusion's
	 * `aura_damage_illusions` - each second the unit stays within `aura_radius`, the first a second
	 * after it comes in, and half a second after it walks out, as the debuff lingers. The second
	 * and the half are not in the data.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
}
