// AUTO-GENERATED - do not edit.
declare class leshrac_diabolic_edict extends Ability {
	public GetBaseAOERadiusForLevel(level: number): number
	/**
	 * The explosions around Leshrac: `num_explosions` of them, 0.2 s apart, the first as it is
	 * cast, `damage` each at a unit it picks (`TickChance`); none after a unit walks out of
	 * `radius`. The 0.2 s is not in the data.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
	/**
	 * Chance an explosion strikes `target` where it stands: each picks one of the enemy heroes,
	 * creeps and buildings within `radius` of Leshrac and their hull at random - surely the one
	 * alone there.
	 */
	public TickChance(target: Unit, _tick: number): number
}
