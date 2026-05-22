import type { BacklogResult } from '../domain/types';
import { ExportMarkdownButton } from './ExportMarkdownButton';

export function EstimateResult(props: { result: BacklogResult }) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="sectionTitle" style={{ margin: 0 }}>
          2) Resultado
        </h3>
        <ExportMarkdownButton result={props.result} />
      </div>

      <div className="callout ok" style={{ marginTop: 12 }}>
        <strong>Estimativa</strong>
        <div className="row" style={{ marginTop: 8 }}>
          <span className="badge">
            Tokens: <code>{props.result.totalTokens}</code>
          </span>
          <span className="badge">
            Horas: <code>{props.result.estimatedHours.min}h</code> —{' '}
            <code>{props.result.estimatedHours.max}h</code>
          </span>
        </div>
        <p className="muted" style={{ margin: '10px 0 0' }}>
          Observação: estimativas são aproximadas e podem variar após refinamento.
        </p>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3 className="sectionTitle">Visão</h3>
        <div className="callout">
          <span>{props.result.vision}</span>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3 className="sectionTitle">Backlog</h3>
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
                  Tokens (complexidade): <strong>{story.complexityTokens}</strong>
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

