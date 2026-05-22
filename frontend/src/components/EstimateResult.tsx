import type { BacklogResult } from '../domain/types';
import { ExportMarkdownButton } from './ExportMarkdownButton';

export function EstimateResult(props: { result: BacklogResult }) {
  const codeGen = props.result.aiCodeGenerationEstimate;

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="sectionTitle" style={{ margin: 0 }}>
          2) Resultado
        </h3>
        <ExportMarkdownButton result={props.result} />
      </div>

      <div className="callout ok" style={{ marginTop: 12 }}>
        <strong>Estimativa de Desenvolvimento</strong>
        <div className="row" style={{ marginTop: 8 }}>
          <span className="badge">
            Tokens Totais: <code>{codeGen?.display.totalTokens || 'N/A'}</code>
          </span>
          <span className="badge">
            Custo Estimado (IA): <code>{codeGen?.display.estimatedCost || 'N/A'}</code>
          </span>
          <span className="badge">
            Custo Funcional (Escopo): <code>{codeGen?.display.complexityTotalCost || 'N/A'}</code>
          </span>
          <span className="badge">
            Horas: <code>{props.result.estimatedHours.min}h</code> —{' '}
            <code>{props.result.estimatedHours.max}h</code>
          </span>
        </div>
        {codeGen && (
          <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
            <div className="row" style={{ gap: 15 }}>
              <span className="muted" style={{ fontSize: '0.85em' }}>
                Entrada: <strong>{codeGen.display.totalInputTokens}</strong>
              </span>
              <span className="muted" style={{ fontSize: '0.85em' }}>
                Saída: <strong>{codeGen.display.totalOutputTokens}</strong>
              </span>
            </div>
            <p className="muted" style={{ margin: '5px 0 0', fontSize: '0.85em' }}>
              Preço base: {codeGen.display.pricing}
            </p>
          </div>
        )}
        <p className="muted" style={{ margin: '10px 0 0' }}>
          Observação: o custo considera preços diferentes para tokens de entrada e saída.
        </p>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3 className="sectionTitle">Visão e Análise do MVP</h3>
        <div className="callout">
          <div style={{ whiteSpace: 'pre-wrap' }}>{props.result.vision}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3 className="sectionTitle">Backlog Gerado</h3>
        {props.result.epics.map((epic) => (
          <div key={epic.id} className="epic">
            <h4>
              {epic.title} <span className="muted">({epic.id})</span>
            </h4>
            <div className="muted">{epic.description}</div>

            {epic.stories.map((story) => (
              <div key={story.id} className="story">
                <div>
                  <strong>{story.title}</strong> <span className="muted">({story.id})</span>
                </div>
                <div className="muted">{story.description}</div>
                <div className="muted" style={{ marginTop: 8 }}>
                  Pontos de Complexidade: <strong>{story.complexityPoints}</strong>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div className="muted">Critérios de aceitação:</div>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                    {story.acceptanceCriteria.map((c, idx) => (
                      <li key={idx} className="muted">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

