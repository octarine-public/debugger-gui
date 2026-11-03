// AUTO-GENERATED - do not edit.
declare class viper_nose_dive extends Ability {
	public get StartHeight(): number
	public GetBaseAOERadiusForLevel(level: number): number
	public GetBaseSpeedForLevel(level: number): number
	/**
	 * Viper dives to the point it was cast at and corrodes around it where she lands: a circle, not
	 * a line. Read as a line, the dive ended a radius (500) and the target's hull short of the
	 * point - the landing expected 0.75 s before it comes (20 October 2026, demo: from some 650 she
	 * landed 0.90 s after the cast, 0.93 s the whole way).
	 */
	public get SkillShotType(): ESkillShotType
}
