'use client';

import { useMemo, useState } from 'react';

export default function DataTable({
  title,
  sub,
  rows,
  columns,
  searchPlaceholder = 'Buscar...',
  filterOptions = null,
  filterLabel = 'Status',
  groupOf,
  emptyText = 'Nenhum registro encontrado.',
  actions,
  children,
}) {
  const [termo, setTermo] = useState('');
  const [filtro, setFiltro] = useState('');

  const filtered = useMemo(() => {
    const termoLower = termo.trim().toLowerCase();
    return rows.filter((row) => {
      const texto = JSON.stringify(row).toLowerCase();
      const matchesText = !termoLower || texto.includes(termoLower);
      const group = groupOf ? String(groupOf(row)) : '';
      const matchesFilter = !filtro || group === filtro;
      return matchesText && matchesFilter;
    });
  }, [rows, termo, filtro, groupOf]);

  return (
    <section className="card" data-table>
      <div className="card__head">
        <div>
          <h2 className="card__title">{title}</h2>
          <p className="card__sub">
            <span data-table-count>
              {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
            </span>
            {sub ? <> {sub}</> : null}
          </p>
        </div>
      </div>

      <div className="toolbar">
        <label className="field">
          <span>Buscar</span>
          <input
            type="search"
            data-table-search
            placeholder={searchPlaceholder}
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
          />
        </label>
        {filterOptions ? (
          <label className="field">
            <span>{filterLabel}</span>
            <select data-table-filter value={filtro} onChange={(event) => setFiltro(event.target.value)}>
              <option value="">Todos</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="toolbar__spacer" />
        {children}
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key || column.label}>{column.label}</th>
              ))}
              {actions ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} data-row data-group={groupOf ? String(groupOf(row)) : undefined}>
                {columns.map((column) => (
                  <td key={column.key || column.label}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
                {actions ? <td className="actions">{actions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
          <tbody>
            <tr data-table-empty hidden={filtered.length !== 0}>
              <td colSpan={columns.length + (actions ? 1 : 0)}>
                <div className="table-empty">
                  <img src="/assets/img/mascot-confused.svg" alt="" />
                  <p className="mb-0">{emptyText}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
