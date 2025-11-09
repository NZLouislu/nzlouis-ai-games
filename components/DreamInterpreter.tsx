import React, { useState, useEffect } from 'react';
import { Sparkles, Cloud, Sun, Loader2 } from 'lucide-react';

const TRANSLATIONS = {
  "en-US": {
    "dreamInterpreterTitle": "Dream interpreter",
    "dreamInterpreterSubtitle": "Share your dream, discover its meaning ✨",
    "dreamInputLabel": "Tell me about your dream...",
    "dreamInputPlaceholder": "Describe your dream in as much detail as you can remember... ☁️",
    "interpretingDream": "Interpreting your dream...",
    "interpretDreamButton": "Interpret dream",
    "interpretationError": "Unable to interpret your dream. Please try again.",
    "mainThemesTitle": "Main themes",
    "emotionalAtmosphereTitle": "Emotional atmosphere",
    "dreamSymbolsTitle": "Dream symbols",
    "personalInsightTitle": "Personal insight",
    "guidanceTitle": "Guidance for reflection",
    "dreamPrompt": "You are a compassionate dream interpreter with expertise in psychology, symbolism, and emotional wellness. Analyze this dream and provide a thoughtful interpretation:\n\nDream: \"{dreamText}\"\n\nPlease respond in {locale} language with a JSON object containing:\n{\n  \"mainThemes\": [\"theme1\", \"theme2\", \"theme3\"],\n  \"emotionalTone\": \"description of the emotional undertones\",\n  \"symbols\": [\n    {\"symbol\": \"symbol1\", \"meaning\": \"meaning1\"},\n    {\"symbol\": \"symbol2\", \"meaning\": \"meaning2\"}\n  ],\n  \"personalInsight\": \"deep personal insight about what this dream might mean for the dreamer\",\n  \"guidance\": \"gentle guidance for reflection or action\"\n}\n\nProvide a warm, supportive interpretation that helps the dreamer understand their subconscious messages. Focus on positive insights while acknowledging any challenging emotions."
  },
  /* LOCALE_PLACEHOLDER_START */
  "es-ES": {
    "dreamInterpreterTitle": "Intérprete de sueños",
    "dreamInterpreterSubtitle": "Comparte tu sueño, descubre su significado ✨",
    "dreamInputLabel": "Cuéntame sobre tu sueño...",
    "dreamInputPlaceholder": "Describe tu sueño con tanto detalle como puedas recordar... ☁️",
    "interpretingDream": "Interpretando tu sueño...",
    "interpretDreamButton": "Interpretar sueño",
    "interpretationError": "No se pudo interpretar tu sueño. Por favor, inténtalo de nuevo.",
    "mainThemesTitle": "Temas principales",
    "emotionalAtmosphereTitle": "Atmósfera emocional",
    "dreamSymbolsTitle": "Símbolos del sueño",
    "personalInsightTitle": "Perspectiva personal",
    "guidanceTitle": "Guía para la reflexión",
    "dreamPrompt": "Eres un intérprete de sueños compasivo con experiencia en psicología, simbolismo y bienestar emocional. Analiza este sueño y proporciona una interpretación reflexiva:\n\nSueño: \"{dreamText}\"\n\nPor favor responde en {locale} idioma con un objeto JSON que contenga:\n{\n  \"mainThemes\": [\"tema1\", \"tema2\", \"tema3\"],\n  \"emotionalTone\": \"descripción de los matices emocionales\",\n  \"symbols\": [\n    {\"symbol\": \"símbolo1\", \"meaning\": \"significado1\"},\n    {\"symbol\": \"símbolo2\", \"meaning\": \"significado2\"}\n  ],\n  \"personalInsight\": \"perspectiva personal profunda sobre lo que este sueño podría significar para el soñador\",\n  \"guidance\": \"orientación suave para la reflexión o acción\"\n}\n\nProporciona una interpretación cálida y de apoyo que ayude al soñador a entender los mensajes de su subconsciente. Enfócate en perspectivas positivas mientras reconoces cualquier emoción desafiante."
  }
  /* LOCALE_PLACEHOLDER_END */
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale: string): keyof typeof TRANSLATIONS => {
  if (locale in TRANSLATIONS) return locale as keyof typeof TRANSLATIONS;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return (match as keyof typeof TRANSLATIONS) || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key: string) => TRANSLATIONS[locale]?.[key as keyof typeof TRANSLATIONS[typeof locale]] || TRANSLATIONS['en-US'][key as keyof typeof TRANSLATIONS['en-US']] || key;

interface DreamInterpretation {
  mainThemes: string[];
  emotionalTone: string;
  symbols: Array<{ symbol: string; meaning: string }>;
  symbolicMeanings: Array<{ symbol: string; meaning: string }>;
  psychologicalInsights: string;
  personalInsight: string;
  actionableAdvice: string;
  guidance: string;
}

