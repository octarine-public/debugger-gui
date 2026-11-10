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
	animationID: number,
	attachmentID: number,
	color: Color,
	name: string
): void {
	const time = GameTimeState.value
		? ent.AnimationTime
		: ent instanceof Unit
			? ent.LastAnimationCastPoint // ?
			: ent.AnimationTime

	const fps = animationID !== -1 ? ent.Animations[animationID].fps : 1
	ent.Position.toIOBuffer()
	IOBuffer[2] += ent.DeltaZ
	ent.Angles.toIOBuffer(3)
	ent.ModelData!.getAttachmentData(
		animationID,
		attachmentID,
		time + Offset.value / fps,
		ent.ModelScale
	)
	const screenPos = RendererSDK.WorldToScreen(Vector3.fromIOBuffer())

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
		const animationID =
			ent.GetAnimationID(
				ent instanceof Unit
					? useNetworkActivity.value
						? ent.NetworkActivity
						: ent.LastActivity
					: GameActivity.ACT_DOTA_IDLE,
				ent instanceof Unit
					? useNetworkActivity.value
						? ent.NetworkSequenceIndex
						: ent.LastActivitySequenceVariant /** ?? */
					: 0
			) ?? -1
		ent.Attachments.forEach((attachment, i) => {
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
			RenderAttachment(ent, animationID, i, color, attachment)
		})
	})
}
