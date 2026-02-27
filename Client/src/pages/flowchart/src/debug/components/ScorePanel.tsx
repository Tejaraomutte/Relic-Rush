import React from "react";

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  time: string;
};

type ScorePanelProps = {
  entries: LeaderboardEntry[];
};

export default function ScorePanel({ entries }: ScorePanelProps) {
  return (
    <div className="leaderboard-card">
      <h3 className="leaderboard-title">Leaderboard</h3>
      <div className="leaderboard-table">
        <div className="leaderboard-row leaderboard-head">
          <span>Rank</span>
          <span>Player</span>
          <span>Score</span>
          <span>Time Taken</span>
        </div>
        {entries.map((entry) => (
          <div
            key={`${entry.rank}-${entry.name}`}
            className={`leaderboard-row leaderboard-rank-${entry.rank}`}
          >
            <span>#{entry.rank}</span>
            <span>{entry.name}</span>
            <span>{entry.score}</span>
            <span>{entry.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