const DreamInterpreter = () => {
  const [dreamText, setDreamText] = useState('');
  const [interpretation, setInterpretation] = useState<DreamInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation when interpretation loads
    if (interpretation) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [interpretation]);

  const interpretDream = async () => {
    if (!dreamText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = t('dreamPrompt').replace('{dreamText}', dreamText).replace('{locale}', locale);

      const windowWithClaude = window as Window & { claude?: { complete: (prompt: string) => Promise<string> } };
      const response = await windowWithClaude.claude?.complete(prompt);
      if (response) {
        const parsedResponse = JSON.parse(response);
        setInterpretation(parsedResponse);
      }
    } catch (err) {
      setError(t('interpretationError'));
      console.error('Error interpreting dream:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      interpretDream();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-blue-900 text-white p-6 pt-12 relative overflow-hidden">
      {/* Floating clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="cloud cloud-4"></div>
        <div className="cloud cloud-5"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-light tracking-wider bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-4">
            {t('dreamInterpreterTitle')}
          </h1>
          <p className="text-purple-200 text-lg opacity-80">
            {t('dreamInterpreterSubtitle')}
          </p>
        </div>

        {/* Dream Input Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
          <div className="mb-6">
            <label className="block text-purple-200 mb-3 text-lg">
              {t('dreamInputLabel')}
            </label>
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('dreamInputPlaceholder')}
              className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 resize-none"
            />
          </div>
          
          <button
            onClick={interpretDream}
            disabled={isLoading || !dreamText.trim()}
            className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
              isLoading || !dreamText.trim()
                ? 'bg-purple-800/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
            } flex items-center justify-center space-x-2`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('interpretingDream')}</span>
              </>
            ) : (
              <span>{t('interpretDreamButton')}</span>
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Interpretation Section */}
        {interpretation && (
          <div className={`space-y-6 ${isAnimating ? 'animate-fade-in' : ''}`}>
            {/* Main Themes */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-light mb-4">
                {t('mainThemesTitle')}
              </h2>
              <div className="flex flex-wrap gap-3">
                {interpretation.mainThemes.map((theme, index) => (
                  <span 
                    key={index}
                    className="bg-purple-500/30 px-4 py-2 rounded-full text-purple-200 border border-purple-400/30"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Emotional Tone */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-light mb-4">
                {t('emotionalAtmosphereTitle')}
              </h2>
              <p className="text-blue-200 leading-relaxed">
                {interpretation.emotionalTone}
              </p>
            </div>

            {/* Symbols */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-light mb-4">
                {t('dreamSymbolsTitle')}
              </h2>
              <div className="grid gap-4">
                {interpretation.symbols.map((symbol, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-purple-500/20 p-3 rounded-lg">
                      <span className="text-purple-300 font-medium">{symbol.symbol}</span>
                    </div>
                    <p className="text-purple-200 flex-1">{symbol.meaning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Insight */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-light mb-4">
                {t('personalInsightTitle')}
              </h2>
              <p className="text-indigo-200 leading-relaxed text-lg">
                {interpretation.personalInsight}
              </p>
            </div>

            {/* Guidance */}
            <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-light mb-4">
                {t('guidanceTitle')}
              </h2>
              <p className="text-yellow-100 leading-relaxed">
                {interpretation.guidance}
              </p>
            </div>
          </div>
        )}


      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        @keyframes float-cloud {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(calc(100vw + 100%));
          }
        }

        .cloud {
          position: absolute;
          background: white;
          border-radius: 50px;
          opacity: 0.3;
          animation: float-cloud linear infinite;
        }

        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: white;
          border-radius: 50%;
        }

        .cloud-1 {
          width: 100px;
          height: 40px;
          top: 15%;
          animation-duration: 25s;
          animation-delay: -2s;
        }

        .cloud-1::before {
          width: 50px;
          height: 50px;
          top: -25px;
          left: 10px;
        }

        .cloud-1::after {
          width: 60px;
          height: 60px;
          top: -30px;
          right: 10px;
        }

        .cloud-2 {
          width: 80px;
          height: 30px;
          top: 35%;
          animation-duration: 30s;
          animation-delay: -10s;
        }

        .cloud-2::before {
          width: 40px;
          height: 40px;
          top: -20px;
          left: 10px;
        }

        .cloud-2::after {
          width: 50px;
          height: 50px;
          top: -25px;
          right: 10px;
        }

        .cloud-3 {
          width: 120px;
          height: 40px;
          top: 60%;
          animation-duration: 35s;
          animation-delay: -15s;
        }

        .cloud-3::before {
          width: 60px;
          height: 60px;
          top: -30px;
          left: 20px;
        }

        .cloud-3::after {
          width: 70px;
          height: 70px;
          top: -35px;
          right: 15px;
        }

        .cloud-4 {
          width: 90px;
          height: 35px;
          top: 75%;
          animation-duration: 28s;
          animation-delay: -5s;
        }

        .cloud-4::before {
          width: 45px;
          height: 45px;
          top: -22px;
          left: 15px;
        }

        .cloud-4::after {
          width: 55px;
          height: 55px;
          top: -27px;
          right: 10px;
        }

        .cloud-5 {
          width: 110px;
          height: 45px;
          top: 45%;
          animation-duration: 32s;
          animation-delay: -20s;
        }

        .cloud-5::before {
          width: 55px;
          height: 55px;
          top: -27px;
          left: 15px;
        }

        .cloud-5::after {
          width: 65px;
          height: 65px;
          top: -32px;
          right: 15px;
        }
      `}</style>
    </div>
  );
};

export default DreamInterpreter;
