import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Layers, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  retryCount: number;
}

export default class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MapErrorBoundary] Map component encountered an error:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  componentDidMount() {
    // Expose dev test trigger to window for testing the error boundary safely
    if (typeof window !== 'undefined') {
      (window as any).__triggerMapError = (customMsg?: string) => {
        this.setState({
          hasError: true,
          error: new Error(customMsg || '模拟三维地图WebGL或网络渲染异常 (测试独立错误边界)'),
          errorInfo: null
        });
      };
    }
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: prev.retryCount + 1
    }));
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, showDetails, retryCount } = this.state;
      const errorMessage = error?.message || '地图服务或三维渲染引擎加载异常';

      return (
        <div className={`relative w-full h-full min-h-[300px] flex items-center justify-center p-6 bg-slate-900/90 text-slate-100 overflow-hidden select-none ${this.props.className || ''}`}>
          {/* Background subtle radar/grid pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-950/80 pointer-events-none" />

          {/* Central Alert Card */}
          <div className="relative z-10 max-w-lg w-full bg-slate-800/95 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>错误已由独立边界隔离 · 系统其他模块正常运行</span>
            </div>

            {/* Error Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">
              三维雷达地图加载异常
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mb-5">
              地图底图服务或 WebGL 3D 渲染上下文初始化未完成。系统已自动限制该异常扩散，<span className="text-sky-300 font-medium">左右业务面板、作业控制、历史统计及底部预报时间轴</span>均可继续正常操作。
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full justify-center mb-4">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                重新尝试加载地图 {retryCount > 0 ? `(第 ${retryCount} 次)` : ''}
              </button>
              <button
                type="button"
                onClick={this.toggleDetails}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-600/50 transition-colors cursor-pointer"
              >
                <span>技术详情</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Technical Details Accordion */}
            {showDetails && (
              <div className="w-full text-left bg-slate-950/80 border border-slate-800 rounded-xl p-3 mt-1 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-40 scrollbar-thin">
                <div className="text-red-400 font-semibold mb-1">
                  Error: {errorMessage}
                </div>
                {error?.stack && (
                  <pre className="whitespace-pre-wrap text-[10px] text-slate-500 leading-tight">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Diagnostics hint */}
            <div className="w-full pt-4 mt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>建议检查浏览器硬件加速或底图网络</span>
              </div>
              <span className="text-slate-500">GIS Engine v5.24</span>
            </div>
          </div>
        </div>
      );
    }

    // Render children wrapped with an inner key based on retryCount so retry forces remount
    return (
      <React.Fragment key={this.state.retryCount}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
