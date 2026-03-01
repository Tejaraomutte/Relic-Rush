
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StorySlides.css";



// Vite dynamic import for all frames
const slide1Images = Object.values(import.meta.glob('../assets/images/story/slide 1/*.{png,jpg,jpeg}', { eager: true, import: 'default' })).sort();
const slide2Images = Object.values(import.meta.glob('../assets/images/story/slide 2/*.{png,jpg,jpeg}', { eager: true, import: 'default' })).sort();
const slide3Images = Object.values(import.meta.glob('../assets/images/story/slide 3/*.{png,jpg,jpeg}', { eager: true, import: 'default' })).sort();

const SLIDE_FRAMES = [slide1Images, slide2Images, slide3Images];

// Cinematic timing intervals
const SLIDE1_FRAME_INTERVALS = [2000, 3000, 2000, 3000, 2000, 3000]; // Slide 1: 2s, 3s alternately
const SLIDE2_FRAME_INTERVALS = [2000, 2000]; // Slide 2: 2s for first two frames
const SLIDE2_BUBBLE1_DELAY = 2000; // Pause after first bubble
const SLIDE2_BUBBLE2_DELAY = 2000; // Pause after second bubble
const SLIDE3_FRAME_INTERVALS = [2000, 2000, 2000, 2000]; // Slide 3: 2s per frame
const SLIDE3_TEXT_FADE = 1500; // Fade in text
const SLIDE3_TEXT_DELAY = 1200; // Wait before subtitle
const SLIDE3_SUBTITLE_DELAY = 1200; // Wait before button


// Slide 1 Player dialogue
const slide1Dialogue = [
  [
    { speaker: 'Player 1', text: 'Are you sure this is the Sultan’s digital palace?' },
    { speaker: 'Player 2', text: 'Yes… and the relic is hidden behind layers of logic and code.' }
  ],

  [
    { speaker: 'Player 1', text: 'Look at those four lamps… which one is real?' },
    { speaker: 'Player 2', text: 'Only one holds the true power. The rest are clever illusions.' }
  ],

  [
    { speaker: 'Player 1', text: 'The walls are glowing with strange symbols.' },
    { speaker: 'Player 2', text: 'Those aren’t symbols… they’re algorithms guarding the treasure.' }
  ],

  [
    { speaker: 'Player 1', text: 'Did you hear that? It sounded like a ticking clock.' },
    { speaker: 'Player 2', text: 'The timer has begun. Every second matters from now on.' }
  ],

  [
    { speaker: 'Player 1', text: 'This first challenge looks simple… but I don’t trust it.' },
    { speaker: 'Player 2', text: 'In this palace, even the easiest question hides a trap.' }
  ],

  [
    { speaker: 'Player 1', text: 'No matter what happens, we think before we act.' },
    { speaker: 'Player 2', text: 'Together, we solve the riddles… and claim the original lamp.' }
  ],
];
// Slide 2 Player dialogue
const slide2Dialogue = [
  [
    { speaker: 'Player 1', text: 'That’s impossible… there are four of them.' },
    { speaker: 'Player 2', text: 'The Sultan wasn’t joking. Only one is real.' }
  ],

  [
    { speaker: 'Player 1', text: 'They look identical. No marks. No clues.' },
    { speaker: 'Player 2', text: 'Then we’ll need logic… not luck.' }
  ],

  [
    { speaker: 'Player 1', text: 'Maybe the real lamp reacts to something?' },
    { speaker: 'Player 2', text: 'Or maybe it waits for the right mind to choose it.' }
  ],

  [
    { speaker: 'Player 1', text: 'Choose wrong… and we lose a chance.' },
    { speaker: 'Player 2', text: 'Choose wisely… and one illusion disappears.' }
  ],
];

// Slide 3 Player dialogue
const slide3Dialogue = [
  [
    { speaker: 'Player 1', text: 'Do you feel that?' },
    { speaker: 'Player 2', text: 'Something’s changing…' }
  ],
  [
    { speaker: 'Player 1', text: 'The chamber… it’s rejecting us.' },
    { speaker: 'Player 2', text: 'No… it’s choosing.' }
  ],
  [
  { speaker: 'Player 1', text: 'Look at the lamps… they’re starting to glow differently.' },
  { speaker: 'Player 2', text: 'One of them feels… alive.' }
],
[
  { speaker: 'Player 1', text: 'If we choose wrong, we lose everything.' },
  { speaker: 'Player 2', text: 'Then we choose wisely… and prove we deserve the true relic.' }
]
];

