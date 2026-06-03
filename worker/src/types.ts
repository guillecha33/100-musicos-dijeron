// ============================================================
// Env — bindings del Worker
// ============================================================
export interface Env {
  GAME_ROOM: DurableObjectNamespace
  DB: D1Database
  GAME_CODES: KVNamespace
}

// ============================================================
// Tipos compartidos Worker ↔ Frontend
// Mantener sincronizados con lib/game-events.ts
// ============================================================

export type ActiveTeam = 'team_one' | 'team_two' | null
export type RoundMultiplier = 1 | 2 | 3
export type RoundStatus = 'idle' | 'face_off' | 'playing' | 'steal' | 'finished'
export type GameStatus = 'lobby' | 'playing' | 'fast_money' | 'finished'
export type FastMoneyStatus = 'playing_one' | 'playing_two' | 'finished'

export interface Answer {
  id: string
  text: string
  points: number
  position: number
}

export interface Question {
  id: string
  text: string
  category: string
  is_active: boolean
  answers: Answer[]
}

export interface FastMoneyAnswer {
  answer_text: string
  points: number
}

export interface FastMoneyState {
  playerOneAnswers: FastMoneyAnswer[]
  playerTwoAnswers: FastMoneyAnswer[]
  totalScore: number
  status: FastMoneyStatus
  timeLimitOne: number
  timeLimitTwo: number
}

export interface GameRoomState {
  gameId: string
  roomCode: string
  teamOneName: string
  teamTwoName: string
  teamOneScore: number
  teamTwoScore: number
  activeTeam: ActiveTeam
  currentQuestion: Question | null
  revealedAnswers: string[]
  strikes: number
  roundPoints: number
  multiplier: RoundMultiplier
  roundStatus: RoundStatus
  gameStatus: GameStatus
  fastMoney: FastMoneyState | null
  soundEnabled: boolean
  connectedClients: number
  roundNumber: number
  winner: 'team_one' | 'team_two' | 'tie' | null
}

// ── Eventos Cliente → Servidor ────────────────────────────────
export type ClientEvent =
  | { type: 'JOIN_GAME'; payload?: { role?: string } }
  | { type: 'INIT_GAME'; payload: { gameId: string; roomCode: string } }
  | { type: 'START_ROUND'; payload: { question: Question; multiplier: RoundMultiplier } }
  | { type: 'REVEAL_ANSWER'; payload: { answerId: string } }
  | { type: 'ADD_STRIKE' }
  | { type: 'REMOVE_STRIKE' }
  | { type: 'SET_ACTIVE_TEAM'; payload: { team: NonNullable<ActiveTeam> } }
  | { type: 'START_STEAL' }
  | { type: 'AWARD_ROUND_POINTS'; payload: { team: NonNullable<ActiveTeam> } }
  | { type: 'NEXT_ROUND' }
  | { type: 'SET_MULTIPLIER'; payload: { multiplier: RoundMultiplier } }
  | { type: 'RENAME_TEAM'; payload: { team: NonNullable<ActiveTeam>; name: string } }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'START_FAST_MONEY'; payload?: { timeLimitOne?: number; timeLimitTwo?: number } }
  | { type: 'UPDATE_FAST_MONEY_SCORE'; payload: { player: 1 | 2; answers: FastMoneyAnswer[] } }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' }

// ── Eventos Servidor → Cliente ────────────────────────────────
export type ServerEvent =
  | { type: 'SYNC_STATE'; payload: GameRoomState }
  | { type: 'CLIENT_COUNT'; payload: { count: number } }
  | { type: 'ERROR'; payload: { message: string } }
