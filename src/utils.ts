import * as constants from './constants'
import { Ticker, Direction, Paddle, Ball, Brick, Objects, Position } from '.'
  
export const movePaddle = (canvas: HTMLCanvasElement, position: Paddle, ticker: Ticker, direction: Direction) => {
  const next = position + direction * ticker.delta * constants.PADDLE_SPEED
  return Math.max(
    Math.min(next, canvas.width - constants.PADDLE_WIDTH / 2),
    constants.PADDLE_WIDTH / 2
  )
}

const range = (count: number) => Array(count).fill(0).map((_, i) => i)

export const bricksFactory = (canvas: HTMLCanvasElement) => {
  const totalWidth = canvas.width - constants.BRICK_GAP - constants.BRICK_GAP * constants.BRICK_COLUMNS
  const width = totalWidth / constants.BRICK_COLUMNS
  const bricks = range(constants.BRICK_ROWS).map((_, i) =>
    range(constants.BRICK_COLUMNS).map((_, j) => ({
      x: j * (width + constants.BRICK_GAP) + width / 2 + constants.BRICK_GAP,
      y: i * (constants.BRICK_HEIGHT + constants.BRICK_GAP) + constants.BRICK_HEIGHT / 2 + constants.BRICK_GAP + 20,
      width: width,
      height: constants.BRICK_HEIGHT
    } as Brick))
  ).flat()

  return bricks
}

const collision = (brick: Brick, ball: Ball) => {
  return (
    ball.position.x + ball.direction.x > brick.x - brick.width / 2 &&
    ball.position.x + ball.direction.x < brick.x + brick.width / 2 &&
    ball.position.y + ball.direction.y > brick.y - brick.height / 2 &&
    ball.position.y + ball.direction.y < brick.y + brick.height / 2
  )
}

const hit = (canvas: HTMLCanvasElement, paddle: Paddle, ball: Position) => {
  return (
    ball.x > paddle - constants.PADDLE_WIDTH / 2 &&
    ball.x < paddle + constants.PADDLE_WIDTH / 2 &&
    ball.y > canvas.height - constants.PADDLE_HEIGHT - constants.BALL_RADIUS / 2
  )
}

export const calculateObjects = (
  canvas: HTMLCanvasElement,
  objects: Objects,
  ticker: Ticker,
  paddle: Paddle
) => {
  const ballPositionX = objects.ball.position.x + objects.ball.direction.x * ticker.delta * constants.BALL_SPEED
  const ballPositionY = objects.ball.position.y + objects.ball.direction.y * ticker.delta * constants.BALL_SPEED
  const ballPosition = { x: ballPositionX, y: ballPositionY }

  const hits = objects.bricks.map(brick => [brick, collision(brick, objects.ball)])
  const survivors = hits.filter(([, hit]) => !hit).map(([brick]) => brick)

  const collisions = {
    paddle: hit(canvas, paddle, ballPosition),
    brick: hits.some(([, hit]) => hit),
    ceiling: ballPosition.y < constants.BALL_RADIUS,
    wall: ballPosition.x < constants.BALL_RADIUS ||
      ballPosition.x > canvas.width - constants.BALL_RADIUS
  }

  const bounceX = collisions.wall
  const bounceY = collisions.brick || collisions.paddle || collisions.ceiling

  const ballDirection = {
    x: objects.ball.direction.x * (bounceX ? -1 : 1),
    y: objects.ball.direction.y * (bounceY ? -1 : 1)
  }

  return {
    collisions,
    bricks: survivors,
    ball: {
      position: ballPosition,
      direction: ballDirection
    }
  } as Objects
}
