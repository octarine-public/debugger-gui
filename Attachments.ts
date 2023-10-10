import {
	Color,
	Entity,
	EntityManager,
	GameActivity,
	Input,
	RendererSDK,
	Unit,
	Vector2,
	Vector3
} from "github.com/octarine-public/wrapper/index"

import { RootMenu } from "./menu"

const AttachmentsNode = RootMenu.AddNode("Attachments")
const State = AttachmentsNode.AddToggle("State", true),
	GameTimeState = AttachmentsNode.AddToggle("Use game time", false),
	Offset = AttachmentsNode.AddSlider("Frame offset", 0, -30, 30)

function RenderAttachment(ent: Entity, animationID: number, attachmentID: number, color: Color, name: string): void {
	const time = GameTimeState.value
		? ent.AnimationTime
		: ent instanceof Unit
		? ent.LastActivityAnimationPoint // ?
		: ent.AnimationTime

	const fps = animationID !== -1 ? ent.Animations[animationID].fps : 1
	ent.Position.toIOBuffer()
	IOBuffer[2] += ent.DeltaZ
	ent.Angles.toIOBuffer(3)
	ent.ModelData!.getAttachmentData(animationID, attachmentID, time + Offset.value / fps, ent.ModelScale)
	const screenPos = RendererSDK.WorldToScreen(Vector3.fromIOBuffer())

	if (screenPos === undefined) {
		return
	}

	if (Input.CursorOnScreen.Distance(screenPos) < 16) {
		RendererSDK.Text(name, screenPos, color)
	}

	RendererSDK.FilledRect(screenPos.SubtractScalar(4), new Vector2(8, 8), color)
}

export function DrawAttachments(): void {
	if (!State.value) {
		return
	}
	EntityManager.AllEntities.forEach(ent => {
		if (!ent.IsVisible || ent.ModelData === undefined) {
			return
		}
		const animationID = ent.GetAnimationID(
			ent instanceof Unit ? ent.LastActivity : GameActivity.ACT_DOTA_IDLE,
			ent instanceof Unit ? ent.LastActivitySequenceVariant /** ?? */ : 0
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
