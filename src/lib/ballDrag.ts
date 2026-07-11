// Shared flag between KickableSoccerBall and CameraController.
// While a drag that started on the soccer ball is in progress, the camera's
// touch swipe-to-look must not consume the same gesture. A module-level
// mutable object (not React state) keeps this read synchronously inside
// native event handlers with zero re-renders.
export const ballDrag = { active: false }
