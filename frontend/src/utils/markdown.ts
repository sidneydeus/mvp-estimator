import type { BacklogResult, Epic, UserStory } from '../domain/types';

function escapeMd(text: string) {
  return text.replace(/\r\n/g, '\n').trim();
}

function storyToMd(story: UserStory) {
  const ac = story.acceptanceCriteria?.length
    ? story.acceptanceCriteria.map((c) => `    - ${escapeMd(c)}`).join('\n')
    : '    - (sem critérios)';

  return [
    `- **${escapeMd(story.title)}** (\`${story.id}\`)`,
    `  - Descrição: ${escapeMd(story.description)}`,
    `  - Critérios de aceitação:`,
    ac,
    `  - Tokens (complexidade): **${story.complexityTokens}**`,
  ].join('\n');
}

function epicToMd(epic: Epic) {
  const storiesMd = epic.stories?.length
    ? epic.stories.map((s) => storyToMd(s)).join('\n\n')
    : '- (sem histórias)';

  return [
    `## ${escapeMd(epic.title)} (\`${epic.id}\`)`,
    '',
    escapeMd(epic.description),
    '',
    '### User Stories',
    '',
    storiesMd,
  ].join('\n');
}

export function backlogToMarkdown(result: BacklogResult) {
  const epicsMd = result.epics?.length ? result.epics.map((e) => epicToMd(e)).join('\n\n') : '';

  return [
    '# MVP Estimator — Backlog e Estimativa',
    '',
    '## Visão',
    '',
    escapeMd(result.vision),
    '',
    '## Estimativa',
    '',
    `- Tokens totais: **${result.totalTokens}**`,
    `- Horas estimadas: **${result.estimatedHours.min}h** — **${result.estimatedHours.max}h**`,
    '',
    '---',
    '',
    epicsMd,
    '',
    '---',
    '',
    '_Observação: estimativas são aproximadas e podem variar conforme refinamento._',
    '',
  ].join('\n');
}

