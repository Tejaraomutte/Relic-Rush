import { useCallback, useEffect, useMemo, useState } from "react";
// @ts-expect-error JS module is intentionally used for shared question data
import debugQuestions from "./debugQuestions";
import QuestionSelector from "./components/QuestionSelector";

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
					<span key={`text-${selectedIndex}-${idx}`} className="code-text">{part}</span>
				);
			}
			// Handle blanks
			const blankIndex = parseInt(match[1], 10) - 1;
			return (
				<input
					key={`blank-${selectedIndex}-${blankIndex}`}
					className="code-blank"
					value={answers[selectedIndex][blankIndex] || ""}
					onChange={e => handleAnswerChange(blankIndex, e.target.value)}
					disabled={isRoundLocked}
					style={{
						width: 60,
						margin: '0 6px',
						borderRadius: 6,
						border: '1px solid #a5b4fc',
						padding: '4px 8px',
						fontSize: 16,
						background: '#fff',
						color: '#6d28d9',
						fontWeight: 600,
						boxShadow: '0 2px 8px #6d28d933',
						outline: 'none',
					}}
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

	// Compute stats for the currently selected question only
	const currentStats = useMemo(() => {
		if (!results[selectedIndex] || !questions[selectedIndex]) return { correct: 0, total: 0, score: 0, maxScore: 0, percentage: 0 };
		return computeStats([results[selectedIndex]], [questions[selectedIndex]]);
	}, [results, questions, selectedIndex]);

	useEffect(() => {
		if (typeof onScoreChange === "function") {
			onScoreChange(currentStats.score);
		}
	}, [onScoreChange, currentStats.score]);

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
			
				<div className="debug-controls">
				
				</div>
			</header>

			<div className="debug-canvas">
				<div className="debug-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
					<div className="debug-selector-row">
						{/* Removed extra dropdown. Only show dropdown inside the challenge card below. */}
					</div>

					<div className="debug-layout">
						<article className="challenge-card" style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'rgba(255,255,255,0.10)',
							borderRadius: 18,
							boxShadow: '0 12px 40px #6d28d933',
							padding: '36px 28px',
							width: '100%',
							maxWidth: 700,
							margin: '0 auto',
						}}>
							<div className="challenge-header" style={{ textAlign: 'center', width: '100%' }}>
								<h3 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '0.5px', textShadow: '0 1px 6px #6d28d9aa' }}>{currentQuestion.title}</h3>
								<p style={{ fontSize: 18, color: '#c4b5fd', marginBottom: 18, fontWeight: 500, textShadow: '0 1px 6px #6d28d9aa' }}>{currentQuestion.description}</p>
							</div>

							<div style={{ marginBottom: 22, width: '100%', textAlign: 'center' }}>
								<label htmlFor="challenge-select" style={{ fontWeight: 700, color: '#c4b5fd', fontSize: 18, marginRight: 8 }}>Debug Challenge:</label>
								<select
									id="challenge-select"
									value={selectedId}
									onChange={e => setSelectedId(e.target.value)}
									disabled={isRoundLocked}
									style={{
										fontSize: 18,
										padding: '10px 18px',
										borderRadius: 10,
										border: '2px solid #fbbf24',
										background: 'linear-gradient(90deg,#f3f7fb,#e0e7ff)',
										color: '#6d28d9',
										fontWeight: 700,
										boxShadow: '0 4px 16px #6d28d933',
										outline: 'none',
										marginLeft: 8,
										width: 320,
										textAlign: 'center',
										appearance: 'none',
										WebkitAppearance: 'none',
										MozAppearance: 'none',
										transition: 'border .2s, box-shadow .2s',
									}}
								>
									{questions.map((question) => (
										<option key={question.id} value={question.id} style={{ fontWeight: 700, color: '#6d28d9', background: '#fff' }}>{question.title}</option>
									))}
								</select>
							</div>

							<div className="code-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontFamily: 'Fira Mono, Consolas, monospace', background: 'rgba(30,27,46,0.98)', borderRadius: 14, padding: '28px 22px', color: '#f3f4f6', boxShadow: '0 10px 40px #6d28d933', textAlign: 'center', margin: '0 auto', width: '100%', maxWidth: 700, overflowX: 'auto' }}>
								{currentQuestion.codeTemplate.map((line, lineIdx) => (
									<div key={`line-${currentQuestion.id}-${lineIdx}`} className="code-line" style={{ textAlign: 'center', marginBottom: 6 }}>
										{renderLine(line)}
									</div>
								))}
							</div>
							{/* Score display for current question only */}

							<div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', width: '100%' }}>
								<button
									className="btn"
									onClick={handleSubmitDebug}
									disabled={
										isRoundLocked ||
										currentStats.score === currentStats.maxScore ||
										(() => {
											const selectedAnswers = answers[selectedIndex] || [];
											const requiredCount = currentQuestion.answers.length;
											return selectedAnswers.filter((a) => a && a.trim() !== "").length !== requiredCount;
										})()
									}
									style={{ fontSize: 20, fontWeight: 700, padding: '14px 36px', background: 'linear-gradient(90deg,#6d28d9,#4f46e5)', color: '#fff', borderRadius: 12, boxShadow: '0 8px 32px #6d28d933', letterSpacing: '0.5px', border: 'none', transition: 'background .2s, box-shadow .2s', margin: '0 auto' }}
								>
									Submit
								</button>
							</div>
						</article>

						{/* Leaderboard removed */}
					</div>
				</div>
			</div>

			<ScoreModal
				isOpen={showModal}
				correct={currentStats.correct}
				total={currentStats.total}
				percentage={currentStats.percentage}
				onRetry={handleRetry}
				onClose={handleCloseModal}
			/>
		</section>
	);
}