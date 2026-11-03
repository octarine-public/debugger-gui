// AUTO-GENERATED - do not edit.
declare class item_witch_blade extends Item {
	/**
	 * The poison its empowered attack lays: `int_damage_multiplier` times its owner's intelligence
	 * a second, magical, for `slow_duration`, the first a second after the hit, the last as it
	 * ends - Parasma's the same. The second is not in the data.
	 */
	public static PoisonOverTime(item: Item, out: DamageTicks, level: number): boolean
	/** The poison of its empowered attack (`PoisonOverTime`). */
	public DamageOverTime(out: DamageTicks, level: number): boolean
}
