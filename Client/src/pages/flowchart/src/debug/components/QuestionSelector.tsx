import React from "react";

export type QuestionOption = {
  id: string;
  title: string;
};

type QuestionSelectorProps = {
  questions: QuestionOption[];
  selectedId: string;
  onChange: (nextId: string) => void;
  disabled?: boolean;
};

export default function QuestionSelector({
  questions,
  selectedId,
  onChange,
  disabled = false
}: QuestionSelectorProps) {
  return (
    <div className="selector">
      <label className="selector-label" htmlFor="debug-challenge-select">
        Debug Challenge
      </label>
      <select
        id="debug-challenge-select"
        className="selector-select"
        value={selectedId}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {questions.map((question) => (
          <option key={question.id} value={question.id}>
            {question.title}
          </option>
        ))}
      </select>
    </div>
  );
}
