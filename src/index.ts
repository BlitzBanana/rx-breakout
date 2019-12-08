import './canvas.styl'
import * as rx from 'rxjs'
import * as op from 'rxjs/operators'
import * as constants from './constants'
import * as render from './render'
import * as utils from './utils'

export interface Ticker {
  time: number
  delta: number
}

export interface Position {
  x: number
  y: number
}

export interface Ball {
  position: Position
  direction: Position
}

export interface Brick extends Position {
  width: number
  height: number
}

export type Paddle = number
export type Direction = number
export type Objects = {
  ball: Ball
  bricks: Brick[]
  collisions: {
    paddle: boolean
    wall: boolean
    ceiling: boolean
    brick: boolean
  }
}

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
context.fillStyle = constants.FILL_COLOR

const INITIAL_OBJECTS = {
  ball: {
    position: {
      x: canvas.width / 2,
      y: canvas.height / 2
    },
    direction: {
      x: 2,
      y: 8
    }
  },
  bricks: utils.bricksFactory(canvas)
} as Objects

const ticker$ = rx.interval(1000 / 60, rx.animationFrameScheduler)
  .pipe(
    op.map(() => ({
      time: Date.now(),
      delta: 0
    } as Ticker)),
    op.scan((previous, current) => ({
      time: current.time,
      delta: (current.time - previous.time) / 1000
    } as Ticker))
  )

const input$ = rx.merge<Direction, Direction>(
  rx.fromEvent<Direction>(document, 'keyup', () => 0),
  rx.fromEvent<Direction>(document, 'keydown', event => {
    switch (event.keyCode) {
      case constants.PADDLE_KEYS.LEFT: return -1
      case constants.PADDLE_KEYS.RIGHT: return 1
      default: return 0
    }
  })
)

const paddle$ = ticker$.pipe(
  op.withLatestFrom(input$),
  op.scan<[Ticker, Direction], Paddle>(
    (paddle, [ticker, direction]) => utils.movePaddle(canvas, paddle, ticker, direction) as Paddle,
    canvas.width / 2
  )
)

const objects$ = ticker$.pipe(
  op.withLatestFrom(paddle$),
  op.scan<[Ticker, Direction], Objects>(
    (objects, [ticker, paddle]) => utils.calculateObjects(canvas, objects, ticker, paddle),
    INITIAL_OBJECTS
  )
)

render.drawTitle(context)
render.drawControls(context)

const game = rx.combineLatest(ticker$, paddle$, objects$).subscribe(([, paddle, objects]: [Ticker, Paddle, Objects]) => {
  context.clearRect(0, 0, canvas.width, canvas.height)

  render.drawPaddle(context, paddle)
  render.drawBall(context, objects.ball)
  render.drawBricks(context, objects.bricks)

  if (objects.ball.position.y > canvas.height - constants.BALL_RADIUS) {
    render.drawGameOver(context, 'GAME OVER')
    game.unsubscribe()
  }

  if (!objects.bricks.length) {
    render.drawGameOver(context, 'CONGRATULATIONS')
    game.unsubscribe()
  }
})
