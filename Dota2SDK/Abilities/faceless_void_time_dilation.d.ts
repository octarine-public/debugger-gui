// AUTO-GENERATED - do not edit.
/**
 * Time Dilation: a debuff on the enemies within `radius` - a stack for each of their abilities on
 * cooldown, slowing them and their cooldowns and burning them per stack - for `duration`, held
 * while they stand in a Chronosphere. Its magical type deals nothing at once: it is no nuke.
 */
declare class faceless_void_time_dilation extends Ability implements IDebuff {
	public readonly DebuffModifierName = "modifier_faceless_void_time_dilation_slow"
	public GetBaseAOERadiusForLevel(level: number): number
	/**
	 * The fields' damage: `damage_per_stack` a second for each stack - one as they land, one more
	 * for each ability of the unit on cooldown, only the first counted here - over each 1.1 s of
	 * `duration`, the first a tick after it lands; the target's status resistance shortens it. The
	 * 1.1 s is not in the data.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
	public IsDebuff(): this is IDebuff
}
