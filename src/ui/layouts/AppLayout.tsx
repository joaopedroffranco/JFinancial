import { NavLink, Outlet } from 'react-router-dom';

import { Button, Icon, Text } from '../design-system';
import './app-layout.css';

interface AnalysisMonthNavigationItem {
  label: string;
  slug: string;
}

interface AnalysisYearNavigationSection {
  months: readonly AnalysisMonthNavigationItem[];
  year: number;
}

const analysisSections: readonly AnalysisYearNavigationSection[] = [];

function navigationClassName({ isActive }: { isActive: boolean }) {
  return `app-layout__nav-link${isActive ? ' app-layout__nav-link--active' : ''}`;
}

export function AppLayout() {
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
            {analysisSections.map(({ months, year }) => (
              <section
                aria-labelledby={`analysis-year-${year}`}
                className="app-layout__year-section"
                key={year}
              >
                <Text as="span" id={`analysis-year-${year}`}>{year}</Text>
                <div className="app-layout__months">
                  {months.map(({ label, slug }) => (
                    <NavLink
                      className={navigationClassName}
                      key={slug}
                      to={`/analises/${year}/${slug}`}
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="app-layout__action">
          <Button disabled title="Disponível em breve">
            <Icon name="add" size="sm" />
            Nova análise
          </Button>
          <Text as="small" variant="caption">Novo fluxo em breve</Text>
        </div>
      </aside>

      <div className="app-layout__content">
        <Outlet />
      </div>
    </div>
  );
}
