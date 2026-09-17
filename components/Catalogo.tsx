"use client";

import { useEffect, useMemo, useState } from "react";

type ItemCatalogo = {
  id: string;
  item: string;
  status: "Permitido" | "Não permitido";
  eixo: string;
  objeto: string;
  naturezas: string[];
  fontes: string[];
  descricao: string | null;
  especificacao: string | null;
  artRrt: string | null;
  manifestacaoPrevia: string | null;
  beneficiarios: string[];
  linhaOrigem: number;
};

type CatalogoPayload = {
  meta: {
    titulo: string;
    exercicio: number;
    atualizadoEm: string;
    linhasOrigem: number;
    totalItens: number;
  };
  itens: ItemCatalogo[];
};

type CatalogoManifest = {
  parts: string[];
};

const ITENS_POR_PAGINA = 50;

const eixoClasses: Record<string, string> = {
  "Pedagógico": "eixo-pedagogico",
  "Infraestrutura": "eixo-infraestrutura",
  "Convivência": "eixo-convivencia",
  "Tecnológico": "eixo-tecnologico",
  "Gestão Contábil da APM": "eixo-gestao",
};

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ItemModal({
  item,
  onClose,
}: {
  item: ItemCatalogo;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function copyName() {
    await navigator.clipboard.writeText(item.item);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const hasRequirements = item.artRrt || item.manifestacaoPrevia;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-topbar">
          <div className="modal-breadcrumb">
            <span className={`eixo-dot ${eixoClasses[item.eixo] ?? ""}`} />
            <span>{item.eixo}</span>
            <span className="breadcrumb-sep">/</span>
            <span>{item.objeto}</span>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar detalhes">
            <CloseIcon />
          </button>
        </div>

        <div className="modal-heading">
          <div>
            <div className={`status-badge ${item.status === "Permitido" ? "status-ok" : "status-no"}`}>
              {item.status}
            </div>
            <h2 id="modal-title">{item.item}</h2>
          </div>
          <button className="copy-button" onClick={copyName}>
            <CopyIcon />
            {copied ? "Copiado" : "Copiar nome"}
          </button>
        </div>

        <div className="modal-content">
          {item.status === "Permitido" && (
            <div className="detail-grid">
              <section className="detail-card">
                <p className="detail-label">Natureza da despesa</p>
                <div className="chip-list">
                  {item.naturezas.length ? item.naturezas.map((value) => (
                    <span className="chip chip-primary" key={value}>{value}</span>
                  )) : <span className="muted">Não indicada</span>}
                </div>
              </section>

              <section className="detail-card">
                <p className="detail-label">Fontes permitidas</p>
                <div className="chip-list">
                  {item.fontes.length ? item.fontes.map((value) => (
                    <span className="chip" key={value}>{value}</span>
                  )) : <span className="muted">Não indicada</span>}
                </div>
              </section>
            </div>
          )}

          {item.descricao && (
            <section className="detail-section">
              <p className="detail-label">Descrição</p>
              <p className="detail-text">{item.descricao}</p>
            </section>
          )}

          {item.especificacao && (
            <section className="detail-section">
              <p className="detail-label">Especificação</p>
              <p className="detail-text">{item.especificacao}</p>
            </section>
          )}

          {item.status === "Permitido" && (
            <>
              <section className="detail-section">
                <p className="detail-label">Exigências</p>
                <div className="requirement-grid">
                  <div>
                    <span>ART/RRT</span>
                    <strong>{item.artRrt ?? "Não informado"}</strong>
                  </div>
                  <div>
                    <span>Manifestação prévia da área</span>
                    <strong>{item.manifestacaoPrevia ?? "Não informado"}</strong>
                  </div>
                </div>
                {!hasRequirements && (
                  <p className="small-note">A planilha de origem não registra exigência específica para este item.</p>
                )}
              </section>

              <section className="detail-section">
                <p className="detail-label">Beneficiários</p>
                {item.beneficiarios.length ? (
                  <div className="chip-list spacious">
                    {item.beneficiarios.map((value) => (
                      <span className="chip chip-soft" key={value}>{value}</span>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Não há público específico marcado na planilha.</p>
                )}
              </section>
            </>
          )}

          {item.status === "Não permitido" && (
            <section className="warning-box">
              <strong>Item classificado como não permitido.</strong>
              <span>Não são exibidas natureza, fontes ou beneficiários porque esses critérios não se aplicam a itens vedados.</span>
            </section>
          )}
        </div>

        <footer className="modal-footer">
          <span>Referência: linha {item.linhaOrigem} da planilha de origem.</span>
          <button className="secondary-button" onClick={onClose}>Fechar</button>
        </footer>
      </section>
    </div>
  );
}

export default function Catalogo() {
  const [data, setData] = useState<CatalogoPayload | null>(null);
  const [loadingError, setLoadingError] = useState(false);
  const [query, setQuery] = useState("");
  const [eixo, setEixo] = useState("Todos");
  const [objeto, setObjeto] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [natureza, setNatureza] = useState("Todas");
  const [fonte, setFonte] = useState("Todas");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ItemCatalogo | null>(null);

  useEffect(() => {
    async function loadCatalogo() {
      try {
        if (typeof DecompressionStream === "undefined") {
          throw new Error("O navegador não oferece suporte à descompressão do catálogo.");
        }

        const manifestResponse = await fetch("/data/catalogo.parts.json");
        if (!manifestResponse.ok) throw new Error("Falha ao carregar manifesto do catálogo");
        const manifest = (await manifestResponse.json()) as CatalogoManifest;
        if (!Array.isArray(manifest.parts) || manifest.parts.length === 0) {
          throw new Error("Manifesto do catálogo inválido");
        }

        const partResponses = await Promise.all(manifest.parts.map((part) => fetch(part)));
        if (partResponses.some((response) => !response.ok)) {
          throw new Error("Falha ao carregar uma parte do catálogo");
        }

        const encodedParts = await Promise.all(partResponses.map((response) => response.text()));
        const encoded = encodedParts.join("").replace(/\s+/g, "");
        const binary = atob(encoded);
        const compressed = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          compressed[index] = binary.charCodeAt(index);
        }

        const decompressed = new Blob([compressed])
          .stream()
          .pipeThrough(new DecompressionStream("gzip"));
        const payload = (await new Response(decompressed).json()) as CatalogoPayload;
        setData(payload);
      } catch (error) {
        console.error(error);
        setLoadingError(true);
      }
    }

    loadCatalogo();
  }, []);

  const eixos = useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    data.itens.forEach((item) => counts.set(item.eixo, (counts.get(item.eixo) ?? 0) + 1));
    return Array.from(counts.entries()).map(([nome, total]) => ({ nome, total }));
  }, [data]);

  const objetos = useMemo(() => {
    if (!data) return [];
    const values = data.itens
      .filter((item) => eixo === "Todos" || item.eixo === eixo)
      .map((item) => item.objeto);
    return Array.from(new Set<string>(values)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [data, eixo]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = normalize(query);

    return data.itens
      .filter((item) => eixo === "Todos" || item.eixo === eixo)
      .filter((item) => objeto === "Todos" || item.objeto === objeto)
      .filter((item) => status === "Todos" || item.status === status)
      .filter((item) => natureza === "Todas" || item.naturezas.includes(natureza))
      .filter((item) => fonte === "Todas" || item.fontes.includes(fonte))
      .filter((item) => {
        if (!q) return true;
        const searchable = normalize([
          item.item,
          item.eixo,
          item.objeto,
          item.status,
          item.descricao,
          item.especificacao,
          ...item.fontes,
          ...item.naturezas,
          ...item.beneficiarios,
        ].filter(Boolean).join(" "));
        return searchable.includes(q);
      })
      .sort((a, b) => a.item.localeCompare(b.item, "pt-BR"));
  }, [data, query, eixo, objeto, status, natureza, fonte]);

  useEffect(() => {
    setPage(1);
  }, [query, eixo, objeto, status, natureza, fonte]);

  useEffect(() => {
    if (objeto !== "Todos" && !objetos.includes(objeto)) setObjeto("Todos");
  }, [objetos, objeto]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITENS_POR_PAGINA));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * ITENS_POR_PAGINA, currentPage * ITENS_POR_PAGINA);
  const hasFilters = query || eixo !== "Todos" || objeto !== "Todos" || status !== "Todos" || natureza !== "Todas" || fonte !== "Todas";

  function clearFilters() {
    setQuery("");
    setEixo("Todos");
    setObjeto("Todos");
    setStatus("Todos");
    setNatureza("Todas");
    setFonte("Todas");
  }

  if (loadingError) {
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <h1>Não foi possível carregar o catálogo.</h1>
          <p>Tente atualizar a página. O arquivo de dados não respondeu corretamente.</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="loading-screen">
        <div className="loader" />
        <p>Carregando catálogo...</p>
      </main>
    );
  }

  return (
    <>
      <main>
        <header className="hero">
          <div className="hero-inner">
            <div className="brand">
              <div className="brand-mark" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div>
                <p className="eyebrow">PDDE Paulista · 2026</p>
                <h1>Catálogo de Itens</h1>
              </div>
            </div>

            <div className="hero-copy">
              <p>Consulte materiais, serviços e itens permitidos ou vedados por eixo, objeto, natureza e fonte de recurso.</p>
              <div className="meta-row">
                <span>{data.meta.totalItens.toLocaleString("pt-BR")} itens</span>
                <span>{eixos.length} eixos</span>
                <span>Atualizado em {data.meta.atualizadoEm}</span>
              </div>
            </div>

            <div className="search-box">
              <SearchIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar item, objeto, descrição, especificação..."
                aria-label="Buscar no catálogo"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Limpar busca">
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="workspace">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Navegue por eixo</p>
              <h2>Selecione uma área ou pesquise em todo o catálogo</h2>
            </div>
            {hasFilters && (
              <button className="text-button" onClick={clearFilters}>Limpar filtros</button>
            )}
          </div>

          <div className="axis-grid">
            <button className={`axis-card eixo-todos ${eixo === "Todos" ? "active" : ""}`} onClick={() => setEixo("Todos")}>
              <span className="axis-icon">∞</span>
              <span className="axis-info">
                <strong>Todos os eixos</strong>
                <small>{data.meta.totalItens.toLocaleString("pt-BR")} itens</small>
              </span>
            </button>
            {eixos.map((entry) => (
              <button
                key={entry.nome}
                className={`axis-card ${eixoClasses[entry.nome] ?? ""} ${eixo === entry.nome ? "active" : ""}`}
                onClick={() => setEixo(entry.nome)}
              >
                <span className="axis-icon">{entry.nome.charAt(0)}</span>
                <span className="axis-info">
                  <strong>{entry.nome}</strong>
                  <small>{entry.total.toLocaleString("pt-BR")} itens</small>
                </span>
              </button>
            ))}
          </div>

          <div className="filter-panel">
            <div className="filter-title">
              <FilterIcon />
              <span>Refinar resultados</span>
            </div>

            <div className="filter-grid">
              <label>
                <span>Objeto</span>
                <div className="select-wrap">
                  <select value={objeto} onChange={(event) => setObjeto(event.target.value)}>
                    <option value="Todos">Todos os objetos</option>
                    {objetos.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                  <ChevronDown />
                </div>
              </label>

              <label>
                <span>Situação</span>
                <div className="select-wrap">
                  <select value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="Todos">Todos</option>
                    <option value="Permitido">Permitidos</option>
                    <option value="Não permitido">Não permitidos</option>
                  </select>
                  <ChevronDown />
                </div>
              </label>

              <label>
                <span>Natureza</span>
                <div className="select-wrap">
                  <select value={natureza} onChange={(event) => setNatureza(event.target.value)}>
                    <option value="Todas">Todas</option>
                    <option value="Custeio">Custeio</option>
                    <option value="Capital">Capital</option>
                  </select>
                  <ChevronDown />
                </div>
              </label>

              <label>
                <span>Fonte</span>
                <div className="select-wrap">
                  <select value={fonte} onChange={(event) => setFonte(event.target.value)}>
                    <option value="Todas">Todas</option>
                    <option value="FUNDEB">FUNDEB</option>
                    <option value="QESE">QESE</option>
                    <option value="Tesouro">Tesouro</option>
                    <option value="Royalties">Royalties</option>
                  </select>
                  <ChevronDown />
                </div>
              </label>
            </div>
          </div>

          <section className="results-section">
            <div className="results-heading">
              <div>
                <h2>Itens encontrados</h2>
                <p>
                  {filtered.length.toLocaleString("pt-BR")} resultado{filtered.length === 1 ? "" : "s"}
                  {eixo !== "Todos" ? ` em ${eixo}` : ""}
                </p>
              </div>
              <span className="page-indicator">Página {currentPage} de {totalPages}</span>
            </div>

            {pageItems.length ? (
              <div className="catalog-table" role="table" aria-label="Itens do catálogo">
                <div className="catalog-head" role="row">
                  <span>Eixo</span>
                  <span>Objeto</span>
                  <span>Item</span>
                  <span>Situação</span>
                  <span>Natureza</span>
                </div>
                <div className="catalog-body">
                  {pageItems.map((item) => (
                    <button
                      className="catalog-row"
                      key={item.id}
                      onClick={() => setSelected(item)}
                      role="row"
                    >
                      <span className="catalog-cell eixo-cell" data-label="Eixo">
                        <span className={`eixo-dot ${eixoClasses[item.eixo] ?? ""}`} />
                        {item.eixo}
                      </span>
                      <span className="catalog-cell" data-label="Objeto">{item.objeto}</span>
                      <span className="catalog-cell item-cell" data-label="Item">{item.item}</span>
                      <span className="catalog-cell" data-label="Situação">
                        <span className={`status-badge ${item.status === "Permitido" ? "status-ok" : "status-no"}`}>
                          {item.status}
                        </span>
                      </span>
                      <span className="catalog-cell" data-label="Natureza">
                        {item.status === "Permitido" && item.naturezas.length ? (
                          <span className="natureza-text">{item.naturezas.join(" + ")}</span>
                        ) : <span className="muted">—</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <SearchIcon />
                <h3>Nenhum item encontrado</h3>
                <p>Altere os termos da busca ou remova algum filtro.</p>
                <button className="secondary-button" onClick={clearFilters}>Limpar filtros</button>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Paginação do catálogo">
                <button
                  className="secondary-button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Anterior
                </button>
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter((value) => value === 1 || value === totalPages || Math.abs(value - currentPage) <= 2)
                    .map((value, index, arr) => (
                      <span key={value} className="page-group">
                        {index > 0 && value - arr[index - 1] > 1 && <span className="ellipsis">…</span>}
                        <button
                          className={value === currentPage ? "active" : ""}
                          onClick={() => setPage(value)}
                          aria-current={value === currentPage ? "page" : undefined}
                        >
                          {value}
                        </button>
                      </span>
                    ))}
                </div>
                <button
                  className="secondary-button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Próxima
                </button>
              </nav>
            )}
          </section>
        </section>

        <footer className="site-footer">
          <div>
            <strong>Catálogo de Itens do PDDE Paulista · 2026</strong>
            <span>Base organizada a partir da planilha oficial fornecida para consulta.</span>
          </div>
          <span>{data.meta.linhasOrigem.toLocaleString("pt-BR")} linhas de origem · {data.meta.totalItens.toLocaleString("pt-BR")} itens catalogados</span>
        </footer>
      </main>

      {selected && <ItemModal item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
