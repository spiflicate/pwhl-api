/**
 * Game Center types from the statviewfeed feed (what thepwhl.com's game
 * pages use): camelCase, with players and teams as nested objects.
 * Field lists come from live responses for finished games in every
 * season.
 */

import type { NumericBoolean, NumericString } from './common.ts';

export interface CenterPlayer {
   id: number;
   firstName: string;
   lastName: string;
   jerseyNumber: number;
   position: string;
   birthDate: string;
   playerImageURL: string;
}

export interface CenterPlayerMaybe {
   id: number;
   firstName: null | string;
   lastName: null | string;
   jerseyNumber: number;
   position: null | string;
   birthDate: string;
   playerImageURL: string;
}

export interface CenterLeaderRef {
   id: number;
   firstName: string;
   lastName: string;
   jerseyNumber: number;
   position: null;
   birthDate: string;
   playerImageURL: string;
}

export interface CenterLeaderRefMaybe {
   id: number;
   firstName: null | string;
   lastName: null | string;
   jerseyNumber: number;
   position: null;
   birthDate: string;
   playerImageURL: string;
}

export interface CenterTeam {
   id: number;
   name: string;
   city: string;
   nickname: string;
   abbreviation: string;
   logo: string;
}

export interface CenterTeamWithDivision {
   id: number;
   name: string;
   city: string;
   nickname: string;
   abbreviation: string;
   logo: string;
   divisionName: string;
}

export interface CenterPeriod {
   id: NumericString;
   shortName: string;
   longName: string;
}

export interface CenterRecord {
   wins: number;
   losses: number;
   ties: number;
   OTWins: number;
   OTLosses: number;
   SOWins: number;
   SOLosses: number;
   regulationWins: number;
   regulationLosses: number;
   nonRegWins: number;
   nonRegLosses: number;
   formattedRecord: string;
}

export interface CenterSkaterStats {
   goals: number;
   assists: number;
   points: number;
   penaltyMinutes: number;
   plusMinus: number;
   faceoffAttempts: number;
   faceoffWins: number;
   shots: number;
   hits: number;
   blockedShots: number;
   toi: string;
}

export interface CenterGoalieStats {
   goals: number;
   assists: number;
   points: number;
   penaltyMinutes: number;
   plusMinus: number;
   faceoffAttempts: number;
   faceoffWins: number;
   timeOnIce: null | string;
   shotsAgainst: number;
   goalsAgainst: number;
   saves: number;
}

export interface CenterLeaderStats {
   goals: number;
   assists: number;
   points: number;
   penaltyMinutes: number;
   plusMinus: number;
   faceoffAttempts: number;
   faceoffWins: number;
   shots: number;
   hits: number;
   blockedShots: number;
   toi: null;
}

export interface CenterPowerPlay {
   power_plays: number;
   power_player_goals: number;
   power_play_goals: number;
   percentage: number;
}

export interface CenterPenaltyKill {
   times_short_handed: number;
   power_player_goals_against: number;
   power_play_goals_against: number;
   percentage: number;
}

export interface SituationalRecords {
   leading_after_1st: string;
   leading_after_2nd: string;
   tied_after_1st: string;
   tied_after_2nd: string;
   trailing_after_1st: string;
   trailing_after_2nd: string;
   out_shooting_opponents: string;
   out_shot_by_opponent: string;
   one_goal_game: string;
   two_goal_game: string;
   three_goal_game: string;
   four_goal_game: string;
   five_goal_game: string;
   six_goal_game: string;
   sevenplus_goal_game: string;
   as_of_game: string;
}

