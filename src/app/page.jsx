"use client";
import React, { useState, useEffect, useCallback } from "react";

function MainComponent() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [powerUps, setPowerUps] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [targetSize, setTargetSize] = useState(80);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [penaltyPosition, setPenaltyPosition] = useState({ x: 30, y: 30 });
  const [showModal, setShowModal] = useState(false);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particles, setParticles] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const startGame = useCallback(() => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(45);
    setCombo(0);
    setLevel(1);
    setTargetSize(80);
    setPowerUpActive(false);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setBestScore((prev) => Math.max(prev, score));
          setShowModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [score]);

  const getRandomPosition = () => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    return { x, y };
  };
  const createParticles = (x, y) => {
    const newParticles = [...Array.from({ length: 20 })].map(() => ({
      id: Math.random(),
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 12 + 4,
      life: 1,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  useEffect(() => {
    if (particles.length > 0) {
      const timer = setInterval(() => {
        setParticles((prev) =>
          prev
            .map((p) => ({
              ...p,
              x: p.x + Math.cos(p.angle) * p.speed,
              y: p.y + Math.sin(p.angle) * p.speed,
              life: p.life - 0.02,
            }))
            .filter((p) => p.life > 0)
        );
      }, 16);
      return () => clearInterval(timer);
    }
  }, [particles]);

  useEffect(() => {
    if (isPlaying && Math.random() < 0.15) {
      const powerUpType = Math.random() < 0.5 ? "freeze" : "multiply";
      const newPowerUp = {
        id: Date.now(),
        type: powerUpType,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      };
      setPowerUps((prev) => [...prev, newPowerUp]);
      setTimeout(() => {
        setPowerUps((prev) => prev.filter((p) => p.id !== newPowerUp.id));
      }, 4000);
    }
  }, [timeLeft, isPlaying]);

  const handlePenalty = useCallback(() => {
    if (isPlaying) {
      setScore((prev) => Math.max(0, prev - 1));
      setCombo(0);
      setStreak(0);
      setPenaltyPosition(getRandomPosition());
    }
  }, [isPlaying]);

  const handleTap = useCallback(
    (e) => {
      if (isPlaying) {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastClickTime;

        if (timeDiff < 500) {
          setStreak((prev) => prev + 1);
          if (streak > 5) {
            setScore((prev) => prev + Math.floor(streak / 2));
          }
        } else {
          setStreak(0);
        }

        setLastClickTime(currentTime);

        const rect = e.target.getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

        const basePoints = powerUpActive ? 2 : 1;
        const streakBonus = streak > 5 ? Math.floor(streak / 5) : 0;
        const totalPoints = (basePoints + streakBonus) * multiplier;

        setScore((prev) => prev + totalPoints);
        setCombo((prev) => prev + 1);

        if (combo > 0 && combo % 8 === 0) {
          setPowerUpActive(true);
          setTimeout(() => setPowerUpActive(false), 3000);
        }

        if (score > 0 && score % 12 === 0) {
          setLevel((prev) => prev + 1);
          setTargetSize((prev) => Math.max(prev - 4, 35));
          setTimeLeft((prev) => prev + 3);
        }

        setPosition(getRandomPosition());
        setPenaltyPosition(getRandomPosition());
      }
    },
    [isPlaying, combo, score, powerUpActive, multiplier, streak, lastClickTime]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B3B] via-[#4B0082] to-[#000066] flex flex-col items-center p-4 font-roboto relative overflow-hidden">
      <div className="fixed top-0 left-0 right-0 bg-[#000033]/50 backdrop-blur-sm p-4 flex justify-between items-center z-10">
        <div className="flex gap-4 items-center">
          <div className="text-[#FF00FF] text-2xl">Score: {score}</div>
          <div className="text-[#00FFFF] text-2xl">{timeLeft}s</div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-[#FFFF00] text-xl">Level {level}</div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-[#FFFFFF] text-xl"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#4169E1] to-[#9370DB]"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.life,
            transform: `scale(${particle.life})`,
            filter: `blur(${(1 - particle.life) * 2}px)`,
          }}
        />
      ))}

      {powerUps.map((powerUp) => (
        <div
          key={powerUp.id}
          className="absolute cursor-pointer transition-transform hover:scale-110 text-2xl"
          style={{
            left: `${powerUp.x}%`,
            top: `${powerUp.y}%`,
          }}
          onClick={() => {
            if (powerUp.type === "freeze") {
              setTimeLeft((prev) => prev + 5);
            } else {
              setMultiplier(2);
              setTimeout(() => setMultiplier(1), 5000);
            }
            setPowerUps((prev) => prev.filter((p) => p.id !== powerUp.id));
          }}
        >
          {powerUp.type === "freeze" ? "⌛" : "✨"}
        </div>
      ))}

      {isPlaying ? (
        <div className="w-full h-full flex items-center justify-center">
          <img
            onClick={handleTap}
            src="https://ucarecdn.com/10a4d823-a829-488e-a41b-61244c1b8792/-/format/auto/"
            alt="Tappable cat with cone"
            style={{
              position: "absolute",
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) rotate(${
                Math.sin(Date.now() / 1000) * 10
              }deg)`,
              width: `${targetSize}px`,
              height: `${targetSize}px`,
              transition: "all 0.2s ease-out",
            }}
            className={`object-cover rounded-full transition-all duration-200 active:scale-90 hover:scale-105 border-4 border-[#0066FF] shadow-[0_0_40px_#0066FF]`}
          />
          <img
            onClick={handlePenalty}
            src="https://ucarecdn.com/f0365d1b-5bc7-403c-8bc5-b1a5abbd8263/-/format/auto/"
            alt="Penalty cat"
            style={{
              position: "absolute",
              left: `${penaltyPosition.x}%`,
              top: `${penaltyPosition.y}%`,
              transform: `translate(-50%, -50%)`,
              width: `${targetSize}px`,
              height: `${targetSize}px`,
              transition: "all 0.2s ease-out",
            }}
            className="object-cover rounded-full transition-all duration-200 active:scale-90 hover:scale-105 border-4 border-[#0066FF] shadow-[0_0_40px_#0066FF]"
          />
        </div>
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h1 className="text-[#4169E1] text-6xl mb-8 animate-pulse">
              NeoTap
            </h1>
            <button
              onClick={startGame}
              className="w-[200px] h-[200px] rounded-full bg-[#0B0B3B] border-4 border-[#9370DB] shadow-[0_0_30px_#9370DB] hover:shadow-[0_0_50px_#9370DB] transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-[#4169E1] text-2xl">Play</span>
            </button>
            <div className="mt-8 text-[#9370DB] text-xl">
              Best Score: {bestScore}
            </div>
          </div>
        </div>
      )}

      {combo > 0 && (
        <div
          className="fixed bottom-16 text-[#FF00FF] text-2xl animate-bounce"
          style={{
            filter: `brightness(${1 + combo * 0.1})`,
          }}
        >
          {combo}x Combo!
          {combo >= 10 && "🔥"}
        </div>
      )}

      {powerUpActive && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 text-[#FFFF00] text-xl animate-pulse">
          Double Points! ⚡
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center">
          <div className="bg-[#0B0B3B] p-8 rounded-xl border-4 border-[#9370DB] shadow-[0_0_30px_#9370DB]">
            <h2 className="text-[#4169E1] text-4xl mb-4">Game Over!</h2>
            <p className="text-[#FFFFFF] text-xl mb-2">Score: {score}</p>
            <p className="text-[#FFFFFF] text-xl mb-4">Best: {bestScore}</p>
            <button
              onClick={() => {
                setShowModal(false);
                startGame();
              }}
              className="bg-[#4169E1] text-white px-6 py-3 rounded-full hover:bg-[#9370DB] transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {streak > 5 && (
        <div className="fixed bottom-28 text-[#FFA500] text-xl animate-pulse">
          Speed Bonus: x{Math.floor(streak / 5)}! 🚀
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 0.7;
            transform: scale(0.98);
            filter: hue-rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
            filter: hue-rotate(180deg);
          }
          100% {
            opacity: 0.7;
            transform: scale(0.98);
            filter: hue-rotate(360deg);
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}

export default MainComponent;
