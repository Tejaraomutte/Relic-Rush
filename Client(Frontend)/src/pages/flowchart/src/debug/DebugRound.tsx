import { useCallback, useEffect, useMemo, useState } from "react";
// @ts-expect-error JS module is intentionally used for shared question data
import debugQuestions from "./debugQuestions";
import QuestionSelector from "./components/QuestionSelector";
// import ScorePanel from "./components/ScorePanel";
// import type { LeaderboardEntry } from "./components/ScorePanel";
import ScoreModal from "./components/ScoreModal";

type DebugQuestion = {
	id: string;
	title: string;
	description: string;
	codeTemplate: string[];
	answers: string[];
	marksPerBlank: number;
};

type DebugRoundProps = {
	onScoreChange?: (score: number) => void;
	onProgressChange?: (payload: { solvedCount: number; solvedIds: string[]; total: number }) => void;
	isRoundLocked?: boolean;
};

function buildInitialAnswers(questions: DebugQuestion[]) {
	return questions.map((question) => Array(question.answers.length).fill(""));
}

function buildInitialResults(questions: DebugQuestion[]) {
	return questions.map((question) => Array(question.answers.length).fill(null));
}

function computeResults(questions: DebugQuestion[], answers: string[][]) {
	return questions.map((question, questionIndex) =>
		answers[questionIndex].map(
			(answer, idx) => answer === question.answers[idx]
		)
	);
}

function computeStats(results: Array<Array<boolean | null>>, questions: DebugQuestion[]) {
	let correct = 0;
	let total = 0;
	let score = 0;
	let maxScore = 0;

	results.forEach((row, questionIndex) => {
		const question = questions[questionIndex];
		row.forEach((isCorrect) => {
			total += 1;
			if (isCorrect) {
				correct += 1;
				score += question.marksPerBlank;
			}
		});
		maxScore += question.answers.length * question.marksPerBlank;
	});

	const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0;

	return { correct, total, score, maxScore, percentage };
}

export default function DebugRound({ onScoreChange, onProgressChange, isRoundLocked = false }: DebugRoundProps) {
	// ...existing code...

	// Ensure renderLine is defined in scope
	const renderLine = (line: string) => {
		const parts = line.split(/(___\d+___)/g).filter(Boolean);

		return parts.map((part, idx) => {
			const match = part.match(/___(\d+)___/);
			if (!match) {
				return (
					<span key={`text-${selectedIndex}-${idx}`} className="code-text">
						{part}
					</span>
				);
			}

			const blankIndex = Number(match[1]) - 1;
			const status = results[selectedIndex][blankIndex];
			const statusClass =
				status === null ? "" : status ? "input-correct" : "input-wrong";

			return (
				<input
					key={`blank-${selectedIndex}-${idx}`}
					type="text"
					className={`code-input ${statusClass}`}
					value={answers[selectedIndex][blankIndex] || ""}
					onChange={(event) => handleAnswerChange(blankIndex, event.target.value)}
					disabled={isRoundLocked}
					aria-label={`Blank ${blankIndex + 1}`}
				/>
			);
		});
	};
	const questions = useMemo(() => debugQuestions as DebugQuestion[], []);
	const [selectedId, setSelectedId] = useState(questions[0]?.id ?? "");
	const [answers, setAnswers] = useState(() => buildInitialAnswers(questions));
	const [results, setResults] = useState(() => buildInitialResults(questions));
	const [solvedByQuestion, setSolvedByQuestion] = useState<Record<string, boolean>>({});
	const [showModal, setShowModal] = useState(false);

	const selectedIndex = Math.max(
		0,
		questions.findIndex((question) => question.id === selectedId)
	);

	const stats = useMemo(() => computeStats(results, questions), [results, questions]);

	useEffect(() => {
		if (typeof onScoreChange === "function") {
			onScoreChange(stats.score);
		}
	}, [onScoreChange, stats.score]);

	useEffect(() => {
		const solvedIds = questions.filter((question) => solvedByQuestion[question.id]).map((question) => question.id);
		onProgressChange?.({
			solvedCount: solvedIds.length,
			solvedIds,
			total: questions.length
		});
	}, [solvedByQuestion, onProgressChange, questions]);

	const handleSubmitDebug = useCallback(() => {
		if (isRoundLocked) return;
		const nextResults = computeResults(questions, answers);
		setResults(nextResults);

		const solvedNow = nextResults.map((row) => row.every((item) => item === true));
		setSolvedByQuestion((prev) => {
			const next = { ...prev };
			questions.forEach((question, index) => {
				next[question.id] = solvedNow[index] || Boolean(prev[question.id]);
			});
			return next;
		});

		setShowModal(true);
	}, [answers, isRoundLocked, questions]);

	const handleRetry = () => {
		setAnswers(buildInitialAnswers(questions));
		setResults(buildInitialResults(questions));
		setShowModal(false);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleAnswerChange = (blankIndex: number, value: string) => {
		if (isRoundLocked) return;
		setAnswers((prev) => {
			const next = prev.map((row) => [...row]);
			next[selectedIndex][blankIndex] = value;
			return next;
		});
	};

	// ...existing code...
	if (!questions.length) {
		return (
			<section className="debug-page">
				<div className="debug-empty">No debug questions configured.</div>
			</section>
		);
	}

	const currentQuestion = questions[selectedIndex];

	return (
		<section className="debug-page">
			<header className="debug-header">
				<div>
					<h2>Event Round — Debugging</h2>
					<div className="debug-subtitle">Fix the code challenges for this round</div>
				</div>
				<div className="debug-controls">
					<button
						className="btn"
						onClick={handleSubmitDebug}
							disabled={isRoundLocked || (() => {
								const selectedAnswers = answers[selectedIndex] || [];
								const requiredCount = debugQuestions[selectedIndex].answers.length;
								return selectedAnswers.filter((a) => a && a.trim() !== "").length !== requiredCount;
							})()}
					>
						Submit Debug
					</button>
				</div>
			</header>

			<div className="debug-canvas">
				<div className="debug-container">
					<div className="debug-selector-row">
						<QuestionSelector
							questions={questions.map((question) => ({
								id: question.id,
								title: question.title
							}))}
							selectedId={selectedId}
							onChange={setSelectedId}
							disabled={isRoundLocked}
						/>
					</div>

					<div className="debug-layout">
						<article className="challenge-card">
							<div className="challenge-header">
								<div>
									<h3>{currentQuestion.title}</h3>
									<p>{currentQuestion.description}</p>
								</div>
							</div>

							<div className="code-block">
								{currentQuestion.codeTemplate.map((line, lineIdx) => (
									<div key={`line-${currentQuestion.id}-${lineIdx}`} className="code-line">
										{renderLine(line)}
									</div>
								))}
							</div>
						</article>

						{/* Leaderboard removed */}
					</div>
				</div>
			</div>

			<ScoreModal
				isOpen={showModal}
				correct={stats.correct}
				total={stats.total}
				percentage={stats.percentage}
				onRetry={handleRetry}
				onClose={handleCloseModal}
			/>
		</section>
	);
}