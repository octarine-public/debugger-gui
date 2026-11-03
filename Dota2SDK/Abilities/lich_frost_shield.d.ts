// AUTO-GENERATED - do not edit.
declare class lich_frost_shield extends Ability {
	public GetBaseAOERadiusForLevel(level: number): number
	/**
	 * The shield's ice strikes the enemies within `radius` of the unit it is on while it lasts
	 * (`duration`): `damage` each `interval`, the first as it is laid, none as it ends; none after
	 * a unit walks out.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
}
