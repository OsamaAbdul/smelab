import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Building2, TrendingUp } from "lucide-react";

interface IphoneMockupProps {
    screenContent?: React.ReactNode;
    isAnalyzing?: boolean;
    result?: { name: string; slogan: string; score: number } | null;
}

const IphoneMockup: React.FC<IphoneMockupProps> = ({ isAnalyzing, result }) => {
    return (
        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
            <div className="w-[148px] h-[18px] bg-black top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-zinc-950 dark:bg-zinc-950 relative">
                {/* Dynamic Island Area */}
                <div className="absolute top-0 w-full h-8 bg-black z-10 flex justify-center items-end pb-1">
                    {/* Camera dot hidden in notch */}
                </div>

                {/* Screen Content */}
                <div className="flex flex-col h-full w-full text-white pt-10 px-4 relative">
                    {/* Status Bar Mock */}
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-4 px-2">
                        <span>0:00 O'CLOCK</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-2.5 bg-gray-600 rounded-[1px]"></div>
                            <div className="w-3 h-2.5 bg-gray-600 rounded-[1px]"></div>
                            <div className="w-5 h-2.5 bg-gray-500 rounded-[2px] border border-gray-600"></div>
                        </div>
                    </div>

                    {/* Dynamic Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
                        {!isAnalyzing && !result && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full space-y-4 text-center"
                            >
                                <h3 className="text-xl font-bold">SME LAB</h3>
                                <p className="text-gray-500 text-sm px-4">Ready to launch your empire?</p>

                                <div className="w-full bg-zinc-900 rounded-xl p-3 mt-8 border border-white/5">
                                    <div className="h-2 w-2/3 bg-zinc-800 rounded mb-2"></div>
                                    <div className="h-2 w-1/2 bg-zinc-800 rounded"></div>
                                </div>
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <div className="flex flex-col items-center justify-center h-full space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-sme-orange/20 rounded-full blur-xl animate-pulse"></div>
                                    <Loader2 className="w-12 h-12 text-sme-orange animate-spin relative z-10" />
                                </div>
                                <p className="text-sm font-medium animate-pulse text-gray-300">Analyzing Market Data...</p>

                                <div className="w-full space-y-2 px-4">
                                    <motion.div
                                        className="h-1 bg-zinc-800 rounded-full overflow-hidden"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <div className="h-full bg-sme-orange w-1/2"></div>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {result && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="bg-gradient-to-br from-zinc-900 to-black p-5 rounded-3xl border border-white/10 shadow-2xl text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-sme-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-sme-orange to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-3 text-2xl font-bold">
                                        {result.name.charAt(0)}
                                    </div>
                                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">{result.name}</h2>
                                    <p className="text-xs text-sme-orange uppercase tracking-widest font-semibold mt-1">Brand Identity</p>
                                </div>

                                <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-2 tracking-wider">Slogan</p>
                                    <p className="text-sm font-medium text-white leading-relaxed">"{result.slogan}"</p>
                                </div>

                                <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/5 backdrop-blur-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase font-bold mb-1 tracking-wider">Potential</p>
                                        <div className="flex items-center gap-1 text-green-500">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="text-sm font-bold">High Demand</span>
                                        </div>
                                    </div>
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            <path className="text-sme-orange" strokeDasharray={`${result.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                        <span className="absolute text-xs font-bold">{result.score}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <button className="w-full py-2 bg-white text-black rounded-xl font-bold text-sm shadow-lg hover:bg-gray-200 transition-colors">
                                        Register Now
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-white rounded-full opacity-50"></div>
                </div>
            </div>
        </div>
    );
};

export default IphoneMockup;
