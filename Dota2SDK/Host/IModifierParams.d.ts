// AUTO-GENERATED - do not edit.
declare interface IModifierParams {
	readonly Damage?: number
	readonly IgnoreMagicResist?: boolean
	readonly SourceIndex?: number
	readonly RawDamage?: number
	readonly RawDamageBase?: number
	/**
	 * Whether the hit breaks the unit before it lands - an attack ending Silver Edge's Shadow
	 * Walk: a passive the Break turns off does not take it.
	 */
	readonly Breaks?: boolean
	/** Whether the damage is an attack's: the attacker faces its target as the attack lands. */
	readonly IsAttack?: boolean
}
