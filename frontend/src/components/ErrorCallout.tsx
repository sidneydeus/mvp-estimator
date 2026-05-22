import type { ReactNode } from 'react';

export function ErrorCallout(props: { title: string; children?: ReactNode }) {
  return (
    <div className="callout danger" role="alert">
      <strong>{props.title}</strong>
      {props.children ? <div style={{ marginTop: 8 }}>{props.children}</div> : null}
    </div>
  );
}

