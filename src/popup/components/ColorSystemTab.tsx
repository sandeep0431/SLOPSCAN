import React, { useState } from 'react';
import { ColorSystemAnalysis } from '../../types/index.ts';
import { Palette, ShieldCheck, Check, Copy, AlertTriangle, Layers } from 'lucide-react';

interface ColorSystemTabProps {
  colorSystem: ColorSystemAnalysis;
}

export const ColorSystemTab: React.FC<ColorSystemTabProps> = ({ colorSystem }) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const { productContext, likelyBrandColors, distribution, recommendations } = colorSystem;
  const { establish, preserve, reduceOrRemove, rules } = recommendations;

  const handleCopy = async (tokenName: string, value: string) => {
    try {
      await navigator.clipboard.writeText(`${tokenName}: ${value};`);
      setCopiedToken(tokenName);
      setTimeout(() => setCopiedToken(null), 1800);
    } catch (err) {
      console.error(err);
    }
  };

  const primaryBrand = likelyBrandColors[0];

  return (
    <div className="p-3.5 space-y-3.5 select-none">
      {/* 1. Context Archetype & Brand Identity Header */}
      <div className="bg-surface border border-border rounded-lg p-3.5 shadow-card space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-content-primary">
            <Palette size={14} className="text-cyan-400" />
            <span>Product Archetype</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent-light border border-accent/40">
            {productContext}
          </span>
        </div>

        {primaryBrand && (
          <div className="flex items-center justify-between p-2.5 bg-surface-inset border border-border-subtle rounded-md">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-md border border-white/20 shadow-xs shrink-0"
                style={{ backgroundColor: primaryBrand.normalizedHex }}
              />
              <div>
                <div className="text-[11px] font-bold text-content-primary flex items-center gap-1.5">
                  <span>Preserved Brand Accent</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-semibold">
                    PROTECTED
                  </span>
                </div>
                <div className="text-[10px] font-mono text-content-muted">
                  {primaryBrand.normalizedHex} • {primaryBrand.role}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopy('--color-primary', primaryBrand.normalizedHex)}
              className="text-[10px] font-mono px-2 py-1 rounded-xs bg-surface-raised hover:bg-surface-overlay text-content-secondary hover:text-content-primary border border-border flex items-center gap-1 transition-colors"
            >
              {copiedToken === '--color-primary' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
              <span>{copiedToken === '--color-primary' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Color Balance & Surface Distribution */}
      <div className="bg-surface border border-border rounded-lg p-3.5 shadow-card space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-content-primary">
          <div className="flex items-center gap-1.5">
            <Layers size={13} className="text-content-muted" />
            <span>Surface Chroma Balance (60-30-10)</span>
          </div>
          <span className="text-[10px] font-mono text-content-secondary">
            {distribution.assessment.neutral} Foundation
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2.5 w-full bg-surface-inset rounded-full overflow-hidden flex border border-border-subtle">
          <div
            className="bg-slate-500 h-full"
            style={{ width: `${distribution.neutralPercentage}%` }}
            title={`Neutral: ${distribution.neutralPercentage}%`}
          />
          <div
            className="bg-cyan-500 h-full"
            style={{ width: `${distribution.accentPercentage}%` }}
            title={`Accent: ${distribution.accentPercentage}%`}
          />
          <div
            className="bg-purple-500 h-full"
            style={{ width: `${distribution.decorativePercentage}%` }}
            title={`Decorative: ${distribution.decorativePercentage}%`}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-content-muted pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span> Neutral {distribution.neutralPercentage}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Accent {distribution.accentPercentage}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Deco {distribution.decorativePercentage}%
          </span>
        </div>
      </div>

      {/* 3. Established Semantic Tokens */}
      <div className="bg-surface border border-border rounded-lg p-3.5 shadow-card space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-content-primary">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Standardized Semantic Tokens</span>
          </div>
          <span className="text-[10px] font-mono text-content-muted">CSS Variables</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
          {[
            { name: '--canvas', val: establish.canvas, label: 'Base Canvas' },
            { name: '--surface', val: establish.surface, label: 'Card Surface' },
            { name: '--surface-raised', val: establish.surfaceRaised, label: 'Raised Surface' },
            { name: '--border', val: establish.border, label: 'Structure Border' },
            { name: '--text-primary', val: establish.textPrimary, label: 'Primary Copy' },
            { name: '--text-secondary', val: establish.textSecondary, label: 'Subtitles' },
            { name: '--text-muted', val: establish.textMuted, label: 'Muted Captions' },
            { name: '--color-primary', val: establish.primaryAccent, label: 'Brand CTA' },
            { name: '--color-success', val: establish.success, label: 'Success Tag' },
            { name: '--color-error', val: establish.error, label: 'Error/Destructive' },
          ].map((token) => (
            <div
              key={token.name}
              onClick={() => handleCopy(token.name, token.val)}
              className="flex items-center justify-between p-2 bg-surface-inset border border-border-subtle rounded-md hover:border-border-strong cursor-pointer transition-all group"
              title="Click to copy CSS token"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-3.5 h-3.5 rounded-xs border border-white/20 shrink-0"
                  style={{ backgroundColor: token.val }}
                />
                <div className="truncate">
                  <div className="font-semibold text-content-primary group-hover:text-cyan-300 truncate">
                    {token.name}
                  </div>
                  <div className="text-[9px] text-content-muted truncate">{token.val}</div>
                </div>
              </div>
              {copiedToken === token.name ? (
                <Check size={11} className="text-emerald-400 shrink-0" />
              ) : (
                <Copy size={11} className="text-content-muted opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Preserve vs Reduce Guidelines */}
      <div className="bg-surface border border-border rounded-lg p-3.5 shadow-card space-y-2">
        <div className="text-xs font-bold text-content-primary">
          Design Discipline Guidance
        </div>

        {preserve.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
              Preserve
            </div>
            {preserve.map((p, idx) => (
              <div key={idx} className="text-[11px] text-content-secondary leading-normal flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        )}

        {reduceOrRemove.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-border-subtle">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <AlertTriangle size={10} />
              <span>Reduce or Remove</span>
            </div>
            {reduceOrRemove.map((r, idx) => (
              <div key={idx} className="text-[11px] text-content-secondary leading-normal flex items-start gap-1.5">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {rules.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-border-subtle">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
              Color Guardrails
            </div>
            {rules.map((rule, idx) => (
              <div key={idx} className="text-[11px] text-content-secondary leading-normal flex items-start gap-1.5">
                <span className="text-cyan-400 font-mono text-[10px] shrink-0">{idx + 1}.</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
