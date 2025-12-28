
import React, { useState, useEffect, useRef } from 'react';

const HINDI_SAMPLES = [
  "भारत एक महान देश है। यहाँ की संस्कृति बहुत पुरानी है।",
  "शिक्षा मनुष्य के जीवन के लिए बहुत महत्वपूर्ण है।",
  "पेड़-पौधे हमारे पर्यावरण को शुद्ध रखते हैं। हमें पेड़ लगाने चाहिए।",
  "सफलता मेहनत करने वालों को ही मिलती है। कभी हार मत मानो।",
  "समय का सदुपयोग करना बहुत ज़रूरी है, क्योंकि बीता समय वापस नहीं आता।"
];

interface WPMTestProps {
  darkMode: boolean;
}

const WPMTest: React.FC<WPMTestProps> = ({ darkMode }) => {
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<{ wpm: number; accuracy: number } | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    resetTest();
  }, []);

  const resetTest = () => {
    const randomText = HINDI_SAMPLES[Math.floor(Math.random() * HINDI_SAMPLES.length)];
    setTargetText(randomText);
    setUserInput('');
    setStartTime(null);
    setTimer(0);
    setIsActive(false);
    setResult(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (!isActive && value.length > 0) {
      setIsActive(true);
      setStartTime(Date.now());
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    setUserInput(value);

    if (value === targetText) {
      finishTest(value);
    }
  };

  const finishTest = (finalValue: string) => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const durationInMinutes = timer / 60 || 0.01;
    const wordCount = finalValue.split(' ').length;
    const wpm = Math.round(wordCount / durationInMinutes);
    
    // Simple accuracy
    let correctChars = 0;
    for (let i = 0; i < finalValue.length; i++) {
      if (finalValue[i] === targetText[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / targetText.length) * 100);

    setResult({ wpm, accuracy });
  };

  return (
    <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm max-w-2xl mx-auto`}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <i className="fa-solid fa-gauge-high text-indigo-500"></i>
        Hindi Typing Speed Test
      </h2>

      <div className={`p-4 rounded-lg mb-6 devanagari text-xl leading-relaxed ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
        {targetText.split('').map((char, i) => {
          let color = '';
          if (i < userInput.length) {
            color = userInput[i] === char ? 'text-emerald-500' : 'text-rose-500';
          }
          return <span key={i} className={color}>{char}</span>;
        })}
      </div>

      <textarea
        value={userInput}
        onChange={handleInputChange}
        disabled={result !== null}
        className={`w-full h-32 p-4 rounded-lg border-2 devanagari text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
        placeholder="यहाँ टाइप करना शुरू करें..."
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-sm text-slate-500">Timer</p>
            <p className="text-2xl font-mono font-bold">{timer}s</p>
          </div>
          {result && (
            <>
              <div className="text-center">
                <p className="text-sm text-slate-500">WPM</p>
                <p className="text-2xl font-bold text-indigo-500">{result.wpm}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">Accuracy</p>
                <p className="text-2xl font-bold text-emerald-500">{result.accuracy}%</p>
              </div>
            </>
          )}
        </div>

        <button
          onClick={resetTest}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-rotate-right"></i>
          {result ? 'New Test' : 'Reset'}
        </button>
      </div>
    </div>
  );
};

export default WPMTest;
