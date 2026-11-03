// AUTO-GENERATED - do not edit.
declare class lone_druid_entangle extends Ability {
	public GetBaseAOERadiusForLevel(level: number): number
	/**
	 * The root of a unit whose stacks reach `hits_required`: `damage` a second over each 0.2 s of
	 * `entangle_duration`, the first as it roots, none as it ends. A cast roots one whose stacks
	 * its `hits_incremented_on_active` bring there (`TickChance`). The 0.2 s is not in the data.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
	/** Whether a cast roots `target`: its stacks and the cast's reach `hits_required`. */
	public TickChance(target: Unit, _tick: number): number
}
