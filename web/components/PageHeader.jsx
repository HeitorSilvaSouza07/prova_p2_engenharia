export default function PageHeader({ title, sub, action }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-head__title">{title}</h1>
        <p className="page-head__sub">{sub}</p>
      </div>
      {action ? <div className="page-head__action">{action}</div> : null}
    </div>
  );
}