export interface BoxScoreTeam {
   info: CenterTeamWithDivision;
   stats: {
      shots: number;
      goals: number;
      hits: number;
      powerPlayGoals: number;
      powerPlayOpportunities: number;
      goalCount: number;
      assistCount: number;
      penaltyMinuteCount: number;
      infractionCount: number;
      faceoffAttempts: number;
      faceoffWins: number;
      faceoffWinPercentage: number;
   };
   media: {
      audioUrl: string;
      videoUrl: string;
      webcastUrl: string;
   };
   coaches: {
      personId: NumericString;
      firstName: string;
      lastName: string;
      role: string;
   }[];
   skaters: {
      info: CenterPlayer;
      stats: CenterSkaterStats;
      starting: number;
      status: string;
   }[];
   goalies: {
      info: CenterPlayer;
      stats: CenterGoalieStats;
      starting: number;
      status: string;
   }[];
   goalieLog: {
      info: CenterPlayer;
      stats: {
         goals: number;
         assists: number;
         points: number;
         penaltyMinutes: number;
         plusMinus: number;
         faceoffAttempts: number;
         faceoffWins: number;
         timeOnIce: string;
         shotsAgainst: number;
         goalsAgainst: number;
         saves: number;
      };
      periodStart: CenterPeriod;
      timeStart: string;
      periodEnd: CenterPeriod;
      timeEnd: string;
      result: string;
   }[];
   seasonStats: {
      seasonId: null;
      teamRecord: CenterRecord;
      teamStats: unknown[];
   };
}

export interface CenterPenaltyShot {
   shooter: CenterPlayer;
   goalie: CenterPlayer;
   shooter_team: CenterTeamWithDivision;
   period: CenterPeriod;
   time: string;
   isGoal: boolean;
}

/** statviewfeed `gameSummary`: box score, scoring and penalties by period */
export interface BoxScore {
   details: {
      id: number;
      date: string;
      gameNumber: NumericString;
      venue: string;
      attendance: number;
      startTime: string;
      endTime: string;
      duration: string;
      gameReportUrl: string;
      textBoxscoreUrl: string;
      ticketsUrl: string;
      started: NumericBoolean;
      final: NumericBoolean;
      publicNotes: string;
      status: string;
      seasonId: NumericString;
      floHockeyUrl: string;
      GameDateISO8601: string;
      mvpType: number;
   };
   referees: {
      firstName: string;
      lastName: string;
      jerseyNumber: number;
      role: string;
   }[];
   linesmen: {
      firstName: string;
      lastName: string;
      jerseyNumber: number;
      role: string;
   }[];
   /** Always empty in captures */
   scorekeepers: unknown[];
   mostValuablePlayers: {
      team: CenterTeamWithDivision;
      player: {
         info: CenterPlayer;
         stats: {
            goals: number;
            assists: number;
            points: number;
            penaltyMinutes: number;
            plusMinus: number;
            faceoffAttempts: number;
            faceoffWins: number;
            shots?: number;
            hits?: number;
            blockedShots?: number;
            toi?: string;
            timeOnIce?: string;
            shotsAgainst?: number;
            goalsAgainst?: number;
            saves?: number;
         };
         starting: number;
         status: string;
      };
      isGoalie: boolean;
      playerImage: string;
      homeTeam: number;
   }[];
   hasShootout: boolean;
   shootoutDetails?: {
      homeTeamShots: {
         shooter: CenterPlayer;
         goalie: CenterPlayer;
         isGoal: boolean;
         isGameWinningGoal: boolean;
         shooterTeam: CenterTeamWithDivision;
      }[];
      visitingTeamShots: {
         shooter: CenterPlayer;
         goalie: CenterPlayer;
         isGoal: boolean;
         isGameWinningGoal: boolean;
         shooterTeam: CenterTeamWithDivision;
      }[];
      winningTeam: CenterTeamWithDivision;
   };
   homeTeam: BoxScoreTeam;
   visitingTeam: BoxScoreTeam;
   periods: {
      info: CenterPeriod;
      stats: {
         homeGoals: NumericString;
         homeShots: NumericString;
         visitingGoals: NumericString;
         visitingShots: NumericString;
      };
      goals: {
         game_goal_id: NumericString;
         team: CenterTeamWithDivision;
         period: CenterPeriod;
         time: string;
         scorerGoalNumber: NumericString;
         scoredBy: CenterPlayer;
         assists: CenterPlayer[];
         assistNumbers: NumericString[];
         properties: {
            isPowerPlay: NumericString;
            isShortHanded: NumericString;
            isEmptyNet: NumericString;
            isPenaltyShot: NumericString;
            isInsuranceGoal: NumericString;
            isGameWinningGoal: NumericString;
         };
         plus_players: CenterPlayer[];
         minus_players: CenterPlayer[];
      }[];
      penalties: {
         game_penalty_id: number;
         period: CenterPeriod;
         time: string;
         againstTeam: CenterTeamWithDivision;
         minutes: number;
         description: string;
         ruleNumber: NumericString;
         takenBy: null | CenterPlayer;
         servedBy: CenterPlayer;
         isPowerPlay: boolean;
         isBench: boolean;
      }[];
   }[];
   penaltyShots: {
      homeTeam: CenterPenaltyShot[];
      visitingTeam: CenterPenaltyShot[];
   };
   featuredPlayer: {
      team: CenterTeamWithDivision;
      player: {
         info: {
            id: number;
            firstName: null;
            lastName: null;
            jerseyNumber: number;
            position: null;
            birthDate: null;
            playerImageURL: string;
         };
         stats: CenterLeaderStats;
         starting: number;
         status: null;
      };
      isGoalie: boolean;
      playerImage: null;
      homeTeam: number;
      sponsor: {
         name: null;
         image: null;
      };
   };
}

