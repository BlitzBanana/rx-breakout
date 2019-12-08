import * as constants from './constants'
import { Ball, Brick } from 'src'

export const drawTitle = (context: CanvasRenderingContext2D) => {
  context.textAlign = 'center'
  context.font = 'bold 60px Courier New'
  context.fillText('RxJS Breakout', context.canvas.width / 2, context.canvas.height / 2 - 60)
}

export const drawControls = (context: CanvasRenderingContext2D) => {
  context.textAlign = 'center'
  context.font = 'bold 40px Courier New'
  context.fillText(
    'Press any button to start a game',
    context.canvas.width / 2,
    context.canvas.height / 2
  )
}

export const drawGameOver = (context: CanvasRenderingContext2D, text: string) => {
  context.clearRect(
    context.canvas.width / 4,
    context.canvas.height / 3,
    context.canvas.width / 2,
    context.canvas.height / 3
  )
  context.textAlign = 'center'
  context.font = 'bold 28px Arial'
  context.fillText(text, context.canvas.width / 2, context.canvas.height / 2)
}

export const drawPaddle = (context: CanvasRenderingContext2D, position: number) => {
  context.beginPath()
  context.rect(
    position - constants.PADDLE_WIDTH / 2,
    context.canvas.height - constants.PADDLE_HEIGHT,
    constants.PADDLE_WIDTH,
    constants.PADDLE_HEIGHT
  )
  context.fill()
  context.closePath()
}

export const drawBall = (context: CanvasRenderingContext2D, ball: Ball) => {
  context.beginPath()
  context.arc(ball.position.x, ball.position.y, constants.BALL_RADIUS, 0, Math.PI * 2)
  context.fill()
  context.closePath()
}

const drawBrick = (context: CanvasRenderingContext2D, brick: Brick) => {
  context.beginPath()
  context.rect(
    brick.x - brick.width / 2,
    brick.y - brick.height / 2,
    brick.width,
    brick.height
  )
  context.fill()
  context.closePath()
}

export const drawBricks = (context: CanvasRenderingContext2D, [brick, ...rest]: Brick[]) => {
  drawBrick(context, brick)
  if (rest.length > 0) {
    drawBricks(context, rest)
  }
}
  