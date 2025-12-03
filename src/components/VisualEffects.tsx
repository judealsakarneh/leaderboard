import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

// Deterministic seed-based random for consistent values
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Fire effect for elite retention performers (5+ retains)
export const FireEffect: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const flames = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: (i / 12) * 100,
      delay: i * 0.08,
      duration: 0.6 + seededRandom(i * 123) * 0.4,
    })), []
  );
  
  return (
    <div className="fire-effect-container">
      {flames.map((flame) => (
        <motion.div
          key={flame.id}
          className="flame"
          style={{
            left: `${flame.left}%`,
            animationDelay: `${flame.delay}s`,
          }}
          animate={{
            y: [0, -20 * intensity, -10 * intensity, -25 * intensity, 0],
            opacity: [0.7, 1, 0.8, 1, 0.7],
            scaleY: [1, 1.3, 1.1, 1.4, 1],
          }}
          transition={{
            duration: flame.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Lightning effect for elite NSF performers (10+ NSF)
export const LightningEffect: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const [flash, setFlash] = useState(false);
  const intervalDuration = useMemo(() => 1500 + seededRandom(42) * 2000, []);
  const flashDuration = useMemo(() => 100 + seededRandom(84) * 100, []);

  useEffect(() => {
    const flashInterval = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), flashDuration);
    }, intervalDuration);
    
    return () => clearInterval(flashInterval);
  }, [intervalDuration, flashDuration]);

  return (
    <div className="lightning-effect-container">
      <AnimatePresence>
        {flash && (
          <motion.div
            className="lightning-bolt"
            initial={{ opacity: 0, scaleY: 0.5 }}
            animate={{ opacity: intensity, scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>
      <div className="electric-arc" style={{ opacity: 0.3 + intensity * 0.4 }} />
    </div>
  );
};

// Celebration burst when someone gets +1
export const CelebrationBurst: React.FC<{ agentName: string; department: string; onComplete?: () => void }> = ({
  agentName,
  department,
  onComplete,
}) => {
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      angle: (i / 20) * 360,
      distance: 80 + seededRandom(i * 17) * 60,
      size: 4 + seededRandom(i * 31) * 8,
      delay: seededRandom(i * 47) * 0.2,
    })), []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="celebration-burst"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
    >
      <div className="celebration-center">
        <motion.div
          className="celebration-ring"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className={`celebration-badge ${department}`}>
          <span className="celebration-name">{agentName}</span>
          <span className="celebration-action">+1 {department === "retention" ? "RETAIN" : "NSF"}</span>
        </div>
      </div>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`celebration-particle ${department}`}
          style={{ width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{
            duration: 0.8,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
};

// Jackpot/Slots effect
export const SlotsEffect: React.FC<{ score: number; agentName: string }> = ({ score, agentName }) => {
  const [spinning, setSpinning] = useState(true);
  const [revealed, setRevealed] = useState([false, false, false]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealed([true, false, false]), 800),
      setTimeout(() => setRevealed([true, true, false]), 1200),
      setTimeout(() => setRevealed([true, true, true]), 1600),
      setTimeout(() => setSpinning(false), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="slots-effect"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <div className="slots-machine">
        <div className="slots-header">🎰 JACKPOT! 🎰</div>
        <div className="slots-reels">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`slot-reel ${revealed[i] ? "revealed" : spinning ? "spinning" : ""}`}>
              {revealed[i] ? (
                <span className="slot-symbol">⭐</span>
              ) : (
                <span className="slot-blur">?</span>
              )}
            </div>
          ))}
        </div>
        <motion.div
          className="slots-result"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={!spinning ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <span className="slots-name">{agentName}</span>
          <span className="slots-score">{score} ACHIEVED!</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Bowling strike effect
export const BowlingStrikeEffect: React.FC<{ agentName: string }> = ({ agentName }) => {
  const pins = useMemo(() => 
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      rotate: -30 + seededRandom(i * 11) * 60,
      xMove: 30 + seededRandom(i * 23) * 40,
      yMove: -20 + seededRandom(i * 37) * 40,
    })), []
  );

  return (
    <motion.div
      className="bowling-effect"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bowling-lane">
        <motion.div
          className="bowling-ball"
          initial={{ x: -200, y: 0 }}
          animate={{ x: 100, y: 0 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
        />
        <div className="bowling-pins">
          {pins.map((pin) => (
            <motion.div
              key={pin.id}
              className="bowling-pin"
              initial={{ rotate: 0, opacity: 1 }}
              animate={{
                rotate: [0, pin.rotate],
                x: [-5, pin.xMove],
                y: [0, pin.yMove],
                opacity: [1, 0],
              }}
              transition={{
                duration: 0.5,
                delay: 0.6 + pin.id * 0.05,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      </div>
      <motion.div
        className="bowling-strike-text"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <span>STRIKE!</span>
        <span className="bowling-name">{agentName}</span>
      </motion.div>
    </motion.div>
  );
};

// Volcano eruption effect
export const VolcanoEffect: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const lavaDrops = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: -50 + seededRandom(i * 13) * 100,
      height: 80 + seededRandom(i * 29) * 120 * intensity,
      delay: seededRandom(i * 41) * 0.5,
      size: 8 + seededRandom(i * 53) * 12,
      duration: 1.5 + seededRandom(i * 67) * 0.5,
      repeatDelay: seededRandom(i * 79) * 0.5,
    })), [intensity]
  );

  return (
    <div className="volcano-effect-container">
      <div className="volcano-base" />
      <div className="volcano-glow" style={{ opacity: 0.5 + intensity * 0.3 }} />
      {lavaDrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="lava-drop"
          style={{
            left: `calc(50% + ${drop.x}px)`,
            width: drop.size,
            height: drop.size,
          }}
          animate={{
            y: [0, -drop.height, -drop.height * 0.3, 0],
            x: [0, drop.x * 0.5, drop.x, drop.x * 1.5],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 0.8, 0.3],
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            repeatDelay: drop.repeatDelay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Thunder background effect for theme
export const ThunderBackground: React.FC = () => {
  const { theme } = useTheme();
  const [flash, setFlash] = useState(false);
  const intervalDuration = useMemo(() => 4000 + seededRandom(123) * 6000, []);

  useEffect(() => {
    if (theme !== "thunder") return;
    
    const flashInterval = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }, intervalDuration);
    
    return () => clearInterval(flashInterval);
  }, [theme, intervalDuration]);

  if (theme !== "thunder") return null;

  return (
    <>
      <AnimatePresence>
        {flash && (
          <motion.div
            className="thunder-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
          />
        )}
      </AnimatePresence>
      <div className="thunder-clouds" />
    </>
  );
};

// Volcano background for theme
export const VolcanoBackground: React.FC = () => {
  const { theme } = useTheme();
  
  const embers = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: seededRandom(i * 17) * 100,
      xMove: seededRandom(i * 23) * 100 - 50,
      duration: 3 + seededRandom(i * 31) * 4,
      delay: seededRandom(i * 43) * 5,
    })), []
  );

  if (theme !== "volcano") return null;

  return (
    <div className="volcano-background">
      <div className="lava-flow" />
      <div className="ember-particles">
        {embers.map((ember) => (
          <motion.div
            key={ember.id}
            className="ember"
            style={{
              left: `${ember.left}%`,
            }}
            animate={{
              y: [800, -50],
              opacity: [0, 1, 1, 0],
              x: [0, ember.xMove],
            }}
            transition={{
              duration: ember.duration,
              delay: ember.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Slots background for theme
export const SlotsBackground: React.FC = () => {
  const { theme } = useTheme();
  
  const lights = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: (i / 20) * 100,
      isTop: i % 2 === 0,
      duration: 0.5 + seededRandom(i * 19) * 0.5,
    })), []
  );

  if (theme !== "slots") return null;

  return (
    <div className="slots-background">
      <div className="neon-grid" />
      <div className="casino-lights">
        {lights.map((light) => (
          <motion.div
            key={light.id}
            className="casino-light"
            style={{
              left: `${light.left}%`,
              top: light.isTop ? "0" : "auto",
              bottom: !light.isTop ? "0" : "auto",
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: light.duration,
              delay: light.id * 0.1,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Bowling background for theme
export const BowlingBackground: React.FC = () => {
  const { theme } = useTheme();

  if (theme !== "bowling") return null;

  return (
    <div className="bowling-background">
      <div className="bowling-lane-bg">
        <div className="lane-arrows" />
        <div className="lane-dots" />
      </div>
    </div>
  );
};
