import type {
  GameRoomState,
  ClientEvent,
  ActiveTeam,
  FastMoneyState,
  FastMoneyAnswer,
} from './types'

export function createInitialState(gameId = '', roomCode = ''): GameRoomState {
  return {
    gameId,
    roomCode,
    teamOneName: 'Equipo 1',
    teamTwoName: 'Equipo 2',
    teamOneScore: 0,
    teamTwoScore: 0,
    activeTeam: null,
    currentQuestion: null,
    revealedAnswers: [],
    strikes: 0,
    roundPoints: 0,
    multiplier: 1,
    roundStatus: 'idle',
    gameStatus: 'lobby',
    fastMoney: null,
    soundEnabled: true,
    connectedClients: 0,
    roundNumber: 0,
  }
}

export function applyEvent(state: GameRoomState, event: ClientEvent): GameRoomState {
  switch (event.type) {

    case 'JOIN_GAME':
    case 'INIT_GAME': {
      if (event.type === 'INIT_GAME') {
        return {
          ...state,
          gameId: event.payload.gameId,
          roomCode: event.payload.roomCode,
        }
      }
      return state
    }

    case 'START_ROUND': {
      return {
        ...state,
        gameStatus: 'playing',
        roundStatus: 'face_off',
        currentQuestion: event.payload.question,
        multiplier: event.payload.multiplier,
        revealedAnswers: [],
        strikes: 0,
        roundPoints: 0,
        activeTeam: null,
        roundNumber: state.roundNumber + 1,
      }
    }

    case 'REVEAL_ANSWER': {
      const { answerId } = event.payload
      if (state.revealedAnswers.includes(answerId)) return state

      const answer = state.currentQuestion?.answers.find((a) => a.id === answerId)
      const points = answer?.points ?? 0

      return {
        ...state,
        revealedAnswers: [...state.revealedAnswers, answerId],
        roundPoints: state.roundPoints + points,
        roundStatus: state.roundStatus === 'face_off' ? 'playing' : state.roundStatus,
      }
    }

    case 'ADD_STRIKE': {
      const newStrikes = Math.min(3, state.strikes + 1)
      const autoSteal = newStrikes >= 3 && state.roundStatus === 'playing'
      const stealTeam: ActiveTeam =
        state.activeTeam === 'team_one' ? 'team_two' : 'team_one'

      return {
        ...state,
        strikes: newStrikes,
        roundStatus: autoSteal ? 'steal' : state.roundStatus,
        activeTeam: autoSteal ? stealTeam : state.activeTeam,
      }
    }

    case 'REMOVE_STRIKE': {
      const newStrikes = Math.max(0, state.strikes - 1)
      return {
        ...state,
        strikes: newStrikes,
        roundStatus:
          state.roundStatus === 'steal' && newStrikes < 3
            ? 'playing'
            : state.roundStatus,
      }
    }

    case 'SET_ACTIVE_TEAM': {
      return {
        ...state,
        activeTeam: event.payload.team,
        roundStatus: state.roundStatus === 'face_off' ? 'playing' : state.roundStatus,
      }
    }

    case 'START_STEAL': {
      const stealTeam: ActiveTeam =
        state.activeTeam === 'team_one' ? 'team_two' : 'team_one'
      return {
        ...state,
        activeTeam: stealTeam,
        roundStatus: 'steal',
      }
    }

    case 'AWARD_ROUND_POINTS': {
      const { team } = event.payload
      const pointsToAward = state.roundPoints * state.multiplier
      const isTeamOne = team === 'team_one'
      const newScore =
        (isTeamOne ? state.teamOneScore : state.teamTwoScore) + pointsToAward

      const teamOneScore = isTeamOne ? newScore : state.teamOneScore
      const teamTwoScore = isTeamOne ? state.teamTwoScore : newScore
      const gameOver = teamOneScore >= 300 || teamTwoScore >= 300

      return {
        ...state,
        teamOneScore,
        teamTwoScore,
        strikes: 0,
        activeTeam: null,
        roundStatus: 'finished',
        gameStatus: gameOver ? 'finished' : state.gameStatus,
      }
    }

    case 'NEXT_ROUND': {
      return {
        ...state,
        roundStatus: 'idle',
        currentQuestion: null,
        revealedAnswers: [],
        strikes: 0,
        roundPoints: 0,
        activeTeam: null,
      }
    }

    case 'SET_MULTIPLIER': {
      return { ...state, multiplier: event.payload.multiplier }
    }

    case 'RENAME_TEAM': {
      const field =
        event.payload.team === 'team_one' ? 'teamOneName' : 'teamTwoName'
      return { ...state, [field]: event.payload.name }
    }

    case 'TOGGLE_SOUND': {
      return { ...state, soundEnabled: !state.soundEnabled }
    }

    case 'START_FAST_MONEY': {
      const fm: FastMoneyState = {
        playerOneAnswers: [],
        playerTwoAnswers: [],
        totalScore: 0,
        status: 'playing_one',
        timeLimitOne: event.payload?.timeLimitOne ?? 20,
        timeLimitTwo: event.payload?.timeLimitTwo ?? 25,
      }
      return { ...state, gameStatus: 'fast_money', fastMoney: fm }
    }

    case 'UPDATE_FAST_MONEY_SCORE': {
      const { player, answers } = event.payload
      const fm = state.fastMoney ?? {
        playerOneAnswers: [],
        playerTwoAnswers: [],
        totalScore: 0,
        status: 'playing_one' as const,
        timeLimitOne: 20,
        timeLimitTwo: 25,
      }

      const p1: FastMoneyAnswer[] =
        player === 1 ? answers : fm.playerOneAnswers
      const p2: FastMoneyAnswer[] =
        player === 2 ? answers : fm.playerTwoAnswers
      const total = [...p1, ...p2].reduce((s, a) => s + (a.points ?? 0), 0)

      return {
        ...state,
        fastMoney: {
          ...fm,
          playerOneAnswers: p1,
          playerTwoAnswers: p2,
          totalScore: total,
          status: player === 1 ? 'playing_two' : 'finished',
        },
      }
    }

    case 'END_GAME': {
      return { ...state, gameStatus: 'finished' }
    }

    case 'RESET_GAME': {
      return {
        ...createInitialState(state.gameId, state.roomCode),
        teamOneName: state.teamOneName,
        teamTwoName: state.teamTwoName,
        soundEnabled: state.soundEnabled,
      }
    }

    default:
      return state
  }
}