export default function StorySlides() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  // Removed dialogueLineIdx, no longer needed
  const [showBubble1, setShowBubble1] = useState(false);
  const [showBubble2, setShowBubble2] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef();

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Reset state on slide/frame change
  useEffect(() => {
    setShowBubble1(false);
    setShowBubble2(false);
    setShowText(false);
    setShowSubtitle(false);
    setShowNext(false);
    setButtonDisabled(false);
    setFadeOut(true);
    setTimeout(() => setFadeOut(false), 700);
  }, [slideIdx, frameIdx]);

  // Next for slide/frame
  const handleNext = () => {
    if (frameIdx < SLIDE_FRAMES[slideIdx].length - 1) {
      setFrameIdx(frameIdx + 1);
    } else if (slideIdx < 2) {
      setSlideIdx(slideIdx + 1);
      setFrameIdx(0); // Reset frame index for new slide
    } else if (slideIdx === 2 && frameIdx === SLIDE_FRAMES[2].length - 1) {
      // Advance to mysteriousVoice state
      setFrameIdx(frameIdx + 1);
      setShowText(true);
      setTimeout(() => setShowSubtitle(true), SLIDE3_TEXT_DELAY);
      setTimeout(() => setShowNext(true), SLIDE3_TEXT_DELAY + SLIDE3_SUBTITLE_DELAY);
    }
  };

  const handleSkipStory = () => {
    setSlideIdx(2);
    setFrameIdx(slide3Dialogue.length - 1);
    setShowText(true);
    setShowSubtitle(true);
    setShowNext(false);
    setButtonDisabled(false);
  };

  // Frame image path
  const frameSrc = SLIDE_FRAMES[slideIdx][frameIdx];


  // ...existing code...

  // Mysterious voice text for final frame
  const mysteriousVoice = [
    'You who seek the relic…',
    'Prove your worth.',
    'Only one lamp is real.',
    'Choose wisely.'
  ];

  // Helper to render Player dialogue (both lines at once)
  function renderDialogue(dialogue, slideClass) {
    if (!dialogue || dialogue.length === 0) return null;
    return (
      <div className="story-slide-dialogue">
        {dialogue.map((line, idx) => (
          <div key={idx} className={`story-slide-dialogue-line ${slideClass} story-slide-dialogue-fadein`}>
            <span className="story-slide-dialogue-speaker">{line.speaker}:</span>
            <span className="story-slide-dialogue-text">{line.text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="story-slide-root">
      <img
        src={frameSrc}
        alt="story frame"
        className="story-slide-frame active"
        style={{ opacity: 1, zIndex: 2, transform: 'scale(1.05)' }}
      />
      <div className="story-slide-overlay" />
      {fadeOut && <div className="story-slide-fade-black" />} 
      <div className="story-slide-content" style={{ pointerEvents: 'none' }}>
        {/* Slide 1 Player dialogue */}
        {slideIdx === 0 && slide1Dialogue[frameIdx] && renderDialogue(slide1Dialogue[frameIdx], 'story-slide-dialogue-slide1')}
        {/* Slide 2 Player dialogue */}
        {slideIdx === 1 && slide2Dialogue[frameIdx] && renderDialogue(slide2Dialogue[frameIdx], 'story-slide-dialogue-slide2')}
        {/* Slide 3 Player dialogue */}
        {slideIdx === 2 && slide3Dialogue[frameIdx] && renderDialogue(slide3Dialogue[frameIdx], 'story-slide-dialogue-slide3')}
        {/* Slide 3 mysterious voice */}
        {/* No mysteriousVoice block needed for this logic */}
        {/* Next/Enter button at bottom right for every conversation frame */}
        {/* Next button for all frames except the last frame of slide 3 */}
        {((slideIdx === 0 && slide1Dialogue[frameIdx]) ||
          (slideIdx === 1 && slide2Dialogue[frameIdx]) ||
          (slideIdx === 2 && frameIdx < slide3Dialogue.length - 1 && slide3Dialogue[frameIdx])) ? (
          <>
            <button
              className="story-slide-btn visible story-slide-btn-bottom-left story-slide-btn-skip"
              onClick={handleSkipStory}
              disabled={buttonDisabled}
              style={{ pointerEvents: buttonDisabled ? 'none' : 'auto' }}
            >
              Skip Story
            </button>

            <button
              className="story-slide-btn visible story-slide-btn-bottom-right"
              onClick={handleNext}
              disabled={buttonDisabled}
              style={{ pointerEvents: buttonDisabled ? 'none' : 'auto' }}
            >
              Next →
            </button>
          </>
        ) : null}
        {/* Mysterious voice message and Enter Arena button for the last frame of slide 3 */}
        {slideIdx === 2 && frameIdx === slide3Dialogue.length - 1 && (
          <>
            <div className="story-slide-mystery-text" style={{ transition: `opacity ${SLIDE3_TEXT_FADE}ms`, opacity: 1 }}>
              {mysteriousVoice.map((line, idx) => (
                <div key={idx} className="story-slide-mystery-line story-slide-mystery-slide3">{line}</div>
              ))}
            </div>
            <button
              className="story-slide-btn visible story-slide-btn-bottom-right"
              onClick={() => {
                localStorage.setItem('storyCompleted', 'true');
                navigate('/round1');
              }}
              disabled={buttonDisabled}
              style={{ pointerEvents: buttonDisabled ? 'none' : 'auto' }}
            >
              Enter Arena →
            </button>
          </>
        )}
      </div>
    </div>
  );
}