export interface GameEventGoalieChange {
   event: 'goalie_change';
   details: {
      goalieComingIn: null | CenterPlayer;
      goalieGoingOut: null | CenterPlayer;
      team_id: NumericString;
      period: CenterPeriod;
      time: string;
   };
}

export interface GameEventFaceoff {
   event: 'faceoff';
   details: {
      homePlayer: CenterPlayer;
      visitingPlayer: CenterPlayer;
      period: CenterPeriod;
      time: string;
      xLocation: number;
      yLocation: number;
      homeWin: NumericString;
   };
}

export interface GameEventHit {
   event: 'hit';
   details: {
      teamId: NumericString;
      player: CenterPlayerMaybe;
      onPlayer: null | CenterPlayer;
      period: CenterPeriod;
      time: string;
      xLocation: number;
      yLocation: number;
   };
}

export interface GameEventShot {
   event: 'shot';
   details: {
      shooter: CenterPlayer;
      goalie: CenterPlayerMaybe;
      shooterTeamId: NumericString;
      period: CenterPeriod;
      time: string;
      isGoal: boolean;
      shotQuality: string;
      shotType: string;
      xLocation: number;
      yLocation: number;
   };
}

export interface GameEventBlockedShot {
   event: 'blocked_shot';
   details: {
      shooter: CenterPlayer;
      blocker: CenterPlayerMaybe;
      goalie: CenterPlayerMaybe;
      shooterTeamId: NumericString;
      period: {
         id: string;
         shortName: null;
         longName: string;
      };
      time: string;
      shotQuality: string;
      shotType: string;
      xLocation: number;
      yLocation: number;
   };
}

export interface GameEventGoal {
   event: 'goal';
   details: {
      game_goal_id: NumericString;
      team: CenterTeam;
      period: CenterPeriod;
      time: string;
      scorerGoalNumber: NumericString;
      scoredBy: CenterPlayer;
      assists: CenterPlayer[];
      assistNumbers: NumericString[];
      properties: {
         isPowerPlay: NumericString;
         isShortHanded: NumericString;
         isEmptyNet: NumericString;
         isPenaltyShot: NumericString;
         isInsuranceGoal: NumericString;
         isGameWinningGoal: NumericString;
      };
      plus_players: CenterPlayer[];
      minus_players: CenterPlayer[];
      xLocation?: number;
      yLocation?: number;
   };
}

export interface GameEventPenalty {
   event: 'penalty';
   details: {
      game_penalty_id: NumericString;
      period: CenterPeriod;
      time: string;
      againstTeam: CenterTeam;
      minutes: NumericString;
      description: string;
      ruleNumber: NumericString;
      takenBy: CenterPlayerMaybe;
      servedBy: CenterPlayer;
      isPowerPlay: boolean;
      isBench: boolean;
   };
}

