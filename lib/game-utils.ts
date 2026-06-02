import type { Game, Round, ActiveTeam } from './types'

export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function getTeamName(game: Game, team: ActiveTeam): string {
  if (!team) return ''
  return team === 'team_one' ? game.team_one_name : game.team_two_name
}

export function getTeamScore(game: Game, team: ActiveTeam): number {
  if (!team) return 0
  return team === 'team_one' ? game.team_one_score : game.team_two_score
}

export function getRoundStatusLabel(status: Round['status']): string {
  const labels: Record<Round['status'], string> = {
    face_off: 'CARA A CARA',
    playing: 'JUGANDO',
    steal: 'ROBO',
    finished: 'RONDA TERMINADA',
  }
  return labels[status] ?? status
}

export function getRoundStatusColor(status: Round['status']): string {
  const colors: Record<Round['status'], string> = {
    face_off: '#f5c518',
    playing: '#00ff88',
    steal: '#ff0080',
    finished: '#8888cc',
  }
  return colors[status] ?? '#ffffff'
}

export function getMultiplierLabel(multiplier: number): string {
  if (multiplier === 2) return 'DOBLE'
  if (multiplier === 3) return 'TRIPLE'
  return 'NORMAL'
}

export function calculateRoundPoints(answers: { points: number }[], revealedIds: string[], answerIds: string[]): number {
  return answers
    .filter((_, i) => revealedIds.includes(answerIds[i]))
    .reduce((sum, a) => sum + a.points, 0)
}

export function isGameOver(game: Game): boolean {
  return game.team_one_score >= 300 || game.team_two_score >= 300
}

export function getWinner(game: Game): ActiveTeam {
  if (game.team_one_score >= 300 && game.team_one_score > game.team_two_score) return 'team_one'
  if (game.team_two_score >= 300 && game.team_two_score > game.team_one_score) return 'team_two'
  if (game.status === 'finished') {
    return game.team_one_score >= game.team_two_score ? 'team_one' : 'team_two'
  }
  return null
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
