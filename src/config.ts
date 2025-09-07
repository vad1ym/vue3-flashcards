import { StackDirection } from './utils/useStackTransform'

export const config = {
  // Flash card
  defaultVirtualBuffer: 3,
  defaultThreshold: 150,
  defaultDragThreshold: 15,
  defaultMaxRotation: 20,
  defaultStack: 0,
  defaultStackOffset: 20,
  defaultStackScale: 0.05,
  defaultStackDirection: StackDirection.BOTTOM,
  defaultTransitionName: 'card-transition',

  // Flip card
  defaultFlipWaitAnimationEnd: true,
}
