export type GameStatus = 'lobby' | 'playing' | 'fast_money' | 'finished'
export type RoundStatus = 'face_off' | 'playing' | 'steal' | 'finished'
export type ActiveTeam = 'team_one' | 'team_two' | null
export type RoundMultiplier = 1 | 2 | 3

export interface Game {
  id: string
  code: string
  status: GameStatus
  current_round_id: string | null
  team_one_name: string
  team_two_name: string
  team_one_score: number
  team_two_score: number
  active_team: ActiveTeam
  strikes: number
  sound_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  text: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
  answers?: Answer[]
}

export interface Answer {
  id: string
  question_id: string
  text: string
  points: number
  position: number
  created_at: string
}

export interface Round {
  id: string
  game_id: string
  question_id: string
  multiplier: RoundMultiplier
  status: RoundStatus
  controlling_team: ActiveTeam
  revealed_answer_ids: string[]
  round_points: number
  winner_team: ActiveTeam
  created_at: string
  updated_at: string
  question?: Question & { answers: Answer[] }
}

export interface FastMoneyAnswer {
  answer_text: string
  points: number
}

export interface FastMoneySession {
  id: string
  game_id: string
  player_one_answers: FastMoneyAnswer[]
  player_two_answers: FastMoneyAnswer[]
  total_score: number
  status: 'playing_one' | 'playing_two' | 'finished'
  time_limit_one: number
  time_limit_two: number
  created_at: string
}

export interface GameState {
  game: Game
  currentRound: Round | null
  fastMoney: FastMoneySession | null
}

export type GameAction =
  | { type: 'start_round'; questionId: string; multiplier: RoundMultiplier }
  | { type: 'reveal_answer'; answerId: string }
  | { type: 'add_strike' }
  | { type: 'remove_strike' }
  | { type: 'give_control'; team: NonNullable<ActiveTeam> }
  | { type: 'activate_steal' }
  | { type: 'award_points'; team: NonNullable<ActiveTeam> }
  | { type: 'next_round' }
  | { type: 'rename_team'; team: NonNullable<ActiveTeam>; name: string }
  | { type: 'toggle_sound' }
  | { type: 'start_fast_money' }
  | { type: 'reset_game' }
  | { type: 'set_multiplier'; multiplier: RoundMultiplier }

export interface QuestionFormData {
  text: string
  category: string
  is_active: boolean
  answers: { text: string; points: number; position: number }[]
}