export interface GameEventShootout {
   event: 'shootout';
   details: {
      shooter: CenterPlayer;
      goalie: CenterPlayer;
      isGoal: boolean;
      isGameWinningGoal: boolean;
      shooterTeam: CenterTeam;
   };
}

export interface GameEventPenaltyShot {
   event: 'penaltyshot';
   details: {
      shooter: CenterPlayer;
      goalie: CenterPlayer;
      shooter_team: CenterTeam;
      period: {
         id: NumericString;
         shortName: NumericString;
         longName: string;
      };
      time: string;
      isGoal: boolean;
   };
}

export interface MatchupTeam {
   teamInfo: {
      id: number;
      name: null | string;
      city: null | string;
      nickname: null | string;
      abbreviation: null | string;
      logo: string;
      divisionName?: string;
      conferenceName?: string;
   };
   teamRecord: {
      overall: CenterRecord;
      home: CenterRecord;
      visiting: CenterRecord;
      past_10_games: CenterRecord;
      streak: null | string;
   };
   goalsFor: null | number;
   goalsAgainst: null | number;
   miscellaneousRecords: SituationalRecords;
   leadingRookie: {
      info: CenterLeaderRefMaybe;
      stats: CenterLeaderStats;
      starting: number;
      status: null;
   };
   leadingPIM: {
      info: CenterLeaderRefMaybe;
      stats: CenterLeaderStats;
      starting: number;
      status: null;
   };
   powerPlayStats: {
      overall: null | CenterPowerPlay;
      home: null | CenterPowerPlay;
      visiting: null | CenterPowerPlay;
   };
   penaltyKillStats: {
      overall: null | CenterPenaltyKill;
      home: null | CenterPenaltyKill;
      visiting: null | CenterPenaltyKill;
   };
   gamesPlayed: number;
   penaltyMinutes: number;
   penaltyMinutesPerGame: number;
   longestStreaks: {
      points: {
         player: CenterLeaderRef;
         streak: string;
         length: number;
      }[];
      goals: {
         player: CenterLeaderRef;
         streak: string;
         length: number;
      }[];
      assists: {
         player: CenterLeaderRef;
         streak: string;
         length: number;
      }[];
   };
   previousGames: {
      id: NumericString;
      date_played: string;
      game_date_iso_8601: string;
      home_team: NumericString;
      homeCode: string;
      homeCity: string;
      home_goal_count: NumericString;
      visiting_team: NumericString;
      visitingCode: string;
      visitingCity: string;
      visiting_goal_count: NumericString;
      winner: NumericString;
   }[];
   leadingScorers: {
      info: CenterLeaderRef;
      stats: CenterLeaderStats;
      starting: number;
      status: null;
   }[];
   lineup: {
      goalies: unknown[];
      skaters: unknown[];
   };
}

/** statviewfeed `gameCenterPreview`: team form, leaders and head-to-head */
export interface Matchup {
   homeTeam: MatchupTeam;
   visitingTeam: MatchupTeam;
   headToHeadRecords: {
      homeTeam: {
         previousYear: CenterRecord;
         currentYear: CenterRecord;
         previousFiveYears: CenterRecord;
      };
      visitingTeam: {
         previousYear: CenterRecord;
         currentYear: CenterRecord;
         previousFiveYears: CenterRecord;
      };
   };
   previousMeetings: {
      gameId: NumericString;
      visitingTeamId: NumericString;
      visitingCity: string;
      visitingScore: NumericString;
      homeTeamId: NumericString;
      homeCity: string;
      homeScore: NumericString;
      datePlayed: string;
      game_date_iso_8601: string;
      status: string;
   }[];
   lineupPairingReport: null;
}

/** statviewfeed `gameCenterPlayByPlay` event, discriminated on `event` */
export type GameEvent =
   | GameEventGoalieChange
   | GameEventFaceoff
   | GameEventHit
   | GameEventShot
   | GameEventBlockedShot
   | GameEventGoal
   | GameEventPenalty
   | GameEventShootout
   | GameEventPenaltyShot;
