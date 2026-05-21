export function IdeaForm(props: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength: number;
}) {
  const remaining = props.maxLength - props.value.length;
  return (
    <div className="card">
      <h3 className="sectionTitle">1) Descreva sua ideia</h3>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        maxLength={props.maxLength}
        placeholder="Ex: Quero um app que permita..."
      />
      <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
        <span className="muted">
          Limite: <strong>{props.maxLength}</strong> caracteres • Restantes:{' '}
          <strong>{remaining}</strong>
        </span>
        <span className="muted">Dica: inclua público-alvo, features e restrições.</span>
      </div>
    </div>
  );
}

