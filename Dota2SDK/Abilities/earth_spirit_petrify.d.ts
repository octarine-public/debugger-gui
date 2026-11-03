// AUTO-GENERATED - do not edit.
declare class earth_spirit_petrify extends Ability {
	/** The shatter's damage, at the enemies within `aoe` of the unit it is cast on. */
	public GetBaseDamageForLevel(level: number): number
	/** None at the unit it is cast on: it becomes the remnant, its shatter striking those around. */
	public GetDamage(_target: Unit): number
	public get CastRange(): number
	protected DurationFrom(values: ISpecialValues, level: number): number
	public get AppliesUnitState(): bigint
}
