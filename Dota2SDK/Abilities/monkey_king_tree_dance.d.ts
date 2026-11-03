// AUTO-GENERATED - do not edit.
declare class monkey_king_tree_dance extends Ability {
	public readonly StartPosition: Vector3
	public TargetTree: Nullable<Tree | TempTree>
	/** Per candidate tree: the predicted leap position, the tree, and the game time the leap lands (0 while airborne). */
	public PredictedPositionsPerTree: [Vector3, Tree | TempTree, number][]
	public StartedJumpingTime: number
	public EndedJumpingTime: number
	public IsJumping: boolean
	public IsJumpingToTree: boolean
	public get SpringSpeed(): number
	public GetBaseCastRangeForLevel(level: number): number
	public GetBaseSpeedForLevel(level: number): number
	/**
	 * The living tree within the leap's cast range of Monkey King nearest `position`, no farther
	 * than `reach` from it - the perch a Primal Spring at `position` goes from, `reach` the
	 * spring's range; none without one. Map trees and temporary ones - a Sprout's - alike.
	 * @example
	 * const perch = dance.TreeNear(enemy.Position, spring.CastRange)
	 */
	public TreeNear(position: Vector3, reach: number): Nullable<Tree | TempTree>
}
