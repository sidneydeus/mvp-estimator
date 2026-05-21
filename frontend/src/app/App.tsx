import { EstimatorPage } from '../pages/EstimatorPage';

export function App() {
  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="title">MVP Estimator</h1>
          <p className="subtitle">
            Cole a sua ideia, gere um backlog e obtenha uma estimativa baseada em tokens. Tempo de
            resposta pode chegar a 60s.
          </p>
        </div>
        <span className="badge">
          API: <code>/estimate</code>
        </span>
      </div>

      <div className="grid">
        <EstimatorPage />
      </div>
    </div>
  );
}
