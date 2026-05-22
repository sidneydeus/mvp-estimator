import {
  AICodeGenerationEstimate,
  AICodeGenerationPricing,
  AITokenEstimate,
  BacklogResult,
  TokenRange,
} from './IAIService';
import { env } from '../../config/env';

type BacklogWithoutAIEstimate = Omit<BacklogResult, 'aiCodeGenerationEstimate'>;

export const estimateAICodeGeneration = (
  backlog: BacklogWithoutAIEstimate,
  pricing: AICodeGenerationPricing = {
    inputCostPer1MTokens: env.AI_INPUT_COST_PER_1M_TOKENS,
    outputCostPer1MTokens: env.AI_OUTPUT_COST_PER_1M_TOKENS,
  },
): AICodeGenerationEstimate => {
  const normalizedTokenEstimate = normalizeTokenEstimate(backlog.aiTokenEstimate);
  const averagedTokenEstimate = averageTokenEstimateRanges(normalizedTokenEstimate);

  const totalInputTokens = sumValues(
    averagedTokenEstimate.planningAndContextTokens,
    averagedTokenEstimate.codeGenerationInputTokens,
    averagedTokenEstimate.validationAndFixInputTokens,
  );
  const totalOutputTokens = sumValues(
    averagedTokenEstimate.codeGenerationOutputTokens,
    averagedTokenEstimate.validationAndFixOutputTokens,
  );
  const totalTokens = totalInputTokens + totalOutputTokens;
  const estimatedCost = estimateCost(totalInputTokens, totalOutputTokens, pricing);

  return {
    assumptions: {
      workflow:
        'Estimativa para geração assistida por IA com prompts iterativos, contexto de arquitetura, geração de código, testes, revisão e correções.',
      includes: [
        'backend/API',
        'modelos e validações',
        'integrações descritas no backlog',
        'testes automatizados básicos',
        'iterações de correção após execução dos testes',
      ],
      excludes: [
        'tokens usados por IDEs ou agentes fora desta API',
        'custos de infraestrutura, banco de dados, gateway de pagamento ou hospedagem',
        'retrabalho por mudança de escopo',
      ],
    },
    tokenEstimate: {
      ...normalizedTokenEstimate,
      totalInputTokens: exactRange(totalInputTokens),
      totalOutputTokens: exactRange(totalOutputTokens),
      totalTokens: exactRange(totalTokens),
    },
    costEstimate: {
      currency: 'USD',
      inputCostPer1MTokens: pricing.inputCostPer1MTokens,
      outputCostPer1MTokens: pricing.outputCostPer1MTokens,
      min: estimatedCost,
      max: estimatedCost,
      display: {
        range: formatCurrency(estimatedCost),
        min: formatCurrency(estimatedCost),
        max: formatCurrency(estimatedCost),
        inputCostPer1MTokens: `${formatCurrency(pricing.inputCostPer1MTokens)} / 1M input tokens`,
        outputCostPer1MTokens: `${formatCurrency(pricing.outputCostPer1MTokens)} / 1M output tokens`,
      },
      note:
        'Custo calculado com aiPricing da request ou, se ausente, com AI_INPUT_COST_PER_1M_TOKENS e AI_OUTPUT_COST_PER_1M_TOKENS do ambiente. O backend usa a media dos ranges fornecidos pela LLM.',
    },
    display: {
      totalInputTokens: formatTokenValue(totalInputTokens),
      totalOutputTokens: formatTokenValue(totalOutputTokens),
      totalTokens: formatTokenValue(totalTokens),
      estimatedCost: formatCurrency(estimatedCost),
      pricing: `${formatCurrency(pricing.inputCostPer1MTokens)} / 1M input tokens, ${formatCurrency(pricing.outputCostPer1MTokens)} / 1M output tokens`,
    },
  };
};

const normalizeTokenEstimate = (tokenEstimate: AITokenEstimate): AITokenEstimate => ({
  planningAndContextTokens: normalizeRange(tokenEstimate.planningAndContextTokens),
  codeGenerationInputTokens: normalizeRange(tokenEstimate.codeGenerationInputTokens),
  codeGenerationOutputTokens: normalizeRange(tokenEstimate.codeGenerationOutputTokens),
  validationAndFixInputTokens: normalizeRange(tokenEstimate.validationAndFixInputTokens),
  validationAndFixOutputTokens: normalizeRange(tokenEstimate.validationAndFixOutputTokens),
});

const averageTokenEstimateRanges = (tokenEstimate: AITokenEstimate): AITokenEstimate => ({
  planningAndContextTokens: averageRange(tokenEstimate.planningAndContextTokens),
  codeGenerationInputTokens: averageRange(tokenEstimate.codeGenerationInputTokens),
  codeGenerationOutputTokens: averageRange(tokenEstimate.codeGenerationOutputTokens),
  validationAndFixInputTokens: averageRange(tokenEstimate.validationAndFixInputTokens),
  validationAndFixOutputTokens: averageRange(tokenEstimate.validationAndFixOutputTokens),
});

const normalizeRange = (range: TokenRange): TokenRange => ({
  min: Math.round(Math.min(range.min, range.max)),
  max: Math.round(Math.max(range.min, range.max)),
});

const averageRange = (range: TokenRange): number =>
  Math.round((range.min + range.max) / 2);

const exactRange = (value: number): TokenRange => ({
  min: value,
  max: value,
});

const sumValues = (...values: number[]): number =>
  values.reduce((total, current) => total + current, 0);

const estimateCost = (
  inputTokens: number,
  outputTokens: number,
  pricing: AICodeGenerationPricing,
): number => {
  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1MTokens;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1MTokens;

  return Number((inputCost + outputCost).toFixed(4));
};

const formatTokenValue = (value: number): string => `${formatInteger(value)} tokens`;

const formatInteger = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
