import type { Rule } from '../../types/index.ts';
import { R001_HueGradient, R002_GradientText, R003_ColoredGlow, R004_BlurredBlob, R005_ExcessiveAccentUsage } from './surfaces.ts';
import { R011_ArbitrarySpacing, R012_InconsistentCardPadding } from './spacing.ts';
import { R020_TooManyFontFamilies, R021_TooManyFontSizes, R023_HeavyHeadingOveruse, R024_UppercaseTrackedLabels } from './typography.ts';
import { R030_DecorativeEmoji, R032_DecorativeSparkles } from './icons.ts';
import { R040_ExcessiveExclamation, R041_GenericHypeLanguage, R042_GenericGreetingHeadline, R043_PlaceholderContent, R044_GenericAICopy } from './copy.ts';
import { R050_EverythingIsAPill, R051_InconsistentRadiusSystem } from './components.ts';
import { R060_TooManyHeroActions } from './layout.ts';
import { R070_InfiniteDecorativeAnimation, R071_LayoutAnimation } from './motion.ts';
import { COLOR_RULES } from '../color/colorRules.ts';

export const ALL_RULES: Rule[] = [
  // Surfaces
  R001_HueGradient,
  R002_GradientText,
  R003_ColoredGlow,
  R004_BlurredBlob,
  R005_ExcessiveAccentUsage,

  // Spacing
  R011_ArbitrarySpacing,
  R012_InconsistentCardPadding,

  // Typography
  R020_TooManyFontFamilies,
  R021_TooManyFontSizes,
  R023_HeavyHeadingOveruse,
  R024_UppercaseTrackedLabels,

  // Icons
  R030_DecorativeEmoji,
  R032_DecorativeSparkles,

  // Copy
  R040_ExcessiveExclamation,
  R041_GenericHypeLanguage,
  R042_GenericGreetingHeadline,
  R043_PlaceholderContent,
  R044_GenericAICopy,

  // Components
  R050_EverythingIsAPill,
  R051_InconsistentRadiusSystem,

  // Layout
  R060_TooManyHeroActions,

  // Motion
  R070_InfiniteDecorativeAnimation,
  R071_LayoutAnimation,

  // Color Intelligence
  ...COLOR_RULES,
];
