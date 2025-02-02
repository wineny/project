import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCanvasConfetti from 'react-canvas-confetti';
import { Heart, Plus, X, Shuffle, UserPlus, Sparkles } from 'lucide-react';

type Person = {
  id: string;
  name: string;
};

type Match = {
  person1: Person;
  person2?: Person; // Optional for solo case
  score?: number;
  reason?: string;
  isSolo?: boolean;
};

const getRandomScore = (): number => {
  return Math.floor(Math.random() * 111);
};

const getCompatibilityReason = (score: number): string => {
  if (score > 90) {
    return [
      "둘 다 라면 스프 버리고 먹는 환경운동가 스타일이에요! 🌱 🍜",
      "편의점 삼각김밥을 한 입에 넣는 식사 스타일이 똑같네요! 🍙 👄",
      "둘 다 카페에서 자리 맡고 화장실 가는 불법 커플이에요 😈 ☕",
      "넷플릭스 시청 중 잠들어서 '보고 계신가요?' 메시지만 보는 사이 😴 📺",
      "배달음식 리뷰에 '맛있게 잘 먹었습니다'만 쓰는 귀차니즘 커플 🍽️ ✍️"
    ][Math.floor(Math.random() * 5)];
  } else if (score > 70) {
    return [
      "양말 한쪽씩 모아두면 언젠가 나타날 거란 믿음이 있는 사이 🧦 ✨",
      "둘 다 빨래를 1주일째 널어두고 안 개는 영혼의 단짝이네요 👕 🎭",
      "카톡 안 읽씹하고 카톡창만 들어가서 프사만 보는 텔레파시 커플 📱 🔮",
      "인스타 스토리 업로드하고 바로 삭제하는 겁쟁이 케미스트리 📸 🙈",
      "버스에서 이어폰 없는 걸 깨닫고 음악 없이 버티는 강심장들 🎧 💪"
    ][Math.floor(Math.random() * 5)];
  } else if (score > 40) {
    return [
      "한 명은 카톡 알림음 켜놓고 한 명은 무음... 답답한 조합 🔔 🔕",
      "한 명은 쇼핑 전에 리뷰 정독, 한 명은 즉흥구매... 힘내세요 📝 🛍️",
      "한 명은 넷플릭스 정주행러, 한 명은 지루하면 건너뛰기... 어려운 사이 ⏩ ⏸️",
      "한 명은 음식 먹기 전 사진찍고, 한 명은 바로 먹기 시작... 불편해요 📸 🍽️",
      "한 명은 이모티콘 수집가, 한 명은 텍스트만 보내는 채팅 부조화 😊 📝"
    ][Math.floor(Math.random() * 5)];
  } else {
    return [
      "한 명은 카페인 중독, 한 명은 디카페인... 최악의 조합이에요 ☕ 🚫",
      "한 명은 음식 섞어먹기, 한 명은 따로먹기... 식사가 전쟁이네요 🥘 ⚔️",
      "한 명은 여행 계획러, 한 명은 즉흥여행러... 여행은 포기하세요 📅 🎲",
      "한 명은 에어컨 강풍, 한 명은 선풍기 미풍... 온도 전쟁 예약 ❄️ 💨",
      "한 명은 아침형 인간, 한 명은 올빼미... 연락 타이밍 절대 안 맞음 🌅 🦉"
    ][Math.floor(Math.random() * 5)];
  }
};

