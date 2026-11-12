import { canvas } from "./canvas"
import { GuiIcons, WithIcon } from "./icons"
import { AddSection } from "./menu"

const [AttachmentsNode, State] = AddSection("Attachments", GuiIcons.Attachments)
const GameTimeState = WithIcon(
		AttachmentsNode.AddToggle("Use game time", false),
		GuiIcons.GameTime
	),
	Offset = WithIcon(
		AttachmentsNode.AddSlider("Frame offset", 0, -30, 30),
		GuiIcons.FrameOffset
	),
	useNetworkActivity = WithIcon(
		AttachmentsNode.AddToggle("Use network activity", false),
		GuiIcons.NetworkActivity
	)

function RenderAttachment(
	ent: Entity,
	activity: GameActivity,
	sequence: number,
	fps: number,
	name: string,
	color: Color
): void {
	const time = GameTimeState.value
		? ent.AnimationTime
		: ent instanceof Unit
			? ent.LastAnimationCastPoint // ?
			: ent.AnimationTime

	const position = ent.Position
	const screenPos = RendererSDK.WorldToScreen(
		ent.GetAttachmentPosition(
			name,
			activity,
			sequence,
			time + Offset.value / fps,
			new Vector3(position.x, position.y, position.z + ent.DeltaZ),
			ent.Angles,
			ent.ModelScale
		)
	)

	if (screenPos === undefined) {
		return
	}

	if (InputManager.CursorOnScreen.Distance(screenPos) < 16) {
		canvas.Text(name, screenPos, { color })
	}

	canvas.Rect(screenPos.SubtractScalar(4), new Vector2(8, 8), { color })
}

export function DrawAttachments(): void {
	if (!State.value) {
		return
	}
	EntityManager.AllEntities.forEach(ent => {
		if (!ent.IsVisible || ent.ModelData === undefined) {
			return
		}
		const activity =
			ent instanceof Unit
				? useNetworkActivity.value
					? ent.NetworkActivity
					: ent.LastActivity
				: GameActivity.ACT_DOTA_IDLE
		const sequence =
			ent instanceof Unit
				? useNetworkActivity.value
					? ent.NetworkSequenceIndex
					: ent.LastActivitySequenceVariant /** ?? */
				: 0
		const animationID = ent.GetAnimationID(activity, sequence) ?? -1
		const fps = animationID !== -1 ? ent.Animations[animationID].fps : 1
		ent.Attachments.forEach(attachment => {
			let color: Color
			switch (attachment) {
				case "attach_hitloc":
					color = Color.Aqua
					break
				case "attach_attack1":
					color = Color.Red
					break
				default:
					color = Color.White
					break
			}
			RenderAttachment(ent, activity, sequence, fps, attachment, color)
		})
	})
}
