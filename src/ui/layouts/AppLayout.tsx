import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { getMonthlyAnalyses } from '../../application/monthly-analyses';
import type { MonthlyAnalysis } from '../../domain/monthly-analysis';
import { getMonthName } from '../../utils/date';
import { Icon, Text } from '../design-system';
import './app-layout.css';

function navigationClassName({ isActive }: { isActive: boolean }) {
  return `app-layout__nav-link${isActive ? ' app-layout__nav-link--active' : ''}`;
}

export function AppLayout() {
  const location = useLocation();
  const [analyses, setAnalyses] = useState<MonthlyAnalysis[]>([]);

  useEffect(() => {
    void getMonthlyAnalyses().then(setAnalyses);
  }, [location.pathname]);

  const analysisSections = Object.entries(
    analyses.reduce<Record<string, MonthlyAnalysis[]>>((sections, analysis) => {
      const year = analysis.period.slice(0, 4);
      sections[year] = [...(sections[year] ?? []), analysis];
      return sections;
    }, {}),
  );

  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar">
        <NavLink className="app-layout__brand" to="/" aria-label="Ir para o início">
          <span className="app-layout__brand-mark" aria-hidden="true">J</span>
          <span>JFinancial</span>
        </NavLink>

        <nav className="app-layout__navigation" aria-label="Navegação principal">
          <NavLink className={navigationClassName} end to="/">
            <Icon name="home" size="sm" />
            João
          </NavLink>
          <NavLink className={navigationClassName} to="/contas-fixas">
            <Icon name="wallet" size="sm" />
            Contas fixas
          </NavLink>

          <div className="app-layout__periods">
            <Text as="span" variant="caption">Análises mensais</Text>
            {analysisSections.map(([year, yearAnalyses]) => (
              <section
                aria-labelledby={`analysis-year-${year}`}
                className="app-layout__year-section"
                key={year}
              >
                <Text as="span" id={`analysis-year-${year}`}>{year}</Text>
                <div className="app-layout__months">
                  {yearAnalyses.map((analysis) => (
                    <NavLink
                      className={navigationClassName}
                      key={analysis.id}
                      to={`/analises/${analysis.id}`}
                    >
                      {getMonthName(Number(analysis.period.slice(5)))}
                    </NavLink>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="app-layout__action">
          <NavLink className="app-layout__new-analysis" to="/analises/nova">
            <Icon name="add" size="sm" />
            Nova análise
          </NavLink>
          <Text as="small" variant="caption">Importar movimentações</Text>
        </div>
      </aside>

      <div className="app-layout__content">
        <Outlet />
      </div>
    </div>
  );
}
