// AUTO-GENERATED - do not edit.
declare class riki_blink_strike extends Ability implements INuke {
	/** Riki blinks to the unit cast at (`MovesOnto`). */
	public get MovesCaster(): boolean
	/** Where a strike at the unit at `toward` sets its owner down: by that unit. */
	public MotionOn(target: Unit, from: Vector3, toward: Vector3, landsAt: number): Nullable<Motion>
	public IsNuke(): this is INuke
	public GetBaseDamageForLevel(level: number): number
	public GetDamage(target: Unit): number
}
