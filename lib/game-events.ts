// ============================================================
// Tipos compartidos Frontend ↔ Worker
// Mantener sincronizados con worker/src/types.ts
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
  buzzerEnabled: boolean
  buzzerWinner: 'team_one' | 'team_two' | null
}

// ============================================================
// Eventos Cliente → Servidor
// ============================================================
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
  | { type: 'ENABLE_BUZZER' }
  | { type: 'DISABLE_BUZZER' }
  | { type: 'BUZZ_IN'; payload: { team: NonNullable<ActiveTeam> } }

// ============================================================
// Eventos Servidor → Cliente
// ============================================================
export type ServerEvent =
  | { type: 'SYNC_STATE'; payload: GameRoomState }
  | { type: 'CLIENT_COUNT'; payload: { count: number } }
  | { type: 'ERROR'; payload: { message: string } }

// ============================================================
// Adaptadores: GameRoomState → tipos legados de los componentes UI
// Permite reusar componentes sin modificar su interfaz
// ============================================================
import type { Game, Round } from './types'

export function stateToGame(s: GameRoomState): Game {
  return {
    id: s.gameId,
    code: s.roomCode,
    status: s.gameStatus,
    current_round_id: s.currentQuestion?.id ?? null,
    team_one_name: s.teamOneName,
    team_two_name: s.teamTwoName,
    team_one_score: s.teamOneScore,
    team_two_score: s.teamTwoScore,
    active_team: s.activeTeam,
    strikes: s.strikes,
    sound_enabled: s.soundEnabled,
    winner: s.winner,
    round_number: s.roundNumber,
    created_at: '',
    updated_at: '',
  }
}

export function stateToRound(s: GameRoomState): Round | null {
  if (!s.currentQuestion || s.roundStatus === 'idle') return null
  return {
    id: 'current',
    game_id: s.gameId,
    question_id: s.currentQuestion.id,
    multiplier: s.multiplier,
    status: s.roundStatus as Round['status'],
    controlling_team: s.activeTeam,
    revealed_answer_ids: s.revealedAnswers,
    round_points: s.roundPoints,
    winner_team: null,
    created_at: '',
    updated_at: '',
    question: {
      ...s.currentQuestion,
      is_active: true,
      created_at: '',
      updated_at: '',
    },
  }
}

export function stateToFastMoney(s: GameRoomState) {
  if (!s.fastMoney) return null
  return {
    id: 'current',
    game_id: s.gameId,
    player_one_answers: s.fastMoney.playerOneAnswers,
    player_two_answers: s.fastMoney.playerTwoAnswers,
    total_score: s.fastMoney.totalScore,
    status: s.fastMoney.status,
    time_limit_one: s.fastMoney.timeLimitOne,
    time_limit_two: s.fastMoney.timeLimitTwo,
    created_at: '',
  }
}