function App() {
  const [newName, setNewName] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showSparkles, setShowSparkles] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  
  const confettiRef = useRef<any>(null);

  const getInstance = useCallback((instance: any) => {
    confettiRef.current = instance;
  }, []);

  const makeShot = useCallback(() => {
    if (confettiRef.current) {
      confettiRef.current({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, []);

  const addPerson = () => {
    if (newName.trim()) {
      setPeople([...people, { id: Date.now().toString(), name: newName.trim() }]);
      setNewName('');
    }
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPerson();
    }
  };

  const toggleCard = (index: number) => {
    const newFlippedCards = new Set(flippedCards);
    const cardElement = document.querySelector(`[data-card-index="${index}"]`);
    const rect = cardElement?.getBoundingClientRect();
    
    if (flippedCards.has(index)) {
      newFlippedCards.delete(index);
    } else {
      newFlippedCards.add(index);
      if (!matches[index].isSolo && rect) {
        setSparklePosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 2000);
      }
    }
    setFlippedCards(newFlippedCards);
  };

  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });

  const createRandomMatches = () => {
    if (people.length < 2) return;

    const shuffledPeople = [...people].sort(() => Math.random() - 0.5);
    const newMatches: Match[] = [];
    setFlippedCards(new Set()); // Reset flipped cards

    for (let i = 0; i < shuffledPeople.length - 1; i += 2) {
      const person1 = shuffledPeople[i];
      const person2 = shuffledPeople[i + 1];
      if (person2) {
        const score = getRandomScore();
        newMatches.push({
          person1,
          person2,
          score,
          reason: getCompatibilityReason(score)
        });
      }
    }

    // Handle the last person if odd number
    if (shuffledPeople.length % 2 !== 0) {
      const lastPerson = shuffledPeople[shuffledPeople.length - 1];
      newMatches.push({
        person1: lastPerson,
        isSolo: true
      });
    }

    setMatches(newMatches);
  };

  return (
    <div className="min-h-screen bg-[#FFD1DC] overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute w-64 h-64 bg-[#FFB6C1] rounded-full -top-20 -left-20 blur-3xl opacity-50"></div>
        <div className="absolute w-64 h-64 bg-[#87CEEB] rounded-full top-40 -right-20 blur-3xl opacity-50"></div>
        <div className="absolute w-64 h-64 bg-[#98FB98] rounded-full bottom-20 left-40 blur-3xl opacity-50"></div>
      </div>

      <AnimatePresence>
        {showSparkles && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1.2, 1.4, 1.8],
              y: [-20, -40, -60, -100]
            }}
            transition={{ 
              duration: 2,
              times: [0, 0.2, 0.8, 1],
              ease: "easeOut"
            }}
            style={{
              position: 'fixed',
              left: sparklePosition.x,
              top: sparklePosition.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
              pointerEvents: 'none'
            }}
          >
            <div className="flex items-center justify-center gap-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    y: [0, -10, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="text-[#FF1493]"
                >
                  <Sparkles size={24} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-8"
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              y: [0, -5, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-[#FF69B4]">
              <path d="M50,15c-19.33,0-35,15.67-35,35s15.67,35,35,35s35-15.67,35-35S69.33,15,50,15z M36,45 c1.66,0,3,1.34,3,3s-1.34,3-3,3s-3-1.34-3-3S34.34,45,36,45z M64,45c1.66,0,3,1.34,3,3s-1.34,3-3,3s-3-1.34-3-3S62.34,45,64,45z M50,70 c-8.27,0-15-6.73-15-15h30C65,63.27,58.27,70,50,70z"/>
              <motion.g
                animate={{
                  rotateZ: [0, 15, 0],
                  y: [0, -1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <path d="M35,25c0,0-10-8-20,0c-10,8,0,20,0,20S45,33,35,25z"/>
                <path d="M65,25c0,0,10-8,20,0c10,8,0,20,0,20S55,33,65,25z"/>
              </motion.g>
            </svg>
          </motion.div>

          <h1 className="text-6xl font-black text-center mb-4 text-[#FF1493]" style={{ textShadow: '3px 3px 0px #FFB6C1' }}>
            Random Match
          </h1>
          <p className="text-center text-[#FF69B4] mb-12 text-xl font-medium">두근두근 궁합 매칭</p>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(255,105,180,0.3)] border-4 border-[#FFB6C1] mb-12">
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="이름을 입력하세요"
                className="flex-1 px-6 py-4 rounded-2xl bg-white border-2 border-[#FFB6C1] outline-none text-[#FF69B4] placeholder-[#FFB6C1] focus:border-[#FF1493] transition-all text-lg"
              />
              <button
                onClick={addPerson}
                className="p-4 rounded-2xl bg-[#FF69B4] hover:bg-[#FF1493] transition-all duration-200 shadow-lg hover:shadow-[0_10px_20px_rgba(255,105,180,0.3)] transform hover:-translate-y-1"
              >
                <UserPlus className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {people.map(person => (
                <motion.div
                  key={person.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="px-4 py-2 bg-white rounded-full flex items-center gap-2 border-2 border-[#FFB6C1] shadow-lg"
                >
                  <span className="text-[#FF69B4] font-medium">{person.name}</span>
                  <button
                    onClick={() => removePerson(person.id)}
                    className="text-[#FFB6C1] hover:text-[#FF1493] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            <button
              onClick={createRandomMatches}
              disabled={people.length < 2}
              className={`w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white shadow-lg 
                hover:shadow-[0_10px_20px_rgba(255,105,180,0.3)] transform hover:-translate-y-1 transition-all duration-200
                ${people.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Shuffle className="mr-2 inline-block" />
              매칭 시작하기
            </button>
          </div>

          <AnimatePresence>
            {matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-8 md:grid-cols-2 auto-rows-fr"
              >
                {matches.map((match, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => toggleCard(index)}
                    className="cursor-pointer h-full relative"
                    style={{ perspective: "1000px", minHeight: "250px" }}
                    data-card-index={index}
                  >
                    <motion.div
                      animate={{ rotateX: flippedCards.has(index) ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative w-full h-full"
                    >
                      {/* Front of card */}
                      <div
                        className={`absolute inset-0 w-full h-full bg-white/90 backdrop-blur-md p-8 rounded-[2rem] 
                          shadow-[0_20px_50px_rgba(255,105,180,0.2)] border-4 border-[#FFB6C1]
                          ${flippedCards.has(index) ? 'opacity-0' : 'opacity-100'}`}
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="flex items-center justify-center gap-4 p-6 h-full">
                          {match.isSolo ? (
                            <div className="text-2xl font-bold text-[#FF69B4]">{match.person1.name}</div>
                          ) : (
                            <div className="flex items-center justify-center gap-4">
                              <div className="text-2xl font-bold text-[#FF69B4]">{match.person1.name}</div>
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  rotate: [0, 10, -10, 0]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <Heart className="w-8 h-8 text-[#FF1493]" />
                              </motion.div>
                              <div className="text-2xl font-bold text-[#FF69B4]">{match.person2?.name}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Back of card */}
                      <div
                        className={`absolute inset-0 w-full h-full bg-white/90 backdrop-blur-md p-8 rounded-[2rem] 
                          shadow-[0_20px_50px_rgba(255,105,180,0.2)] border-4 border-[#FFB6C1]
                          ${!flippedCards.has(index) ? 'opacity-0' : 'opacity-100'}`}
                        style={{ 
                          backfaceVisibility: "hidden",
                          transform: "rotateX(180deg)"
                        }}
                      >
                        {match.isSolo ? (
                          <div className="flex flex-col items-center justify-center p-6 h-full gap-4">
                            <span className="text-xl text-center font-bold text-[#FF69B4]">
                              {match.person1.name}는(은) 오늘 솔로입니다
                            </span>
                            <span className="text-[#FF69B4]/70">다음 매칭을 기다려주세요!</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 h-full gap-4">
                            <div className="text-5xl font-black" style={{ color: '#FF1493', textShadow: '2px 2px 0px #FFB6C1' }}>
                              {match.score}%
                            </div>
                            <p className="text-center text-[#FF69B4] text-lg">
                              {match.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <ReactCanvasConfetti
        ref={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 50
        }}
      />

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .card {
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }
        :root {
          background: linear-gradient(180deg, #FFE4E9 0%, #FFF5F7 50%, #FFFFFF 100%);
        }
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .floating {
          animation: floating 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;